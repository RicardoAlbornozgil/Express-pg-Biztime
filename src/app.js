/** BizTime express application. */

const express = require("express");
const ExpressError = require("./expressError");

const app = express();

// Import the routes
const companyRoutes = require("./routes/companies");
const invoiceRoutes = require("./routes/invoices");
const industryRoutes = require("./routes/industries");

// Middleware to parse JSON
app.use(express.json());

// Route to handle GET /
app.get('/', (req, res) => {
  res.send("Welcome to the BizTime API!");
});

// Use the routes
app.use("/companies", companyRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/industries", industryRoutes);

/** 404 handler */
app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;