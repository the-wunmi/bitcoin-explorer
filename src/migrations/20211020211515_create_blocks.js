exports.up = function(knex) {
  return knex.schema.createTable('blocks', function(table) {
    table.bigInteger('id').notNullable().primary();
    table.text('hash').notNullable();
    table.timestamp('started_on').notNullable();
    table.timestamp('completed_on');
  })
};

exports.down = function(knex) {
  
};
