const express = require('express');
const router = new express.Router();
const client = require('../db');
const ExpressError = require('../expressError');

// Get all industries
router.get('/', async (req, res, next) => {
  try {
    const result = await client.query(`
      SELECT i.code, i.industry, json_agg(ci.comp_code) AS companies
      FROM industries AS i
      LEFT JOIN company_industries AS ci ON i.code = ci.industry_code
      GROUP BY i.code
    `);
    return res.json({ industries: result.rows });
  } catch (err) {
    return next(err);
  }
});

// Add a new industry
router.post('/', async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    const result = await client.query(
      'INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry',
      [code, industry]
    );
    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Associate an industry to a company
router.post('/:industry_code/companies/:comp_code', async (req, res, next) => {
  try {
    const { industry_code, comp_code } = req.params;
    const result = await client.query(
      'INSERT INTO company_industries (industry_code, comp_code) VALUES ($1, $2) RETURNING industry_code, comp_code',
      [industry_code, comp_code]
    );
    return res.status(201).json({ association: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
