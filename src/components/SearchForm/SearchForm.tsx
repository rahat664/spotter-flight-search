import { useEffect, useMemo, useState } from "react";
import {
    Paper,
    Typography,
    Stack,
    TextField,
    IconButton,
    Button,
    Chip,
    MenuItem,
    Box,
} from "@mui/material";
import { SwapHoriz } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { useFlightSearchStore } from "../../state/useFlightSearchStore";
import { getDemoFlights } from "../../utils/demoFlights";
import { useFlightOffers } from "../../hooks/useFlightOffers";
import { useAirports } from "../../hooks/useAirports";
import { normalizeAmadeusOffers } from "../../utils/normalizeAmadeus";
import type { FlightOffer } from "../../types/flights";

export function SearchForm() {
    const search = useFlightSearchStore((s) => s.search);
    const setSearch = useFlightSearchStore((s) => s.setSearch);
    const setRawOffers = useFlightSearchStore((s) => s.setRawOffers);
    const setIsSearching = useFlightSearchStore((s) => s.setIsSearching);
    const setLastSearchKey = useFlightSearchStore((s) => s.setLastSearchKey);
    const [banner, setBanner] = useState<string | null>(null);
    const [activeParams, setActiveParams] = useState<typeof search | null>(null);
    const flightOffers = useFlightOffers(activeParams, !!activeParams);
    const [originInput, setOriginInput] = useState(search.origin);
    const [destInput, setDestInput] = useState(search.destination);

const formatDateOffset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return format(d, "yyyy-MM-dd");
};

const recentSearches = [
    { origin: "DAC", destination: "DXB", departDate: formatDateOffset(0), returnDate: formatDateOffset(10) },
    { origin: "DAC", destination: "LHR", departDate: formatDateOffset(0), returnDate: formatDateOffset(10) },
    { origin: "DAC", destination: "SIN", departDate: formatDateOffset(0), returnDate: formatDateOffset(10) },
];

type AirportAutocompleteProps = {
    value: string;
    onChange: (val: string) => void;
    onSelect: (code: string) => void;
    label: string;
    placeholder?: string;
};

