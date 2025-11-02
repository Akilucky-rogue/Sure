import React, { useState, useCallback } from 'react';
import './ccparser.css';

// Luhn algorithm to validate card numbers (digits only)
function luhnCheck(number) {
  const digits = number.split('').reverse().map((d) => parseInt(d, 10));
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

function detectBrand(num) {
  if (/^4/.test(num)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(num)) return 'Mastercard';
  if (/^3[47]/.test(num)) return 'American Express';
  if (/^6(?:011|5)/.test(num)) return 'Discover';
  return 'Unknown';
}

function normalizeNumber(raw) {
  return raw.replace(/[^0-9]/g, '');
}

// Provider detection and statement parsing helpers
function detectProvider(text) {
  const t = text.toLowerCase();
  if (t.includes('american express') || t.includes('amex')) return 'American Express';
  if (t.includes('chase')) return 'Chase';
  if (t.includes('bank of america') || t.includes('boa')) return 'Bank of America';
  if (t.includes('capital one')) return 'Capital One';
  if (t.includes('citi') || t.includes('citibank')) return 'Citi';
  return 'Generic';
}

function findLast4(text) {
  // common patterns: 'ending in 1234', 'card ending 1234', '•••• 1234', 'xxxx-1234'
  const re = /(?:ending in|card ending|card:|acct(?:ount)? ending|ending)[:\s]*\D?(\d{4})/i;
  const m = text.match(re);
  if (m && m[1]) return m[1];
  // fallback: find sequences like xxxx 1234 or groups of 4 digits preceded by non-digit
  const m2 = text.match(/(?:\D|\b)(\d{4})\b/g);
  if (m2 && m2.length) return m2[m2.length - 1].replace(/\D/g, '');
  return null;
}

function findDateRange(text) {
  // look for 'Statement period' or 'Billing period' followed by dates
  const re = /(Statement period|Billing period|Statement date|Statement Period)[:\s]*([^\n]+)/i;
  const m = text.match(re);
  const dateRegex = /(\b[A-Za-z]{3,9} \d{1,2}, \d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b)/g;
  if (m && m[2]) {
    const dates = m[2].match(dateRegex) || [];
    if (dates.length >= 2) return { start: dates[0], end: dates[1] };
  }
  // fallback: try to find two dates near each other
  const allDates = text.match(dateRegex) || [];
  if (allDates.length >= 2) return { start: allDates[0], end: allDates[1] };
  return null;
}

function findDueDate(text) {
  const re = /(Payment due date|Due date|Payment due)[:\s]*([^\n]+)/i;
  const m = text.match(re);
  if (m && m[2]) {
    const d = m[2].match(/(\b[A-Za-z]{3,9} \d{1,2}, \d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b)/);
    if (d) return d[0];
    return m[2].trim().split(/\s{2,}|\n/)[0];
  }
  return null;
}

function findTotalBalance(text) {
  const re = /(New balance|New Balance|Total balance|Amount due|Current balance|Previous balance)[:\s]*\$?([0-9,]+\.\d{2})/i;
  const m = text.match(re);
  if (m && m[2]) return m[2];
  // fallback: find last currency amount in document
  const m2 = text.match(/\$([0-9,]+\.\d{2})/g);
  if (m2 && m2.length) return m2[0].replace(/\$/g, '');
  return null;
}

function findTransactions(text, max = 10) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const tx = [];
  const lineDateAmount = /(\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b[A-Za-z]{3,9} \d{1,2}, \d{4}\b).{0,120}?(-?\$?[0-9,]+\.\d{2})/;
  for (const l of lines) {
    const m = l.match(lineDateAmount);
    if (m) {
      // extract date, amount, description
      const date = (m[1] || '').trim();
      const amountMatch = l.match(/(-?\$?[0-9,]+\.\d{2})/);
      const amount = amountMatch ? amountMatch[1] : null;
      const desc = l.replace(date, '').replace(amount || '', '').replace(/\s{2,}/g, ' ').trim();
      tx.push({ date, description: desc, amount });
      if (tx.length >= max) break;
    }
  }
  return tx;
}

