import { memo, useState } from "react";
import type { FlightOffer } from "../../types/flights";
import { formatDuration, formatTime } from "../../utils/format";
import { Card, CardContent } from "../ui/Card";
import { Chip, Button } from "@mui/material";
import { cn } from "../../utils/cn";

const stopsLabel = (stops: number) => {
    if (stops === 0) return "Non-stop";
    if (stops === 1) return "1 stop";
    return `${stops} stops`;
};

type Props = {
    offer: FlightOffer;
    isCheapest?: boolean;
    isBest?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
};

function FlightCardComponent({ offer, isCheapest, isBest, isSelected = false, onSelect }: Props) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <Card
            className={cn(
                "group relative overflow-hidden transition duration-200 hover:-translate-y-[1px]",
                isSelected ? "border-[var(--neon-cyan)] shadow-[0_0_18px_rgba(34,211,238,0.25)]" : "",
                isBest ? "bg-white/12" : ""
            )}
        >
            {isBest && <div className="absolute left-0 top-0 h-full w-1 bg-[var(--neon-cyan)]/70" aria-hidden />}
            <CardContent className="space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-[var(--text)] shadow-[var(--shadow-soft)] transition duration-200",
                                isBest
                                    ? "shadow-[0_0_18px_rgba(34,211,238,0.35)]"
                                    : "group-hover:shadow-[0_0_14px_rgba(34,211,238,0.25)]"
                            )}
                        >
                            {offer.airlineCodes[0]}
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="text-xs text-[var(--muted)]">
                                {offer.airlineCodes.join(", ")}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {isBest && <Chip label="Best" size="small" color="secondary" variant="outlined" />}
                                {isCheapest && <Chip label="Cheapest" size="small" color="primary" variant="outlined" />}
                                <Chip label={stopsLabel(offer.stops)} size="small" variant="outlined" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-right">
                        <div className="text-xl font-bold text-transparent bg-gradient-to-r from-[var(--hero-from)] to-[var(--hero-to)] bg-clip-text drop-shadow-[0_0_10px_rgba(34,211,238,0.15)]">
                            {offer.currency} {offer.priceTotal.toLocaleString()}
                        </div>
                        <Button
                            variant={isSelected ? "contained" : "outlined"}
                            size="small"
                            onClick={onSelect}
                            sx={{
                                borderColor: isSelected ? "var(--neon-cyan)" : "rgba(255,255,255,0.3)",
                                boxShadow: isSelected ? "0 0 14px rgba(34,211,238,0.25)" : "none",
                                textTransform: "none",
                            }}
                        >
                            {isSelected ? "Selected" : "Select"}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text)]">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <span>{formatTime(offer.departAt)}</span>
                        <span className="text-[var(--muted)]">→</span>
                        <span>{formatTime(offer.arriveAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--muted)]">
                        <span className="h-px w-8 bg-white/15" aria-hidden />
                        <span className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                            {offer.segments[0]?.from} → {offer.segments.at(-1)?.to}
                        </span>
                        <span className="h-px w-8 bg-white/15" aria-hidden />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
                    <span>{formatDuration(offer.durationMinutes)}</span>
                    <span>•</span>
                    <span>{stopsLabel(offer.stops)}</span>
                </div>

                <div className="border-t border-white/10 pt-2">
                    <Button
                        size="small"
                        onClick={() => setShowDetails((s) => !s)}
                        sx={{ textTransform: "none" }}
                    >
                        {showDetails ? "Hide details" : "Details"}
                    </Button>
                    {showDetails && (
                        <div className="mt-2 space-y-2 rounded-[var(--radius-sm)] border border-white/10 bg-white/5 p-3 text-xs text-[var(--text)]">
                            {offer.segments.map((seg, idx) => (
                                <div key={idx} className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold">{seg.from}</span>
                                    <span className="text-[var(--muted)]">→</span>
                                    <span className="font-semibold">{seg.to}</span>
                                    <span className="text-[var(--muted)]">{formatTime(seg.departAt)} – {formatTime(seg.arriveAt)}</span>
                                    <span className="text-[var(--muted)]">{formatDuration(seg.durationMinutes)}</span>
                                    <span className="text-[var(--muted)]">{seg.airline}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export const FlightCard = memo(FlightCardComponent);
