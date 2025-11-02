const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const upload = multer({ dest: path.join(__dirname, 'uploads/') });
const parser = require('./parsers/statementParser');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

// health
app.get('/health', (req, res) => res.json({ ok: true }));

// parse raw text (POST JSON { text: '...' })
app.post('/parse/text', async (req, res) => {
  const { text } = req.body || {};
  if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Missing text in body' });
  try {
    const parsed = parser.parseStatements(text);
    return res.json({ text, parsed });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Parsing failed' });
  }
});

// parse uploaded file (multipart/form-data file field 'file')
app.post('/parse/file', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded (field `file`)' });
  const filePath = req.file.path;
  const mime = req.file.mimetype || '';
  try {
    let text = '';
    if (mime === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      text = pdfData.text || '';
    } else {
      // treat as plain text
      text = fs.readFileSync(filePath, 'utf8');
    }

    const parsed = parser.parseStatements(text);

    // remove uploaded file
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }

    return res.json({ parsed, textSnippet: text.slice(0, 2000) });
  } catch (err) {
    console.error('Parse error', err);
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    return res.status(500).json({ error: 'Failed to extract text from file' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Parser backend listening on http://localhost:${PORT}`));
