const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf-parse');
let tesseract;
try {
  tesseract = require('tesseract.js');
} catch (e) {
  tesseract = null;
}
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
  const useOcr = String(req.query.ocr || '').toLowerCase() === 'true';
  try {
    let text = '';
    if (mime === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      text = pdfData.text || '';
      // If OCR requested and we couldn't extract text, inform about PDF->image conversion requirement
      if (useOcr && (!text || text.trim().length === 0)) {
        // We don't convert PDF pages to images here because that requires poppler/graphicsmagick.
        // Recommend the client convert the PDF to images (e.g., `pdftoppm`) and POST images for OCR.
        return res.status(422).json({ error: 'PDF contains no extractable text. For OCR on PDFs, convert pages to images and upload the image(s) with ?ocr=true' });
      }
    } else {
      // treat as plain text
      text = fs.readFileSync(filePath, 'utf8');
    }

    // If OCR requested and file is an image
    if (useOcr && (mime.startsWith('image/') || /\.(png|jpe?g|tiff?)$/i.test(req.file.originalname))) {
      if (!tesseract) {
        try { fs.unlinkSync(filePath); } catch (e) {}
        return res.status(500).json({ error: 'OCR support is not installed on the server. Please install tesseract.js.' });
      }
      // run OCR with tesseract.js on the image file
      const { createWorker } = tesseract;
      const worker = createWorker({ logger: null });
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text: ocrText } } = await worker.recognize(filePath);
      await worker.terminate();
      text = (text || '') + '\n' + (ocrText || '');
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
