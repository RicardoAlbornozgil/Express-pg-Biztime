/** Database setup for BizTime. */

require('dotenv').config();
const { Client } = require("pg");

const client = new Client({
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
});

console.log(process.env.DATABASE_USER); // Should print 'postgres'
console.log(process.env.DATABASE_PASSWORD); // Should print your password
console.log(process.env.DATABASE_HOST); // Should print 'localhost'
console.log(process.env.DATABASE_PORT); // Should print '5432'
console.log(process.env.DATABASE_NAME); // Should print 'biztime'

client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Error connecting to PostgreSQL', err));

module.exports = client;