function AirportAutocomplete({ value, onChange, onSelect, label, placeholder }: AirportAutocompleteProps) {
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(0);
    const query = value;
    const { data } = useAirports(query, 250);
    const results = (data?.data || []) as any[];

    const handleSelect = (item: any) => {
        const code = (item?.iataCode || "").toUpperCase().slice(0, 3);
        onSelect(code);
        setOpen(false);
        setHighlight(0);
    };

    const items = results.map((r) => {
        const name = r.name || r.address?.cityName || "";
        const city = r.address?.cityName || "";
        const country = r.address?.countryName || "";
        return { ...r, label: `${r.iataCode || ""} — ${name} ${city ? `(${city}, ${country})` : ""}` };
    });

    return (
        <div className="relative w-full">
            <TextField
                fullWidth
                size="small"
                label={label}
                value={value}
                onChange={(e) => {
                    const next = e.target.value;
                    onChange(next);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 120)}
                onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setHighlight((h) => Math.min(h + 1, Math.max(items.length - 1, 0)));
                    } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setHighlight((h) => Math.max(h - 1, 0));
                    } else if (e.key === "Enter") {
                        e.preventDefault();
                        const current = items[highlight];
                        if (current) handleSelect(current);
                        else if (value.length === 3) onSelect(value.toUpperCase());
                    } else if (e.key === "Escape") {
                        setOpen(false);
                    }
                }}
                placeholder={placeholder ?? "Type city or code"}
            />
            {open && items.length > 0 && (
                <Paper
                    elevation={4}
                    className="absolute z-20 mt-1 w-full border border-white/10 bg-white/10"
                    sx={{ backdropFilter: "blur(10px)" }}
                >
                    {items.slice(0, 8).map((item, idx) => (
                        <Button
                            key={`${item.iataCode}-${idx}`}
                            fullWidth
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setHighlight(idx)}
                            sx={{
                                justifyContent: "flex-start",
                                textTransform: "none",
                                color: "var(--text)",
                                backgroundColor: highlight === idx ? "rgba(255,255,255,0.08)" : "transparent",
                                "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
                            }}
                        >
                            <Stack spacing={0.2} alignItems="flex-start">
                                <Typography variant="body2" fontWeight={700}>
                                    {item.iataCode} — {item.name || item.label}
                                </Typography>
                                <Typography variant="caption" color="var(--muted)">
                                    {item.address?.cityName} {item.address?.countryName}
                                </Typography>
                            </Stack>
                        </Button>
                    ))}
                </Paper>
            )}
        </div>
    );
}

    const isValid = useMemo(() => {
        return (
            search.origin.trim().length > 0 &&
            search.destination.trim().length > 0 &&
            search.departDate.trim().length > 0 &&
            (!search.returnDate || search.returnDate >= search.departDate)
        );
    }, [search.origin, search.destination, search.departDate, search.returnDate]);
    const hasDateError = useMemo(() => {
        return Boolean(search.returnDate && search.departDate && search.returnDate < search.departDate);
    }, [search.returnDate, search.departDate]);

    const handleSwap = () => {
        setSearch({ origin: search.destination, destination: search.origin });
        setOriginInput(search.destination);
        setDestInput(search.origin);
    };

    const handleRecentApply = (item: typeof recentSearches[number]) => {
        setSearch({
            ...search,
            origin: item.origin,
            destination: item.destination,
            departDate: item.departDate,
            returnDate: item.returnDate || undefined,
        });
        setOriginInput(item.origin);
        setDestInput(item.destination);
    };

    useEffect(() => {
        if (!banner) return;
        const t = setTimeout(() => setBanner(null), 4000);
        return () => clearTimeout(t);
    }, [banner]);

    useEffect(() => {
        if (flightOffers.isSuccess && flightOffers.data) {
            const normalized = normalizeOffers(flightOffers.data);
            setRawOffers(normalized.length ? normalized : getDemoFlights());
            setIsSearching(false);
        }
        if (flightOffers.isError) {
            setRawOffers(getDemoFlights());
            setBanner("Live search unavailable. Loaded demo flights instead.");
            setIsSearching(false);
        }
    }, [flightOffers.isSuccess, flightOffers.isError, flightOffers.data, setRawOffers, setIsSearching]);

    const handleSearch = () => {
        if (!isValid) return;
        setIsSearching(true);
        setLastSearchKey(JSON.stringify(search));
        setActiveParams(search);
    };

    return (
        <Paper
            elevation={6}
            sx={{
                p: 3,
                borderRadius: 2.5,
                position: "relative",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Stack spacing={0.2}>
                    <Typography variant="subtitle1" fontWeight={700}>Search flights</Typography>
                    <Typography variant="caption" color="var(--muted)">Neon glass UI, instant updates.</Typography>
                </Stack>
                <IconButton color="primary" onClick={handleSwap} sx={{ display: { xs: "none", md: "inline-flex" } }}>
                    <SwapHoriz />
                </IconButton>
            </Stack>

            <Stack spacing={2}>
                <Box
                    sx={{
                        display: "grid",
                        gap: 2,
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    }}
                >
                    <Box>
                        <AirportAutocomplete
                            value={originInput}
                            onChange={setOriginInput}
                            label="Origin"
                            placeholder="City or IATA"
                            onSelect={(code) => {
                                setOriginInput(code);
                                setSearch({ origin: code });
                            }}
                        />
                    </Box>
                    <Box>
                        <AirportAutocomplete
                            value={destInput}
                            onChange={setDestInput}
                            label="Destination"
                            placeholder="City or IATA"
                            onSelect={(code) => {
                                setDestInput(code);
                                setSearch({ destination: code });
                            }}
                        />
                    </Box>
                    <Box>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Depart date"
                                value={search.departDate ? new Date(search.departDate) : null}
                                onChange={(date) => {
                                    const iso = date ? format(date, "yyyy-MM-dd") : "";
                                    setSearch({ departDate: iso });
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small",
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Box>
                    <Box>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Return date (optional)"
                                value={search.returnDate ? new Date(search.returnDate) : null}
                                minDate={search.departDate ? new Date(search.departDate) : undefined}
                                onChange={(date) => {
                                    if (date && search.departDate && date < new Date(search.departDate)) {
                                        setSearch({ returnDate: undefined });
                                        return;
                                    }
                                    const iso = date ? format(date, "yyyy-MM-dd") : "";
                                    setSearch({ returnDate: iso || undefined });
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small",
                                        error: hasDateError,
                                        helperText: hasDateError ? "Must be on/after depart" : "",
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Box>

                    <Box>
                        <Stack spacing={1}>
                            <Typography variant="caption" color="var(--muted)">Adults</Typography>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => setSearch({ adults: Math.max(1, search.adults - 1) })}
                                >
                                    −
                                </IconButton>
                                <TextField
                                    type="number"
                                    size="small"
                                    inputProps={{ min: 1, max: 9, style: { textAlign: "center" } }}
                                    value={search.adults}
                                    onChange={(e) => {
                                        const next = Math.min(9, Math.max(1, Number(e.target.value) || 1));
                                        setSearch({ adults: next });
                                    }}
                                    sx={{ width: 80 }}
                                />
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => setSearch({ adults: Math.min(9, search.adults + 1) })}
                                >
                                    +
                                </IconButton>
                            </Stack>
                        </Stack>
                    </Box>

                    <Box>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Cabin"
                            value={search.cabin}
                            onChange={(e) => setSearch({ cabin: e.target.value as typeof search.cabin })}
                        >
                            <MenuItem value="ECONOMY">Economy</MenuItem>
                            <MenuItem value="PREMIUM_ECONOMY">Premium Economy</MenuItem>
                            <MenuItem value="BUSINESS">Business</MenuItem>
                            <MenuItem value="FIRST">First</MenuItem>
                        </TextField>
                    </Box>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
                    <Button
                        variant="outlined"
                        onClick={() => setRawOffers(getDemoFlights())}
                        sx={{ borderColor: "rgba(255,255,255,0.2)" }}
                        fullWidth
                    >
                        Load demo flights
                    </Button>
                    <Stack direction="row" spacing={1} width={{ xs: "100%", sm: "auto" }}>
                        <IconButton
                            color="primary"
                            onClick={handleSwap}
                            sx={{ display: { xs: "inline-flex", md: "none" }, border: "1px solid rgba(255,255,255,0.15)" }}
                        >
                            <SwapHoriz />
                        </IconButton>
                        <Button
                            onClick={handleSearch}
                            disabled={!isValid || flightOffers.isFetching}
                            sx={{
                                px: 3.5,
                                borderRadius: 3,
                                background: "linear-gradient(90deg, var(--hero-from), var(--hero-to))",
                                color: "#0b1018",
                                boxShadow: "0 0 18px rgba(34,211,238,0.25)",
                                "&:hover": { boxShadow: "0 0 20px rgba(34,211,238,0.3)", background: "linear-gradient(90deg, #34e0f9, #b974ff)" },
                            }}
                        >
                            {flightOffers.isFetching ? "Searching..." : "Search"}
                        </Button>
                    </Stack>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {recentSearches.map((item, idx) => (
                        <Chip
                            key={idx}
                            label={`${item.origin} → ${item.destination}`}
                            onClick={() => handleRecentApply(item)}
                            variant="outlined"
                            sx={{ borderColor: "rgba(255,255,255,0.25)", color: "var(--text)" }}
                        />
                    ))}
                </Stack>

                {!isValid && (
                    <Typography variant="caption" color="var(--neon-pink)">
                        Please fill origin, destination, and depart date.
                    </Typography>
                )}
                {hasDateError && (
                    <Typography variant="caption" color="var(--neon-pink)">
                        Return date must be on or after depart date.
                    </Typography>
                )}

                {banner && (
                    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 1, backgroundColor: "rgba(255, 193, 7, 0.15)", color: "#ffecb3" }}>
                        <Typography variant="caption" fontWeight={700}>{banner}</Typography>
                    </Paper>
                )}
            </Stack>
        </Paper>
    );
}
    const normalizeOffers = (data: any): FlightOffer[] => normalizeAmadeusOffers(data);
