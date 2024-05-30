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

    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS industries (
        code TEXT PRIMARY KEY,
        industry TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS companies (
        code TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        comp_code TEXT REFERENCES companies(code) ON DELETE CASCADE,
        amt FLOAT NOT NULL,
        paid BOOLEAN DEFAULT false NOT NULL,
        add_date DATE DEFAULT CURRENT_DATE NOT NULL,
        paid_date DATE,
        CONSTRAINT invoices_amt_check CHECK (amt > 0)
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.end();
  }
};
