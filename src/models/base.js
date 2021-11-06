const Model = require('objection').Model;
const knex = require('./db');

Model.knex(knex);

class Base extends Model {
  $formatJson(json) {
    json = super.$formatJson(json);
    delete json.created_by;
    delete json.modified_by;
    delete json.deleted_flag;
    delete json.deleted_on;
    delete json.deleted_by;
    return json;
  }
}

module.exports = Base