require('dotenv').config();

module.exports = {
  client: 'pg',
  connection: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: __dirname + '/src/migrations'
  }
};
