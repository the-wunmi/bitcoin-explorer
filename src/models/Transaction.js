const BaseModel = require("./base");

class Transaction extends BaseModel {
  static get tableName() {
    return 'transactions';
  }
}

module.exports = Transaction;
