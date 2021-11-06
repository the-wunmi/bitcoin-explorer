require('dotenv').config({ path: '.env' });

const express = require('express');
const app = express();

const listener = app.listen(process.env.PORT, () => {
  console.log(`Service started on http://localhost:${listener.address().port}`)
});

module.exports = app