# Credit Card Statement Parser (Jarvis)

This repository contains a small React-based tool to parse credit card statements and extract potential card numbers and structured statement data from text and PDF files.

This README documents the full project: purpose, architecture, how to run, how the PDF parsing and multi-provider heuristics work, security notes, and next steps.

## Repo structure

- backend/
  - (empty placeholder for server-side parsing if you want to add it later)
- frontend/
  - A Create React App application with the parser UI and logic.
  - Key files:
    - `src/components/CcStatementParser.js` — main parser component (parsing logic, PDF extraction using pdfjs-dist, Luhn check, brand detection, multi-provider structured extraction, UI features like sample data, copy/export).
    - `src/components/ccparser.css` — component styles.
    - `src/App.js` — app container.
    - `postcss.config.js`, `tailwind.config.js`, and `package.json` — build and dependency configuration.

## Goal

Provide a client-side utility that:

- Accepts pasted statement text or uploaded text/PDF statements.
- Extracts card-like numeric sequences and validates them using the Luhn algorithm.
- Detects provider (Chase, Bank of America, Capital One, American Express, Citi) using heuristic text matching.
- Extracts structured data: last 4 digits, billing cycle, payment due date, total balance, and transactions summary.
- Offers UI conveniences: sample data, mask/unmask numbers, copy masked results, export CSV.

## Important design decisions

- PDF parsing is done client-side with `pdfjs-dist` (dynamically imported) so the feature works without adding heavy dependencies to the main bundle or backend.
- Statement parsing uses robust regex heuristics. This is best-effort: results vary by issuer formatting and PDF text extraction quality.
- Tailwind and PostCSS: during development we encountered a mismatch between Tailwind v4 plugin expectations and CRA's PostCSS pipeline. To unblock development we aligned `tailwindcss` to a v3-compatible version and added a resilient `postcss.config.js` that prefers `@tailwindcss/postcss` when available but falls back to `tailwindcss`.

## Running locally (frontend)

Prerequisites:

- Node.js (v16+ recommended) and npm available in your PATH.

Commands (from `frontend/`):

Install dependencies:

```powershell
cd frontend
npm install
```

Run the dev server:

```powershell
npm start
```

Open http://localhost:3000 in your browser.

Run tests:

```powershell
npm test -- --watchAll=false
```

## How the parser works

1. Input handling

   - The UI accepts pasted text (clipboard) or file uploads. For uploaded PDFs we use `pdfjs-dist` to extract textual content (page-by-page) and concatenate it for parsing.

2. Card detection

   - A regex scans the text for digit groups that could be card numbers (13–19 digits when non-digits removed).
   - Each candidate is normalized (remove spaces/dashes) and validated using the Luhn algorithm. Card brand is inferred from BIN patterns (Visa, Mastercard, AmEx, Discover) and via provider heuristics.

3. Structured statement extraction (multi-provider)

   - Provider detection: basic keyword matching (case-insensitive) for `american express`, `amex`, `chase`, `bank of america`, `capital one`, `citi`/`citibank`.
   - Extracted fields:
     - `last4` — found via patterns like "ending in 1234", "card ending 1234", or trailing 4-digit groups.
     - `billingCycle` — found via lines containing "Statement period" or similar; dates parsed from those lines.
     - `dueDate` — found via lines containing "Payment due date" or similar.
     - `totalBalance` — searched via labels like "New balance", "Total balance", "Amount due", and fallback to last currency amount in the text.
     - `transactions` — heuristic extraction of lines containing a date and an amount. We return a list of the first ~20 matches as a sample summary.

4. UI

   - Displays both detected card numbers (masked by default) and a structured statement summary when available.
   - Buttons to copy masked results to clipboard and export CSV.

## Sample usage

- Paste a typical statement text or upload a PDF (text-based PDF). Click Parse or wait for the parser on blur.
- The UI will show detected providers and key fields. Use the "Show raw" toggle to reveal full numbers (be careful with PII).

## Security and privacy

- The app runs client-side and does not send your data to any server by default. If you later add a backend, avoid transmitting unencrypted sensitive documents.
- Masking is enabled by default for exported/copied values. Toggle only if you explicitly need raw numbers.
- Don't upload scanned PDFs (images) unless you add OCR and you trust the environment.

## Troubleshooting & notes

- If `npm start` fails with errors about Tailwind/PostCSS: run `npm install` in `frontend/` to ensure `tailwindcss`, `postcss`, and `autoprefixer` are present. The project includes a resilient `postcss.config.js` but version mismatches can still appear depending on global environment.
- PDF parsing accuracy varies — PDFs that are actually images need OCR; we do not currently perform OCR.

## Tests and development notes

- There are two basic React tests included (uses Jest + React Testing Library) that ensure the parser component and app render. Add more tests if you add provider-specific parsing rules.

## Next steps you can take

- Improve provider-specific parsing heuristics and add unit tests containing real statement snippets for Chase, Citi, AmEx, BoA, and Capital One.
- Add server-side parsing or OCR pipeline for scanned documents.
- Implement stricter PII handling policies (e.g., automatic deletion after processing, secure upload endpoints).

## Where I pushed the code

- I pushed your changes to: https://github.com/Akilucky-rogue/Sure (main branch).

## Contact / Maintainers

- Repo owner: Akilucky-rogue

Thanks — if you want, I can now add example statement fixtures (realistic-but-sanitized samples) and unit tests for each provider to increase parser reliability.
