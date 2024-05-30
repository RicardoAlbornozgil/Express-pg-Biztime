const { Client } = require('pg');

module.exports = async () => {
  const client = new Client({
    // Your database configuration
    user: 'your_username',
    host: 'your_host',
    database: 'your_database',
    password: 'your_password',
    port: 5432, // Default port for PostgreSQL
  });

  try {
    await client.connect();
    // Optionally, drop tables or perform other cleanup tasks
    await client.query('DROP TABLE IF EXISTS industries, companies, invoices');
  } catch (error) {
    console.error('Error during global teardown:', error);
  } finally {
    await client.end();
  }
};
