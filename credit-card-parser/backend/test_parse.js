const fs = require('fs');
const path = require('path');
const parser = require('./parsers/statementParser');

const sample = `Statement period 01/01/2025 to 01/31/2025\nNew balance $1,234.56\nPayment due date: 02/20/2025\nActivity:\n01/03/2025 AMAZON MKTPLACE 1234  -$45.67\n01/15/2025 GROCERY STORE  -$123.45\nAccount ending in 6789\n`;

const result = parser.parseStatements(sample);
console.log(JSON.stringify({ sampleSnippet: sample.slice(0,200), result }, null, 2));
