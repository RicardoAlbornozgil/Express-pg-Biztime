const request = require('supertest');
const app = require('../src/app');
const client = require('../src/db');

// Sample data for testing
const sampleCompanies = [
  { code: 'apple', name: 'Apple', description: 'Maker of iOS devices' },
  { code: 'ibm', name: 'IBM', description: 'Technology company' }
];

beforeAll(async () => {
  // Create the companies table
  await client.query(`
    CREATE TABLE companies (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    )
  `);

  // Insert sample data into the companies table
  await Promise.all(sampleCompanies.map(company =>
    client.query(`
      INSERT INTO companies (code, name, description)
      VALUES ($1, $2, $3)
    `, [company.code, company.name, company.description])
  ));
});

afterAll(async () => {
  // Drop the companies table to clean up after testing
  await client.query('DROP TABLE companies');
  await client.end();
});

describe('GET /companies', () => {
  test('It should respond with an array of companies', async () => {
    const response = await request(app).get('/companies');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ companies: sampleCompanies });
  });
});

describe('GET /companies/:code', () => {
  test('It should respond with a single company', async () => {
    const response = await request(app).get('/companies/apple');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ company: sampleCompanies[0] });
  });

  test('It should respond with 404 if company does not exist', async () => {
    const response = await request(app).get('/companies/nonexistent');

    expect(response.statusCode).toBe(404);
  });
});

describe('POST /companies', () => {
  test('It should create a new company', async () => {
    const newCompany = { name: 'Google', description: 'Internet giant' };
    const response = await request(app)
      .post('/companies')
      .send(newCompany);

    expect(response.statusCode).toBe(201);
    expect(response.body.company).toMatchObject(newCompany);
    expect(response.body.company).toHaveProperty('code', 'google');
  });

  test('It should respond with 400 if missing required fields', async () => {
    const invalidCompany = { code: 'microsoft' }; // Missing 'name' field
    const response = await request(app)
      .post('/companies')
      .send(invalidCompany);

    expect(response.statusCode).toBe(400);
  });
});

describe('PUT /companies/:code', () => {
  test('It should update an existing company', async () => {
    const updatedCompany = { name: 'Apple Inc.', description: 'Maker of iOS and macOS devices' };
    const response = await request(app)
      .put('/companies/apple')
      .send(updatedCompany);

    expect(response.statusCode).toBe(200);
    expect(response.body.company).toMatchObject(updatedCompany);
    expect(response.body.company).toHaveProperty('code', 'apple');
  });

  test('It should respond with 404 if company does not exist', async () => {
    const response = await request(app)
      .put('/companies/nonexistent')
      .send({ name: 'New Name', description: 'New Description' });

    expect(response.statusCode).toBe(404);
  });
});

describe('DELETE /companies/:code', () => {
  test('It should delete an existing company', async () => {
    const response = await request(app).delete('/companies/apple');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'deleted' });
  });

  test('It should respond with 404 if company does not exist', async () => {
    const response = await request(app).delete('/companies/nonexistent');

    expect(response.statusCode).toBe(404);
  });
});
