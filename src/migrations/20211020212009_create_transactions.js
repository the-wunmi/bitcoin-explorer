exports.up = function(knex) {
  return knex.schema.createTable('transactions', function(table) {
    table.bigIncrements();
    table.bigInteger('block_id').references('id').inTable('blocks').notNullable();
    table.text('txid').notNullable();
  })
};

exports.down = function(knex) {
  
};