function parseStatements(text) {
  const provider = detectProvider(text);
  const last4 = findLast4(text);
  const billing = findDateRange(text);
  const dueDate = findDueDate(text);
  const total = findTotalBalance(text);
  const transactions = findTransactions(text, 20);

  // provider-specific tweaks (heuristic)
  const brand = (function chooseBrand() {
    if (provider === 'American Express') return 'American Express';
    if (provider === 'Chase') return 'Chase';
    if (provider === 'Bank of America') return 'Bank of America';
    if (provider === 'Capital One') return 'Capital One';
    if (provider === 'Citi') return 'Citi';
    // try to infer from numbers
    if (resultsFromText(text).length > 0) return detectBrand(resultsFromText(text)[0]);
    return provider;
  })();

  return { provider, brand, last4, billingCycle: billing, dueDate, totalBalance: total, transactions };
}

function resultsFromText(text) {
  // helper: extract numeric candidate sequences similar to earlier parsing
  const candidateRegex = /(?:\d[ -]*){13,19}/g;
  const matches = text.match(candidateRegex) || [];
  return matches.map((m) => normalizeNumber(m)).filter((n) => n.length >= 13 && n.length <= 19);
}

export default function CcStatementParser() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);
  const [showRaw, setShowRaw] = useState(false);
  const [filter, setFilter] = useState('all'); // all | valid | invalid
  const [statementData, setStatementData] = useState(null);

  const parseText = useCallback((text) => {
    // Regex matches sequences of digits, spaces or dashes of length 13-19 when digits counted
    const candidateRegex = /(?:\d[ -]*){13,19}/g;
    const matches = text.match(candidateRegex) || [];
    const seen = new Set();
    const parsed = [];
    for (const m of matches) {
      const n = normalizeNumber(m);
      if (n.length < 13 || n.length > 19) continue;
      if (seen.has(n)) continue;
      seen.add(n);
      const valid = luhnCheck(n);
      parsed.push({ raw: m.trim(), number: n, valid, brand: detectBrand(n) });
    }
    setResults(parsed);
    // also try structured statement parsing
    try {
      const structured = parseStatements(text);
      setStatementData(structured);
    } catch (e) {
      setStatementData(null);
    }
  }, []);

  // Handle uploaded files. For PDFs we dynamically import pdfjs-dist and extract text.
  const onFile = useCallback(async (file) => {
    if (!file) return;
    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // dynamic import so tests that don't need pdfjs won't fail
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
        const pdfWorker = await import('pdfjs-dist/build/pdf.worker.entry');
        // worker entry default export lives on .default depending on bundler
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default || pdfWorker;

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          // eslint-disable-next-line no-await-in-loop
          const page = await pdf.getPage(i);
          // eslint-disable-next-line no-await-in-loop
          const content = await page.getTextContent();
          const strings = content.items.map((it) => it.str);
          fullText += strings.join(' ') + '\n';
        }
        setInputText(fullText);
          parseText(fullText);
        return;
      }

      // fallback: read as text for plain text files
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        setInputText(text);
        parseText(text);
      };
      reader.readAsText(file);
    } catch (err) {
      // if PDF parsing fails, try reading as text
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        setInputText(text);
        parseText(text);
      };
      reader.readAsText(file);
    }
  }, [parseText]);

  const onDrop = useCallback(async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    await onFile(file);
  }, [onFile]);

  const onPaste = useCallback((e) => {
    const text = e.clipboardData.getData('text');
    setInputText(text);
    parseText(text);
  }, [parseText]);

  const sampleText = `Payment to ACME Corp.  card: 4111 1111 1111 1111
Refund from Zeta Inc. card ending 5500-0000-0000-0004
Charge: 378282246310005 description: AMEX`;

  const fillSample = useCallback(() => {
    setInputText(sampleText);
    parseText(sampleText);
  }, [parseText]);

  const masked = (num) => (showRaw ? num : num.replace(/.(?=.{4})/g, '*'));

  const copyMasked = useCallback(() => {
    const text = results
      .filter((r) => (filter === 'all' ? true : filter === 'valid' ? r.valid : !r.valid))
      .map((r) => `${masked(r.number)}\t${r.brand}\t${r.number.length}\t${r.valid ? 'Yes' : 'No'}`)
      .join('\n');
    navigator.clipboard?.writeText(text);
  }, [results, filter, showRaw]);

  const exportCSV = useCallback(() => {
    const rows = results
      .filter((r) => (filter === 'all' ? true : filter === 'valid' ? r.valid : !r.valid))
      .map((r) => ({ masked: masked(r.number), brand: r.brand, digits: r.number.length, valid: r.valid }));
    const csv = ['masked,brand,digits,valid', ...rows.map((r) => `${r.masked},${r.brand},${r.digits},${r.valid}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cc-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [results, filter, showRaw]);

  return (
    <div className="cc-parser-root">
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        <div>
          <h2>Credit Card Statement Parser</h2>
          <p className="muted">Paste statement text or upload a text/PDF and I'll find card-like numbers.</p>
        </div>
        <div className="toolbar">
          <button onClick={fillSample} title="Fill with sample text">Use sample</button>
          <button onClick={copyMasked} title="Copy masked results">Copy</button>
          <button onClick={exportCSV} title="Export results as CSV">Export CSV</button>
        </div>
      </header>

      <div
        className="dropzone"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onPaste={onPaste}
      >
        <textarea
          placeholder="Paste bank statement text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onBlur={() => parseText(inputText)}
        />
        <div className="controls">
          <label className="fileLabel">
            Upload file
              <input
                type="file"
                accept=".txt,.csv,.log,.pdf"
                onChange={(e) => onFile(e.target.files[0])}
              />
          </label>
          <button onClick={() => parseText(inputText)}>Parse</button>
          <button onClick={() => { setInputText(''); setResults([]); }}>Clear</button>
          <label style={{display:'flex',alignItems:'center',gap:8}}>
            <input type="checkbox" checked={showRaw} onChange={(e) => setShowRaw(e.target.checked)} /> Show raw
          </label>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <label className="small">Filter:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="valid">Valid</option>
              <option value="invalid">Invalid</option>
            </select>
          </div>
        </div>
      </div>

      <section className="results">
        <h3>Results ({results.length})</h3>
        {statementData && (
          <div style={{marginBottom:12, padding:10, border:'1px solid #f3f4f6', borderRadius:6, background:'#fbfbfb'}}>
            <strong>Detected provider:</strong> {statementData.provider} &nbsp;|&nbsp; <strong>Brand:</strong> {statementData.brand} &nbsp;|&nbsp; <strong>Last4:</strong> {statementData.last4 || 'n/a'}
            <div style={{marginTop:6}}>
              <strong>Billing cycle:</strong> {statementData.billingCycle ? `${statementData.billingCycle.start} → ${statementData.billingCycle.end}` : 'n/a'} &nbsp;|&nbsp; <strong>Due:</strong> {statementData.dueDate || 'n/a'} &nbsp;|&nbsp; <strong>Total:</strong> {statementData.totalBalance || 'n/a'}
            </div>
            {statementData.transactions && statementData.transactions.length > 0 && (
              <div style={{marginTop:8}}>
                <em>Sample transactions:</em>
                <ul style={{margin: '6px 0 0 14px'}}>
                  {statementData.transactions.slice(0,5).map((t, idx) => (
                    <li key={idx}>{t.date} — {t.description} — {t.amount}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {results.length === 0 ? (
          <p className="muted">No card-like numbers found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Masked</th>
                <th>Brand</th>
                <th>Digits</th>
                <th>Valid (Luhn)</th>
              </tr>
            </thead>
            <tbody>
              {results
                .filter((r) => (filter === 'all' ? true : filter === 'valid' ? r.valid : !r.valid))
                .map((r, i) => (
                  <tr key={i} className={r.valid ? 'ok' : 'bad'}>
                    <td>{masked(r.number)}</td>
                    <td>{r.brand}</td>
                    <td>{r.number.length}</td>
                    <td>{r.valid ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
