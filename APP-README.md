# Finance Dashboard — Application

A React-based market dashboard for **IBM and major competitors**, built as part of the IBM Bob GitHub SDLC Lab.

## What is this?

A small, demo-ready finance application that presents three views:
- **Current Day** — live quote summary cards for IBM, Microsoft, Oracle, SAP, and Salesforce
- **Last 7 Days** — relative performance line chart indexed to 100 at the start of the period
- **Last Quarter** — trend comparison chart across ~63 trading days

Data is served from a deterministic mock layer by default.  
Swap `src/services/financeService.js` with a real Yahoo Finance integration (e.g. `yahoo-finance2` via a lightweight backend proxy) without changing any UI code.

---

## Quick Start

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

| Command           | Description                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Start local dev server with HMR          |
| `npm run build`   | Production build into `dist/`            |
| `npm run preview` | Preview the production build locally     |
| `npm run lint`    | ESLint check across `src/`               |
| `npm test`        | Run unit tests with Vitest               |

---

## Project Structure

```
src/
├── main.jsx                  # React entry point
├── App.jsx                   # App shell (header, footer, routing)
├── App.css                   # App-level styles
├── index.css                 # Global reset and base styles
├── setupTests.js             # Vitest / Testing Library setup
│
├── components/
│   ├── ChartCard.jsx         # Reusable multi-line chart card (Recharts)
│   ├── ChartCard.css
│   ├── SummaryCard.jsx       # Compact single-company metric card
│   └── SummaryCard.css
│
├── pages/
│   ├── Dashboard.jsx         # Main dashboard page (tab navigation)
│   └── Dashboard.css
│
├── services/
│   └── financeService.js     # Data layer — fetch, normalise, mock data
│
└── tests/
    ├── financeService.test.js
    └── ChartCard.test.jsx
```

---

## Extending the App

### Add a new company

Edit `src/services/financeService.js`:

```js
export const COMPANIES = [
  { ticker: 'IBM',  name: 'IBM' },
  // add a new entry here
  { ticker: 'AAPL', name: 'Apple' },
];
```

Add a matching colour entry in `COMPANY_COLORS` at the same index.

### Connect a real data source

Replace the `generatePriceSeries` helper and the three `fetch*` functions in `financeService.js` with real API calls.  
All return shapes are documented with JSDoc in the service file — the UI layer requires no changes.

---

## CI / GitHub Workflow

This project is validated by `.github/workflows/finance-app-ci.yml` on every push and pull request:

1. `npm install`
2. `npm run lint` (ESLint, 0 warnings tolerance)
3. `npm test` (Vitest unit tests)
4. `npm run build` (Vite production build)
