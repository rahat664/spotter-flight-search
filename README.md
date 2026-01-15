# Spotter Flight Search

Modern React + Vite app with Tailwind + Material UI, neon glass aesthetic, Amadeus-backed search, rich filters, and live price visualizations.

## Tech Stack
- React 19 + TypeScript + Vite
- Tailwind v4 for layout/utility styling
- Material UI (MUI) + MUI X Date Pickers for form controls
- Zustand for state, TanStack Query for data fetching
- Recharts for graphs
- Express dev proxy + Vercel serverless functions for Amadeus API

## Local Development
1) Install deps  
```bash
npm install
```
2) Create `.env` from `.env.example` (see below).  
3) Run dev servers (Vite + local proxy):  
```bash
npm run dev
```
- Frontend: http://localhost:5173  
- Proxy API: http://localhost:4000 (Express)  
Requests to `/api/amadeus/*` are proxied automatically in dev.

## Environment Variables
Copy `.env.example` to `.env` and set:
```
VITE_PUBLIC_CURRENCY=USD           # default display currency
VITE_API_BASE=                     # leave empty for same-origin /api
AMADEUS_CLIENT_ID=                 # from Amadeus dashboard (test env)
AMADEUS_CLIENT_SECRET=             # from Amadeus dashboard (test env)
```
Keep secrets out of the repo; set them in Vercel/Netlify for deploys.

## Deployment
- **Vercel**: `vercel.json` routes `/api/*` to serverless functions in `api/amadeus/*` (token caching in memory). Set env vars (`AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET`, `VITE_PUBLIC_CURRENCY`, optional `VITE_API_BASE`) in project settings. Build: `npm run build`. Preview/Prod both supported.
- **Netlify**: Mirror the `api/amadeus/*` functions under `netlify/functions` (same logic), add a proxy for `/api`. Set the same env vars in site settings.
- Static output lives in `dist` after `npm run build`.

## UI & Data Flow Highlights
- **Normalization**: Amadeus flight offers are normalized to a common `FlightOffer` model in `src/utils/normalizeAmadeus.ts` (consistent price/currency, segments, durations, stops).
- **Memoized filtering**: `App.tsx` computes `filteredOffers` once (raw offers + Zustand filters) and shares it with Results and Graph for instant, synchronized updates.
- **Graph derivation**: `src/utils/deriveGraphData.ts` builds price buckets, averages by stops/airlines, and departure-time trends for Recharts; reruns automatically when filters change.
- **Proxy**: Dev uses Express (`server/index.js`); production uses Vercel functions in `api/amadeus/*` to keep Amadeus credentials server-side.

## Testing / Notes
- Lint: `npm run lint`
- Build: `npm run build`
- No Loom video included. Demo data loader available in SearchForm for offline/dev UX.

## Design Decisions
- **Normalization**: Amadeus responses are normalized to an internal `FlightOffer` shape (`src/utils/normalizeAmadeus.ts`) for consistent UI and filtering.
Since code is auto-formatted by the Markdown parser, it is displayed as Markdown rather than HTML. A line break is interpreted as a new paragraph unless two space characters are added at the end of the line. Lists should be formatted with hyphen or asterisk; other Markdown elements should be formatted accordingly. To format code, indent it by four spaces or use a fenced code block with triple backticks. For tables, separate columns with vertical bars. To escape Markdown syntax, use a backslash before the special character or enclose the content in raw HTML tags if necessary. If a paragraph begins with at least four spaces, it will be formatted as code. Avoid mixing different Markdown syntaxes unnecessarily.
- **Memoized filtering**: Filtered offers are computed once in `App.tsx` and shared by Results + Graph to keep updates instant and in sync.
- **Graph derivation**: Price buckets, stops, airline averages, and departure-time trends derived in `src/utils/deriveGraphData.ts` feed Recharts; updates react to filters in real time.
