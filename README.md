# Credit Card Parser

This small React app provides a handy UI to paste or upload bank/credit-card statement text and detect potential credit card numbers (masked in results), along with Luhn validation and brand detection.

Features
- Paste raw statement text into the textarea.
- Upload plain text files (.txt, .csv, .log) or PDF statements — PDFs are parsed client-side using pdfjs.
- Results table shows masked card numbers, detected brand, digit count and whether they pass Luhn validation.

Usage

1. Install dependencies:

```powershell
cd frontend
npm install
```

2. Start the dev server:

```powershell
npm start
```

3. Run tests:

```powershell
npm test -- --watchAll=false
```

Notes
- PDF extraction runs entirely in the browser using `pdfjs-dist`. For large PDFs or production workloads you may prefer a server-side parser.
- If you want TypeScript, I can convert the component into `.tsx` and add types.

Security
- The app masks detected numbers when displayed. Do not paste or upload real card numbers into public or shared environments.
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.
