import { useMemo, useState } from "react";
import type { FlightOffer } from "../../types/flights";
import { FlightCard } from "./FlightCard";
import {
    Paper,
    Stack,
    Typography,
    Select as MSelect,
    MenuItem,
    Box,
    Button,
} from "@mui/material";
import { useFlightSearchStore } from "../../state/useFlightSearchStore";

export type SortKey = "CHEAPEST" | "FASTEST" | "LEAST_STOPS";
const sortOptions: { label: string; value: SortKey }[] = [
    { label: "Cheapest", value: "CHEAPEST" },
    { label: "Fastest", value: "FASTEST" },
    { label: "Least stops", value: "LEAST_STOPS" },
];

type Props = {
    offers: FlightOffer[];
    sortKey?: SortKey;
    onSortChange?: (value: SortKey) => void;
};

export function ResultsList({ offers, sortKey, onSortChange }: Props) {
    const [sortState, setSortState] = useState<SortKey>("CHEAPEST");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const resetFilters = useFlightSearchStore((s) => s.resetFilters);
    const isLoading = useFlightSearchStore((s) => s.isSearching);

    const sort = sortKey ?? sortState;
    const setSort = onSortChange ?? setSortState;

    const sorted = useMemo(() => {
        const cloned = [...offers];
        switch (sort) {
            case "FASTEST":
                return cloned.sort((a, b) => a.durationMinutes - b.durationMinutes);
            case "LEAST_STOPS":
                return cloned.sort((a, b) => a.stops - b.stops || a.priceTotal - b.priceTotal);
            case "CHEAPEST":
            default:
                return cloned.sort((a, b) => a.priceTotal - b.priceTotal);
        }
    }, [offers, sort]);

    const minPrice = useMemo(() => Math.min(...(offers.map((o) => o.priceTotal))), [offers]);
    const minDuration = useMemo(() => Math.min(...(offers.map((o) => o.durationMinutes))), [offers]);

    return (
        <Paper elevation={6} sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
                <Typography variant="subtitle1" fontWeight={700}>Results • {offers.length}</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="caption" color="var(--muted)">Sort</Typography>
                    <MSelect
                        size="small"
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortKey)}
                        sx={{ minWidth: 140 }}
                    >
                        {sortOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </MSelect>
                </Stack>
            </Stack>

            <Stack spacing={2}>
                {isLoading && offers.length === 0 && (
                    <Stack spacing={1}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 2, opacity: 0.6 }} />
                        ))}
                    </Stack>
                )}

                {sorted.slice(0, 20).map((o) => (
                    <FlightCard
                        key={o.id}
                        offer={o}
                        isCheapest={o.priceTotal === minPrice}
                        isBest={
                            o.priceTotal <= minPrice * 1.2 &&
                            o.durationMinutes <= minDuration * 1.2
                        }
                        isSelected={selectedId === o.id}
                        onSelect={() => setSelectedId(o.id)}
                    />
                ))}

                {offers.length === 0 && !isLoading && (
                    <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderStyle: "dashed", borderRadius: 2 }}>
                        <Box sx={{ mx: "auto", height: 64, width: 64, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.08)", mb: 1 }} />
                        <Typography variant="subtitle2" fontWeight={700}>No flights match your filters</Typography>
                        <Typography variant="caption" color="var(--muted)">Try resetting filters or loading demo data.</Typography>
                        <Stack mt={2} alignItems="center">
                            <Button variant="outlined" size="small" onClick={resetFilters}>
                                Reset filters
                            </Button>
                        </Stack>
                    </Paper>
                )}
            </Stack>
        </Paper>
    );
}
