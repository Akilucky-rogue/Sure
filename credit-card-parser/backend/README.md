# Backend for Credit Card Statement Parser

This folder contains a small Express backend that can extract text from uploaded PDF or text files and run the parser heuristics (the same light heuristics used in the frontend) to return structured statement data.

Endpoints
- GET /health — basic health check
- POST /parse/text — JSON body { text: '...' } to parse raw text
- POST /parse/file — multipart/form-data (field `file`) to upload a PDF or text file. Returns parsed result and a text snippet.

How to run

```powershell
cd backend
npm install
npm start
```

Quick test (runs a tiny internal sample):

```powershell
npm run test-parse
```

Notes
- This backend is intentionally lightweight. For OCR or scanned documents, integrate Tesseract or an OCR microservice.
- Do not enable direct file uploads on a public server without authentication and proper size limits and scanning.
