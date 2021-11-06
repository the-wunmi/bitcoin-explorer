const { execSync, spawn } = require('child_process')

/**
 * 
 * 
 */
exports.startup = async () => {
  return new Promise((resolve, reject) => {
    try {
      execSync(`bitcoind -daemon -blocknotify="$(pwd)/listener.sh %s"`)
    } catch (error) {}
    const interval = setInterval(async () => {
      try {
        const stdout = execSync('bitcoin-cli getblockchaininfo')
        clearInterval(interval)
        return resolve(JSON.parse(stdout))
      } catch (error) {
        if (error.status != '28') {
          clearInterval(interval)
          reject(error)
        }
      }
    }, 3_000)
  })
}

exports.getBlockChainInfo = async () => {
  const stdout = execSync('bitcoin-cli getblockchaininfo')
  return JSON.parse(stdout)
}

/**
 * 
 * @param {number|string} block_hash_or_height 
 * @returns 
 */
exports.getBlock = async (block_hash_or_height) => {
  let hash = null 
  if (Number.isFinite(block_hash_or_height)) {
    hash =  execSync('bitcoin-cli getblockhash ' + block_hash_or_height).toString().split('\n')[0]
  } else {
    hash = block_hash_or_height
  }

  const data = await new Promise((resolve, reject) => {
    let data = "", error = "";

    const spawned_process = spawn('bitcoin-cli', ['getblock', hash, '2']);

    spawned_process.on("message", console.log);

    spawned_process.stdout.on("data", chunk => {
      data += chunk.toString();
    });

    spawned_process.stderr.on("data", chunk => {
      error += chunk.toString();
    });

    spawned_process.on("close", function (code) {
      spawned_process.kill()
      if (code > 0) return reject(new Error(error));
      resolve(data);
    });

    spawned_process.on("error", err => {
      spawned_process.kill()
      reject(err)
    });
  });
  return JSON.parse(data)
}
