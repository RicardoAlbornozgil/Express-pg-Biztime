const request = require('supertest');
const app = require('../src/app');
const client = require('../src/db');

// Sample data for testing
const sampleInvoices = [
  { id: 1, comp_code: 'apple', amt: 100, paid: false, add_date: '2024-01-01', paid_date: null },
  { id: 2, comp_code: 'apple', amt: 200, paid: false, add_date: '2024-02-01', paid_date: null },
  { id: 3, comp_code: 'apple', amt: 300, paid: true, add_date: '2024-03-01', paid_date: '2024-03-15' }
];

beforeAll(async () => {
  // Create necessary tables
  await client.query(`
    CREATE TABLE companies (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    )
  `);

  await client.query(`
    CREATE TABLE invoices (
      id SERIAL PRIMARY KEY,
      comp_code TEXT REFERENCES companies(code) ON DELETE CASCADE,
      amt FLOAT NOT NULL,
      paid BOOLEAN DEFAULT false NOT NULL,
      add_date DATE DEFAULT CURRENT_DATE NOT NULL,
      paid_date DATE,
      CONSTRAINT invoices_amt_check CHECK (amt > 0)
    )
  `);

  // Insert sample data into the companies table
  await client.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('apple', 'Apple', 'Maker of iOS devices'), ('ibm', 'IBM', 'Technology company')
  `);

  // Insert sample data into the invoices table
  await Promise.all(sampleInvoices.map(invoice =>
    client.query(`
      INSERT INTO invoices (id, comp_code, amt, paid, add_date, paid_date)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [invoice.id, invoice.comp_code, invoice.amt, invoice.paid, invoice.add_date, invoice.paid_date])
  ));
});

afterAll(async () => {
  // Drop the tables to clean up after testing
  await client.query('DROP TABLE invoices');
  await client.query('DROP TABLE companies');
  await client.end();
});

describe('GET /invoices', () => {
  test('It should respond with an array of invoices', async () => {
    const response = await request(app).get('/invoices');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ invoices: sampleInvoices });
  });
});

describe('GET /invoices/:id', () => {
  test('It should respond with a single invoice', async () => {
    const response = await request(app).get('/invoices/1');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ invoice: sampleInvoices[0] });
  });

  test('It should respond with 404 if invoice does not exist', async () => {
    const response = await request(app).get('/invoices/999');

    expect(response.statusCode).toBe(404);
  });
});

describe('POST /invoices', () => {
  test('It should create a new invoice', async () => {
    const newInvoice = { comp_code: 'ibm', amt: 400, paid: false };
    const response = await request(app)
      .post('/invoices')
      .send(newInvoice);

    expect(response.statusCode).toBe(201);
    expect(response.body.invoice).toMatchObject(newInvoice);
    expect(response.body.invoice.id).toBeDefined(); // Ensure ID is generated
  });

  test('It should respond with 400 if missing required fields', async () => {
    const invalidInvoice = { comp_code: 'apple' }; // Missing 'amt' field
    const response = await request(app)
      .post('/invoices')
      .send(invalidInvoice);

    expect(response.statusCode).toBe(400);
  });
});

describe('PUT /invoices/:id', () => {
  test('It should update an existing invoice', async () => {
    const updatedInvoice = { amt: 500 }; // Only updating the amount
    const response = await request(app)
      .put('/invoices/1')
      .send(updatedInvoice);

    expect(response.statusCode).toBe(200);
    expect(response.body.invoice).toMatchObject({ ...sampleInvoices[0], ...updatedInvoice });
  });

  test('It should respond with 404 if invoice does not exist', async () => {
    const response = await request(app)
      .put('/invoices/999')
      .send({ amt: 500 });

    expect(response.statusCode).toBe(404);
  });
});

describe('DELETE /invoices/:id', () => {
  test('It should delete an existing invoice', async () => {
    const response = await request(app).delete('/invoices/1');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'deleted' });
  });

  test('It should respond with 404 if invoice does not exist', async () => {
    const response = await request(app).delete('/invoices/999');

    expect(response.statusCode).toBe(404);
  });
});
