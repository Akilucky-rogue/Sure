const fs = require('fs');
const path = require('path');
const parser = require('../parsers/statementParser');

const fixturesDir = path.join(__dirname, 'fixtures');

const cases = [
  { file: 'chase.txt', provider: 'Chase' },
  { file: 'citi.txt', provider: 'Citi' },
  { file: 'amex.txt', provider: 'American Express' },
  { file: 'boa.txt', provider: 'Bank of America' },
  { file: 'capitalone.txt', provider: 'Capital One' }
];

describe('statementParser', () => {
  cases.forEach(({ file, provider }) => {
    test(`parses ${file} and detects provider ${provider}`, () => {
      const text = fs.readFileSync(path.join(fixturesDir, file), 'utf8');
      const out = parser.parseStatements(text);
      expect(out).toBeDefined();
      // provider detection should match (case-sensitive string from detector)
      expect(out.provider).toBe(provider);
      // last4 should be found
      expect(out.last4).toBeTruthy();
      // either a total balance or transactions should be present
      const hasBalance = !!out.totalBalance;
      const hasTx = Array.isArray(out.transactions) && out.transactions.length > 0;
      expect(hasBalance || hasTx).toBe(true);
    });
  });
});
