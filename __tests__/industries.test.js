const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

// Clear the industries table before each test
beforeEach(async () => {
  await db.query('DELETE FROM industry_companies');
  await db.query('DELETE FROM industries');
  await db.query('DELETE FROM companies');
});

// Close the database connection after all tests
afterAll(async () => {
  await db.end();
});

describe('GET /industries', () => {
  test('It should respond with an array of industries', async () => {
    // Insert test data into the industries table
    await db.query("INSERT INTO industries (code, industry) VALUES ('tech', 'Technology'), ('fin', 'Finance')");

    // Make a GET request to the /industries endpoint
    const response = await request(app).get('/industries');

    // Assert that the response status code is 200
    expect(response.statusCode).toBe(200);

    // Assert that the response body contains an array of industries
    expect(response.body).toEqual({ industries: [
      { code: 'tech', industry: 'Technology', companies: [] },
      { code: 'fin', industry: 'Finance', companies: [] }
    ]});
  });
});

describe('POST /industries', () => {
  test('It should create a new industry', async () => {
    // Make a POST request to create a new industry
    const response = await request(app)
      .post('/industries')
      .send({ code: 'health', industry: 'Healthcare' });

    // Assert that the response status code is 201
    expect(response.statusCode).toBe(201);

    // Assert that the response body contains the newly created industry
    expect(response.body).toEqual({ industry: { code: 'health', industry: 'Healthcare' } });

    // Check if the industry is actually inserted into the database
    const result = await db.query("SELECT * FROM industries WHERE code = 'health'");
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].industry).toBe('Healthcare');
  });

  test('It should respond with 400 if missing required fields', async () => {
    const response = await request(app)
      .post('/industries')
      .send({ code: 'health' }); // Missing 'industry' field

    expect(response.statusCode).toBe(400);
  });
});

describe('PUT /industries/:code', () => {
  test('It should update an existing industry', async () => {
    // Insert a test industry into the database
    await db.query("INSERT INTO industries (code, industry) VALUES ('health', 'Healthcare')");

    // Make a PUT request to update the industry
    const response = await request(app)
      .put('/industries/health')
      .send({ industry: 'Healthcare Services' });

    // Assert that the response status code is 200
    expect(response.statusCode).toBe(200);

    // Assert that the response body contains the updated industry
    expect(response.body).toEqual({ industry: { code: 'health', industry: 'Healthcare Services' } });

    // Check if the industry is actually updated in the database
    const result = await db.query("SELECT * FROM industries WHERE code = 'health'");
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].industry).toBe('Healthcare Services');
  });

  test('It should respond with 404 if the industry does not exist', async () => {
    // Make a PUT request to update a non-existent industry
    const response = await request(app)
      .put('/industries/nonexistent')
      .send({ industry: 'Nonexistent Industry' });

    // Assert that the response status code is 404
    expect(response.statusCode).toBe(404);
  });
});

describe('DELETE /industries/:code', () => {
  test('It should delete an existing industry', async () => {
    // Insert a test industry into the database
    await db.query("INSERT INTO industries (code, industry) VALUES ('health', 'Healthcare')");

    // Make a DELETE request to delete the industry
    const response = await request(app).delete('/industries/health');

    // Assert that the response status code is 200
    expect(response.statusCode).toBe(200);

    // Check if the industry is actually deleted from the database
    const result = await db.query("SELECT * FROM industries WHERE code = 'health'");
    expect(result.rows.length).toBe(0);
  });

  test('It should respond with 404 if the industry does not exist', async () => {
    // Make a DELETE request to delete a non-existent industry
    const response = await request(app).delete('/industries/nonexistent');

    // Assert that the response status code is 404
    expect(response.statusCode).toBe(404);
  });
});

describe('POST /industries/:industry_code/companies/:comp_code', () => {
  test('It should associate an industry to a company', async () => {
    // Insert test data into the industries and companies tables
    await db.query("INSERT INTO industries (code, industry) VALUES ('tech', 'Technology')");
    await db.query("INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple', 'Maker of iOS devices')");

    // Make a POST request to associate the industry with the company
    const response = await request(app)
      .post('/industries/tech/companies/apple');

    // Assert that the response status code is 201
    expect(response.statusCode).toBe(201);

    // Assert that the response body contains the association
    expect(response.body).toEqual({ association: { industry_code: 'tech', comp_code: 'apple' } });

    // Check if the association is actually inserted into the database
    const result = await db.query("SELECT * FROM industry_companies WHERE industry_code = 'tech' AND comp_code = 'apple'");
    expect(result.rows.length).toBe(1);
  });

  test('It should respond with 404 if the industry does not exist', async () => {
    await db.query("INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple', 'Maker of iOS devices')");

    const response = await request(app)
      .post('/industries/nonexistent/companies/apple');

    expect(response.statusCode).toBe(404);
  });

  test('It should respond with 404 if the company does not exist', async () => {
    await db.query("INSERT INTO industries (code, industry) VALUES ('tech', 'Technology')");

    const response = await request(app)
      .post('/industries/tech/companies/nonexistent');

    expect(response.statusCode).toBe(404);
  });
});
