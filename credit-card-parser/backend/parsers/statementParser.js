// Lightweight statement parser adapted from frontend heuristics.
const MONEY_RE = /\$?\s?([+-]?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/g;

function normalizeNumber(raw) {
  return (raw || '').replace(/[^0-9]/g, '');
}

function luhnCheck(num) {
  const s = String(num).split('').reverse().map(n => parseInt(n, 10));
  let sum = 0;
  for (let i = 0; i < s.length; i++) {
    let v = s[i];
    if (i % 2 === 1) v *= 2;
    if (v > 9) v -= 9;
    sum += v;
  }
  return sum % 10 === 0;
}

function detectBrand(num) {
  if (!num) return 'unknown';
  if (/^3[47]/.test(num)) return 'American Express';
  if (/^4/.test(num)) return 'Visa';
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'Mastercard';
  if (/^6(?:011|5)/.test(num)) return 'Discover';
  return 'Unknown';
}

function detectProvider(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('american express') || t.includes('amex')) return 'American Express';
  if (t.includes('chase')) return 'Chase';
  if (t.includes('bank of america') || t.includes('boa')) return 'Bank of America';
  if (t.includes('capital one')) return 'Capital One';
  if (t.includes('citi') || t.includes('citibank')) return 'Citi';
  return 'Generic';
}

function findLast4(text) {
  const m = text.match(/(?:ending in|ending|acct(?:ount)?(?: number)?|card ending|last)\s*[:#\-]?\s*(\d{4})/i);
  if (m) return m[1];
  const groups = text.match(/\b(\d{4})\b/g);
  if (groups && groups.length) return groups[groups.length - 1];
  return null;
}

function findDateRange(text) {
  // look for statement period or statement date ranges
  const m = text.match(/statement period[:\s]*([A-Za-z0-9\- ,\/]+)to([A-Za-z0-9\- ,\/]+)/i);
  if (m) return `${m[1].trim()} to ${m[2].trim()}`;
  const m2 = text.match(/statement period[:\s]*([A-Za-z0-9\- ,\/]+)/i);
  if (m2) return m2[1].trim();
  return null;
}

function findDueDate(text) {
  const m = text.match(/payment due date[:\s]*([A-Za-z0-9,\/\-]+)/i);
  if (m) return m[1].trim();
  const m2 = text.match(/due date[:\s]*([A-Za-z0-9,\/\-]+)/i);
  if (m2) return m2[1].trim();
  return null;
}

function findTotalBalance(text) {
  const lines = (text || '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/new balance|total balance|amount due|new balance as of|current balance/i.test(line)) {
      const m = line.match(/([\$€£]?\s*[+-]?\d[\d,]*\.?\d{0,2})/);
      if (m) return m[1].trim();
    }
  }
  // fallback: last money amount in text
  let last = null;
  let match;
  while ((match = MONEY_RE.exec(text || ''))) {
    last = match[1];
  }
  return last;
}

function findTransactions(text, max = 20) {
  const lines = (text || '').split(/\r?\n/);
  const tx = [];
  // More strict date recognition: dd/mm/yyyy or mm/dd/yyyy or Month dd
  const dateRe = /(^|\s)(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|[A-Za-z]{3,9} \d{1,2})(?=\s|\b)/i;
  // Money: allow optional currency symbol, optional thousands separators, mandatory decimal or integer
  const moneyRe = /([\$€£]?\s*[+-]?\d{1,3}(?:[,\.]\d{3})*(?:[\.,]\d{2}))/;
  const skipKeywords = /statement|balance|amount due|new balance|total balance|payment due|account ending|ending in/i;

  for (let l of lines) {
    if (tx.length >= max) break;
    const line = l.trim();
    if (!line) continue;
    // skip lines that are clearly headers or summary
    if (skipKeywords.test(line)) continue;
    const d = line.match(dateRe);
    const m = line.match(moneyRe);
    // Only accept as transaction when date appears and an amount appears further on the same line
    if (d && m) {
      // ensure the amount is not the same short token as the date (avoid false positives)
      const dateToken = d[2];
      const amountToken = m[1];
      if (dateToken && amountToken && dateToken !== amountToken) {
        tx.push({ raw: line, date: dateToken.trim(), amount: amountToken.trim() });
      }
    }
  }
  return tx;
}

function resultsFromText(text) {
  const candidates = [];
  // find sequences of digits and separators that could be card numbers
  const re = /([0-9][0-9\-\s]{11,30}[0-9])/g;
  let m;
  while ((m = re.exec(text))) {
    const raw = m[1];
    const normalized = normalizeNumber(raw);
    if (normalized.length >= 13 && normalized.length <= 19) {
      candidates.push({ raw, normalized, luhn: luhnCheck(normalized), brand: detectBrand(normalized) });
    }
  }
  return candidates;
}

function parseStatements(text) {
  const provider = detectProvider(text);
  const last4 = findLast4(text);
  const billingCycle = findDateRange(text);
  const dueDate = findDueDate(text);
  const totalBalance = findTotalBalance(text);
  const transactions = findTransactions(text, 50);
  const candidates = resultsFromText(text);

  return {
    provider,
    last4,
    billingCycle,
    dueDate,
    totalBalance,
    transactions,
    candidates
  };
}

module.exports = { parseStatements, luhnCheck, detectBrand };
