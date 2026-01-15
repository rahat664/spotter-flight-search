import { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from "recharts";
import type { FlightOffer } from "../../types/flights";
import {
    deriveAveragePriceByStops,
    deriveAveragePriceByAirline,
    derivePriceBuckets,
    derivePriceStats,
    deriveDepartureHourBuckets,
} from "../../utils/deriveGraphData";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { useFlightSearchStore } from "../../state/useFlightSearchStore";

type Tab = "distribution" | "stops" | "airlines" | "departures";

const tabs: { label: string; value: Tab }[] = [
    { label: "Distribution", value: "distribution" },
    { label: "By Stops", value: "stops" },
    { label: "By Airline", value: "airlines" },
    { label: "Departure Time", value: "departures" },
];

export function PriceGraph({ offers }: { offers: FlightOffer[] }) {
    const [tab, setTab] = useState<Tab>("distribution");
    const isSearching = useFlightSearchStore((s) => s.isSearching);
    const isLoading = isSearching && offers.length === 0;
    const selectedIndex = tabs.findIndex((t) => t.value === tab);

    const distributionData = useMemo(() => derivePriceBuckets(offers, 10), [offers]);
    const stopsData = useMemo(() => deriveAveragePriceByStops(offers), [offers]);
    const airlinesData = useMemo(() => deriveAveragePriceByAirline(offers), [offers]);
    const departureData = useMemo(() => deriveDepartureHourBuckets(offers), [offers]);
    const stats = useMemo(() => derivePriceStats(offers), [offers]);

    const formatTooltip = (value: number | string) => [value ?? 0, "Count"];
    const formatStopsTooltip = (value: number | string) => [`${value}`, "Avg Price"];

    const xTickFormatter = (label: string) => {
        if (label.length <= 8) return label;
        return label.replace("–", "-");
    };

    const content =
        tab === "distribution" ? (
            <BarChart data={distributionData} margin={{ left: 4, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                    dataKey="label"
                    tickFormatter={xTickFormatter}
                    interval={distributionData.length > 6 ? 1 : 0}
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                />
                <YAxis allowDecimals={false} tickFormatter={(v) => `${v}`} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <Tooltip
                    contentStyle={{
                        background: "rgba(9,12,20,0.9)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                    }}
                    labelStyle={{ color: "var(--muted)", fontSize: 12 }}
                    formatter={formatTooltip as any}
                    labelFormatter={(label: string) => `Range: ${label}`}
                />
                <Bar dataKey="count" fill="url(#gradDistribution)" isAnimationActive animationDuration={500} />
                <defs>
                    <linearGradient id="gradDistribution" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="var(--neon-purple)" stopOpacity="0.85" />
                    </linearGradient>
                </defs>
            </BarChart>
        ) : tab === "stops" ? (
            <BarChart data={stopsData} margin={{ left: 4, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <YAxis allowDecimals={false} tickFormatter={(v) => `${v}`} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <Tooltip
                    contentStyle={{
                        background: "rgba(9,12,20,0.9)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                    }}
                    labelStyle={{ color: "var(--muted)", fontSize: 12 }}
                    formatter={formatStopsTooltip as any}
                />
                <Bar dataKey="avg" fill="url(#gradStops)" isAnimationActive animationDuration={500} />
                <defs>
                    <linearGradient id="gradStops" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="var(--neon-green)" stopOpacity="0.85" />
                    </linearGradient>
                </defs>
            </BarChart>
        ) : tab === "airlines" ? (
            <BarChart data={airlinesData} margin={{ left: 4, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <YAxis allowDecimals={false} tickFormatter={(v) => `${v}`} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <Tooltip
                    contentStyle={{
                        background: "rgba(9,12,20,0.9)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                    }}
                    labelStyle={{ color: "var(--muted)", fontSize: 12 }}
                    formatter={formatTooltip as any}
                    labelFormatter={(label: string) => `Airline: ${label}`}
                />
                <Bar dataKey="avg" fill="url(#gradAirlines)" isAnimationActive animationDuration={500} />
                <defs>
                    <linearGradient id="gradAirlines" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="var(--neon-purple)" stopOpacity="0.85" />
                    </linearGradient>
                </defs>
            </BarChart>
        ) : tab === "departures" ? (
            <LineChart data={departureData} margin={{ left: 4, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <YAxis allowDecimals={false} tickFormatter={(v) => `${v}`} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <Tooltip
                    contentStyle={{
                        background: "rgba(9,12,20,0.9)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                    }}
                    labelStyle={{ color: "var(--muted)", fontSize: 12 }}
                    formatter={((val: any, name: any) => [val ?? 0, name === "min" ? "Min Price" : "Avg Price"]) as any}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted)" }} />
                <Line type="monotone" dataKey="avg" stroke="var(--neon-cyan)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive animationDuration={500} name="Avg Price" />
                <Line type="monotone" dataKey="min" stroke="var(--neon-purple)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive animationDuration={500} name="Min Price" />
            </LineChart>
        ) : (
            <BarChart data={stopsData} margin={{ left: 4, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <YAxis allowDecimals={false} tickFormatter={(v) => `${v}`} tick={{ fill: "var(--muted)", fontSize: 11 }} />
                <Tooltip
                    contentStyle={{
                        background: "rgba(9,12,20,0.9)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                    }}
                    labelStyle={{ color: "var(--muted)", fontSize: 12 }}
                    formatter={formatTooltip as any}
                />
                <Bar dataKey="avg" fill="url(#gradStops)" isAnimationActive animationDuration={500} />
                <defs>
                    <linearGradient id="gradStops" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="var(--neon-green)" stopOpacity="0.85" />
                    </linearGradient>
                </defs>
            </BarChart>
        );

    return (
        <Card className="w-full min-w-0">
            <CardHeader className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-[14px] font-semibold text-[var(--text)]">Live Price Graph</h2>
                    <p className="text-[12px] text-[var(--muted)]">{offers.length} flights</p>
                </div>
                <div className="relative flex rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur transition duration-200 motion-reduce:transition-none">
                    <div
                        className="absolute inset-y-1 rounded-full bg-white/10 transition-all duration-200 motion-reduce:transition-none"
                        style={{
                            left: `${(100 / tabs.length) * selectedIndex}%`,
                            width: `${100 / tabs.length}%`,
                        }}
                    />
                    {tabs.map((t) => (
                        <Button
                            key={t.value}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setTab(t.value)}
                            className={`flex-1 rounded-full ${tab === t.value ? "text-[var(--text)]" : "text-[var(--muted)]"}`}
                        >
                            {t.label}
                        </Button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {stats && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                        <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-[var(--text)]">
                            Min: <span className="text-[var(--text)] font-semibold">{stats.min}</span>
                        </span>
                        <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-[var(--text)]">
                            Median: <span className="text-[var(--neon-cyan)] font-semibold">{stats.median}</span>
                        </span>
                        <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-[var(--text)]">
                            Max: <span className="text-[var(--text)] font-semibold">{stats.max}</span>
                        </span>
                    </div>
                )}
                <div className="h-64 w-full" style={{ minWidth: 0 }}>
                    {isLoading && (
                        <div className="h-full animate-pulse rounded-[var(--radius)] border border-white/10 bg-white/5" />
                    )}
                    {!isLoading && (
                        <ResponsiveContainer width="100%" height="100%">
                            {content}
                        </ResponsiveContainer>
                    )}
                </div>
                <p className="text-xs text-[var(--muted)]">Filters affect this chart. Updates instantly.</p>
            </CardContent>
        </Card>
    );
}
