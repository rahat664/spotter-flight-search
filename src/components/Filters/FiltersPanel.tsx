import { useEffect, useMemo, useState } from "react";
import type { FlightOffer } from "../../types/flights";
import { useFlightSearchStore } from "../../state/useFlightSearchStore";
import {
    Paper,
    Stack,
    Typography,
    Button,
    ToggleButtonGroup,
    ToggleButton,
    Chip,
    Collapse,
    Slider,
    Box,
} from "@mui/material";

type StopsOption = {
    label: string;
    value: number | null;
};

const stopOptions: StopsOption[] = [
    { label: "Any", value: null },
    { label: "Non-stop", value: 0 },
    { label: "Up to 1 stop", value: 1 },
    { label: "Up to 2 stops", value: 2 },
];

export function FiltersPanel({ offers }: { offers: FlightOffer[] }) {
    const maxStops = useFlightSearchStore((s) => s.filters.maxStops);
    const selectedAirlines = useFlightSearchStore((s) => s.filters.airlines);
    const priceRange = useFlightSearchStore((s) => s.filters.priceRange);
    const setFilters = useFlightSearchStore((s) => s.setFilters);
    const resetFilters = useFlightSearchStore((s) => s.resetFilters);
    const [showMoreAirlines, setShowMoreAirlines] = useState(false);

    const airlines = useMemo(() => {
        const counts: Record<string, number> = {};
        offers.forEach((o) => {
            o.airlineCodes.forEach((c) => {
                counts[c] = (counts[c] ?? 0) + 1;
            });
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([code, count]) => ({ code, count }));
    }, [offers]);

    const priceStats = useMemo(() => {
        if (offers.length === 0) return null;
        const prices = offers.map((o) => o.priceTotal);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices),
            currency: offers[0].currency,
        };
    }, [offers]);

    useEffect(() => {
        if (!priceStats) return;
        const [min, max] = priceRange;
        const isDefault = min === 0 && max === 999999;
        const invalid = min > max;
        if (isDefault || invalid) {
            setFilters({ priceRange: [priceStats.min, priceStats.max] });
        }
    }, [priceRange, priceStats, setFilters]);

    const handleStopsChange = (value: number | null) => {
        setFilters({ maxStops: value });
    };

    const handleAirlineToggle = (code: string) => {
        const next = selectedAirlines.includes(code)
            ? selectedAirlines.filter((c) => c !== code)
            : [...selectedAirlines, code];
        setFilters({ airlines: next });
    };

    const handleSliderChange = (_: unknown, value: number | number[]) => {
        if (Array.isArray(value) && value.length === 2) {
            setFilters({ priceRange: [value[0], value[1]] });
        }
    };

    const topAirlines = airlines.slice(0, 6);
    const remainingAirlines = airlines.slice(6);
    const activeFilters =
        (maxStops !== null ? 1 : 0) +
        (selectedAirlines.length > 0 ? 1 : 0) +
        (priceRange[0] !== 0 || priceRange[1] !== 999999 ? 1 : 0);

    return (
        <Paper
            elevation={6}
            className="space-y-3"
            sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" className="mb-2">
                <Stack spacing={0.5}>
                    <Typography variant="subtitle1" fontWeight={700}>Filters</Typography>
                    <Typography variant="caption" color="var(--muted)">Neon control deck</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="caption" color="var(--muted)">Active: {activeFilters}</Typography>
                    <Button variant="outlined" size="small" onClick={resetFilters}>Reset</Button>
                </Stack>
            </Stack>

            <Stack spacing={3}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "rgba(255,255,255,0.1)" }}>
                    <Stack spacing={1.5}>
                        <Typography variant="caption" color="var(--muted)" fontWeight={700}>Stops</Typography>
                        <ToggleButtonGroup
                            exclusive
                            value={maxStops}
                            onChange={(_, val) => handleStopsChange(val)}
                            fullWidth
                            size="small"
                            color="primary"
                        >
                            {stopOptions.map((opt) => (
                                <ToggleButton key={opt.label} value={opt.value} sx={{ textTransform: "none" }}>
                                    {opt.label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Stack>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "rgba(255,255,255,0.1)" }}>
                    <Stack spacing={1.5}>
                        <Typography variant="caption" color="var(--muted)" fontWeight={700}>Airlines</Typography>
                        {airlines.length === 0 ? (
                            <Typography variant="caption" color="var(--muted)">Load demo flights to see airlines.</Typography>
                        ) : (
                            <Stack spacing={1}>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                    {topAirlines.map((a) => (
                                        <Chip
                                            key={a.code}
                                            label={`${a.code} · ${a.count}`}
                                            color={selectedAirlines.includes(a.code) ? "primary" : "default"}
                                            variant={selectedAirlines.includes(a.code) ? "filled" : "outlined"}
                                            onClick={() => handleAirlineToggle(a.code)}
                                        />
                                    ))}
                                </Box>
                                {remainingAirlines.length > 0 && (
                                    <Stack spacing={1}>
                                        <Button size="small" variant="text" onClick={() => setShowMoreAirlines((s) => !s)}>
                                            {showMoreAirlines ? "Hide" : "More"} airlines
                                        </Button>
                                        <Collapse in={showMoreAirlines}>
                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                                {remainingAirlines.map((a) => (
                                                    <Chip
                                                        key={a.code}
                                                        label={`${a.code} · ${a.count}`}
                                                        color={selectedAirlines.includes(a.code) ? "primary" : "default"}
                                                        variant={selectedAirlines.includes(a.code) ? "filled" : "outlined"}
                                                        onClick={() => handleAirlineToggle(a.code)}
                                                    />
                                                ))}
                                            </Box>
                                        </Collapse>
                                    </Stack>
                                )}
                            </Stack>
                        )}
                    </Stack>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "rgba(255,255,255,0.1)" }}>
                    <Stack spacing={1.5}>
                        <Typography variant="caption" color="var(--muted)" fontWeight={700}>Price range</Typography>
                        {priceStats && (
                            <Slider
                                value={[priceRange[0], priceRange[1]]}
                                onChange={handleSliderChange}
                                valueLabelDisplay="auto"
                                min={priceStats.min}
                                max={priceStats.max}
                                sx={{ color: "var(--neon-cyan)" }}
                            />
                        )}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="var(--muted)">
                                {priceStats ? `${priceStats.currency} ${priceRange[0]}` : ""}
                            </Typography>
                            <Typography variant="caption" color="var(--muted)">
                                {priceStats ? `${priceStats.currency} ${priceRange[1]}` : ""}
                            </Typography>
                        </Stack>
                    </Stack>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "rgba(255,255,255,0.1)" }}>
                    <Typography variant="caption" color="var(--muted)">
                        {offers.length > 0
                            ? `Unique airlines: ${airlines.length || "—"} • Price span: ${priceStats ? `${priceStats.currency} ${priceStats.min} – ${priceStats.max}` : "—"}`
                            : "Load demo flights to start exploring filters."}
                    </Typography>
                </Paper>
            </Stack>
        </Paper>
    );
}
