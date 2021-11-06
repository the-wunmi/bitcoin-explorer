require('dotenv').config({ path: '.env' });

const cluster = require("cluster")
const os = require('os');

const { raw } = require("objection");
const { startup, getBlock, getBlockChainInfo } = require("./helpers");
const { Block } = require("./models");
const knex = require('./models/db');
const arg1 = process.argv.slice(2)[0]

async function init() {
  console.time('setup')
  const block = arg1?.length === 64 ? arg1 : null
  if (block) await processNewlyMinedBlock(block)
  if (cluster.isMaster) processMasterCluster()
  else processWorkerClusters()
}

async function processNewlyMinedBlock(block) {
  console.timeLog('setup', 'process new block ' + block)
  await processBlock(block)
  process.exit()
}

async function processMasterCluster() {
  console.timeLog('setup', 'process master cluster ' + process.pid)
  let info = await startup()
  const blocks = await getBlocks(info.blocks, info.pruneheight);
  const workers = distributeBlocksToWorkers(blocks)
  if (!blocks.length) periodicallyCheckForBlockUpdates(workers)
}

async function periodicallyCheckForBlockUpdates(workers) {
  const interval = setInterval(async () => {
    console.timeLog('setup', `periodically checking for block updates with  ${workers.length} workers`)
    const blocks = await checkForBlockUpdate(workers)
    if (blocks.length) {
      distributeBlocksToWorkers(blocks, workers)
      return clearInterval(interval)
    }
  }, 5000)
  return interval
}

async function checkForBlockUpdate(workers) {
  console.timeLog('setup', `checking for block updates with  ${workers.length} workers`)
  let info = await getBlockChainInfo()
  const blocks = await getBlocks(info.blocks, info.pruneheight);
  return blocks
}

async function processWorkerClusters() {
  process.on('message', async (msg) => {
    if (msg.blocks) {
      for (const block of msg.blocks) {
        await processBlock(block)
      }
    }
  })
}

function distributeBlocksToWorkers(blocks, workers = generateWorkers()) {
  console.timeLog('setup', `distributing ${blocks.length} blocks to ${workers.length} workers.`)
  const parts = Math.ceil(blocks.length / workers.length)
  for (let i = 0; i < workers.length; i++) {
    workers[i].send({ blocks: blocks.slice(i * parts, (i + 1) * parts) })
  }
  return workers
}

function generateWorkers() {
  console.timeLog('setup', 'generating workers')
  const cpu_length = os.cpus().length;
  const workers = [];
  for (let i = 0; i < cpu_length; i++) {
    const worker = cluster.fork()
    workers.push(worker)
  }
  return workers
}

async function getBlocks(count, pruneheight = 0) {
  console.timeLog('setup', `getting ${count} blocks`)
  try {
    const processed_logs = await Block.query().select(['id']).limit()
    const processed_blocks = processed_logs.map(({ id }) => parseInt(id))
    const blocks = [];
    for (let height = count; (height >= pruneheight) && (height >= 0); height--) {
      if (processed_blocks.includes(height)) continue
      blocks.push(height)
    }
    return blocks.reverse()
  } catch (error) {
    console.error(error)
    return []
  }
}

async function processBlock(block_hash_or_height) {
  console.timeLog('setup', `processing block ${block_hash_or_height}`)
  let trx = null;
  try {
    const block = await getBlock(block_hash_or_height)
    await Block.query().insert({ id: block.height, hash: block.hash, started_on: raw('NOW()') }).catch(() => { })
    trx = await knex.transaction();
    const log = await Block.query(trx).findOne({ id: block.height })
      .forUpdate().withGraphFetched({ transactions: true })
    if (!log) return []
    if (log.completed_on) return log.transactions
    const transactions = block.tx
    if (transactions.length) {
      await trx.raw(`INSERT INTO transactions (block_id, txid) VALUES ${transactions.map((transaction) => {
        return `('${log.id}', '${transaction.txid}')`
      })}`)
    }
    await log.$query(trx).patch({ completed_on: raw('NOW()') })
    await trx.commit()
    return transactions;
  } catch (error) {
    console.error(error)
    return null
  } finally {
    if (trx && !trx.isCompleted()) {
      await trx?.rollback()
    }
  }
}

// do not initialize for test suite
if (arg1 !== '--timeout')
  init()

exports.processBlock = processBlock