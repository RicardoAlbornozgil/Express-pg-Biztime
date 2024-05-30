\c biztime

DROP TABLE IF EXISTS company_industries;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    comp_code TEXT NOT NULL REFERENCES companies(code) ON DELETE CASCADE,
    amt FLOAT NOT NULL,
    paid BOOLEAN DEFAULT FALSE NOT NULL,
    add_date DATE DEFAULT CURRENT_DATE NOT NULL,
    paid_date DATE,
    CONSTRAINT invoices_amt_check CHECK ((amt > 0::DOUBLE PRECISION))
);

CREATE TABLE industries (
    code TEXT PRIMARY KEY,
    industry TEXT NOT NULL
);

CREATE TABLE company_industries (
    comp_code TEXT NOT NULL,
    industry_code TEXT NOT NULL,
    PRIMARY KEY (comp_code, industry_code),
    FOREIGN KEY (comp_code) REFERENCES companies(code) ON DELETE CASCADE,
    FOREIGN KEY (industry_code) REFERENCES industries(code) ON DELETE CASCADE
);

INSERT INTO companies (code, name, description)
VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
       ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_code, amt, paid, paid_date)
VALUES ('apple', 100, FALSE, NULL),
       ('apple', 200, FALSE, NULL),
       ('apple', 300, TRUE, '2018-01-01'),
       ('ibm', 400, FALSE, NULL);

INSERT INTO industries (code, industry)
VALUES ('tech', 'Technology'),
       ('fin', 'Finance');

INSERT INTO company_industries (comp_code, industry_code)
VALUES ('apple', 'tech'),
       ('ibm', 'tech');
