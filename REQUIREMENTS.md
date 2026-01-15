# Project Requirements Mapping

- **Search & Results**
  - Implementation: `src/components/SearchForm/SearchForm.tsx`, `src/components/Results/ResultsList.tsx`, `src/components/Results/FlightCard.tsx`, `src/state/useFlightSearchStore.ts`
  - Notes: MUI form (origin/destination, dates, adults, cabin, swap), demo loader, search wiring to Zustand and Amadeus hooks; results list with sorting and selectable cards.
  - Status: [x] Implemented

- **Live price graph updating with filters**
  - Implementation: `src/components/Graph/PriceGraph.tsx`, `src/utils/deriveGraphData.ts`, `src/utils/filterFlights.ts`
  - Notes: Uses Recharts with tabs (distribution/by stops/by airline), stats chips, responsive container; graph data recomputed from filtered offers.
  - Status: [x] Implemented

- **Complex filtering**
  - Implementation: `src/components/Filters/FiltersPanel.tsx`, `src/state/useFlightSearchStore.ts`, `src/utils/filterFlights.ts`
  - Notes: Stops toggle group, airline chip multi-select with “More” collapse, price slider with min/max labels; reset support; filters drive graph and results.
  - Status: [x] Implemented

- **Responsive**
  - Implementation: `src/App.tsx` (layout, sticky header, mobile drawers), `src/components/ui/Drawer.tsx`, global Tailwind classes
  - Notes: Grid/stack layout adapts to mobile (drawers, sticky bottom bar) and desktop (two-column filters + content); cards are fluid.
  - Status: [x] Implemented

- **Deployment + Loom + README notes**
  - Implementation: `vercel.json`, `server/index.js` (dev proxy), `api/amadeus/*.ts` (Vercel functions), `.env.example`, `README.md`
  - Notes: Frontend proxied to Amadeus via local Express or Vercel serverless; env vars documented. No Loom video included.
  - Status: [x] Implemented (Loom: not provided)
