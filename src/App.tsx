import { useMemo, useState } from "react";
import { Container, Stack, Box } from "@mui/material";
import { useFlightSearchStore } from "./state/useFlightSearchStore";
import { filterFlights } from "./utils/filterFlights";
import { SearchForm } from "./components/SearchForm/SearchForm.tsx";
import { FiltersPanel } from "./components/Filters/FiltersPanel.tsx";
import { PriceGraph } from "./components/Graph/PriceGraph.tsx";
import { ResultsList } from "./components/Results/ResultsList.tsx";
import type { SortKey } from "./components/Results/ResultsList.tsx";
import { Drawer } from "./components/ui/Drawer.tsx";
import { Button } from "./components/ui/Button.tsx";
export default function App() {
    const rawOffers = useFlightSearchStore((s) => s.rawOffers);
    const filters = useFlightSearchStore((s) => s.filters);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [mobileSortOpen, setMobileSortOpen] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey>("CHEAPEST");

    // Single memoized filtered list so graph + results stay in sync and avoid duplicate work.
    const filteredOffers = useMemo(() => filterFlights(rawOffers, filters), [rawOffers, filters]);
    const activeFilters = useMemo(() => {
        let count = 0;
        if (filters.maxStops !== null) count += 1;
        if (filters.airlines.length > 0) count += 1;
        if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 999999) count += 1;
        return count;
    }, [filters]);

    return (
        <>
        <div className="min-h-[100dvh] w-full pb-[calc(56px+env(safe-area-inset-bottom))] text-[var(--text)] lg:pb-0">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-white/5 backdrop-blur-xl">
                <Container maxWidth="lg" className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-[20px] font-semibold tracking-tight text-transparent bg-gradient-to-r from-[var(--hero-from)] to-[var(--hero-to)] bg-clip-text drop-shadow-[0_0_10px_rgba(34,211,238,0.15)]">
                            Neon Flight Search
                        </h1>
                        <p className="text-[12px] text-[var(--muted)]">Explore fares with live filters and charts</p>
                    </div>
                    <div className="text-[11px] text-[var(--muted)]">
                        {filteredOffers.length} flights • Updated now
                    </div>
                </Container>
                <div className="h-1 w-full bg-gradient-to-r from-[var(--neon-purple)] via-[var(--neon-cyan)] to-[var(--neon-pink)] opacity-60" />
                <Container maxWidth="lg" className="flex items-center justify-between py-2 text-xs text-[var(--muted)]">
                    <span>{filteredOffers.length} flights</span>
                    <span>Filters active: {activeFilters}</span>
                </Container>
            </header>

            <main className="relative py-6">
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: "grid",
                            gap: 3,
                            gridTemplateColumns: { xs: "1fr", lg: "1fr 3fr" },
                            alignItems: "start",
                        }}
                    >
                        <Box sx={{ display: { xs: "none", lg: "block" }, position: "sticky", top: 96 }}>
                            <FiltersPanel offers={rawOffers}/>
                        </Box>

                        <Stack spacing={3}>
                            <div className="relative">
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute -left-16 -top-10 h-64 w-64 rounded-full bg-[var(--neon-cyan)]/18 blur-3xl"
                                />
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute -right-10 -top-16 h-72 w-72 rounded-full bg-[var(--neon-purple)]/16 blur-3xl"
                                />
                                <div className="relative z-10">
                                    <SearchForm/>
                                </div>
                            </div>

                            <PriceGraph offers={filteredOffers}/>

                            <ResultsList offers={filteredOffers} sortKey={sortKey} onSortChange={setSortKey}/>
                        </Stack>
                    </Box>
                </Container>
            </main>
        </div>

        <Drawer
            open={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
            title="Filters"
            footer={
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => setMobileFiltersOpen(false)}
                    >
                        Close
                    </Button>
                    <Button
                        size="sm"
                        className="w-full"
                        onClick={() => setMobileFiltersOpen(false)}
                    >
                        Apply
                    </Button>
                </div>
            }
        >
            <FiltersPanel offers={rawOffers}/>
        </Drawer>

        <Drawer
            open={mobileSortOpen}
            onClose={() => setMobileSortOpen(false)}
            title="Sort"
            footer={
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => setMobileSortOpen(false)}
                    >
                        Close
                    </Button>
                    <Button
                        size="sm"
                        className="w-full"
                        onClick={() => setMobileSortOpen(false)}
                    >
                        Apply
                    </Button>
                </div>
            }
        >
            <div className="space-y-2">
                <p className="text-xs text-neutral-500">Choose how to order results</p>
                <div className="grid grid-cols-1 gap-2">
                    <Button
                        variant={sortKey === "CHEAPEST" ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => setSortKey("CHEAPEST")}
                    >
                        Cheapest
                    </Button>
                    <Button
                        variant={sortKey === "FASTEST" ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => setSortKey("FASTEST")}
                    >
                        Fastest
                    </Button>
                    <Button
                        variant={sortKey === "LEAST_STOPS" ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => setSortKey("LEAST_STOPS")}
                    >
                        Least stops
                    </Button>
                </div>
            </div>
        </Drawer>

        {/* Mobile sticky action bar */}
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-white/10 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-3" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setMobileFiltersOpen(true)}>
                    Filters
                </Button>
                <div className="flex-1 text-center text-xs font-semibold text-[var(--text)]">
                    {filteredOffers.length} results
                </div>
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setMobileSortOpen(true)}>
                    Sort
                </Button>
            </div>
        </div>
        </>
    );
}
