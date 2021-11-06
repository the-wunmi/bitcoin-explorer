const BaseModel = require("./base");

class Block extends BaseModel {
  static get tableName() {
    return 'blocks';
  }

  static get relationMappings() {
    const Transaction = require('./Transaction');
    return {
      transactions: {
        relation: BaseModel.HasManyRelation,
        modelClass: Transaction,
        join: {
          from: 'transactions.block_id',
          to: 'blocks.id'
        }
      }
    };
  }
}

module.exports = Block;
