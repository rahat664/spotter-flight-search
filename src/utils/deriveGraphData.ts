import type { FlightOffer } from "../types/flights";

export function derivePriceBuckets(offers: FlightOffer[], buckets = 10) {
    if (offers.length === 0) return [];

    const prices = offers.map((o) => o.priceTotal);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return [{ label: `${min}`, count: offers.length, from: min, to: max }];

    const step = (max - min) / buckets;

    const arr = Array.from({ length: buckets }, (_, i) => {
        const from = min + step * i;
        const to = i === buckets - 1 ? max : min + step * (i + 1);
        return { from, to, count: 0 };
    });

    for (const p of prices) {
        const idx = Math.min(Math.floor((p - min) / step), buckets - 1);
        arr[idx].count += 1;
    }

    return arr.map((b) => ({
        label: `${Math.round(b.from)}–${Math.round(b.to)}`,
        count: b.count,
        from: b.from,
        to: b.to,
    }));
}

export function deriveAveragePriceByStops(offers: FlightOffer[]) {
    const buckets: Record<number, { total: number; count: number }> = {
        0: { total: 0, count: 0 },
        1: { total: 0, count: 0 },
        2: { total: 0, count: 0 },
    };

    for (const offer of offers) {
        const stops = Math.min(offer.stops, 2);
        buckets[stops].total += offer.priceTotal;
        buckets[stops].count += 1;
    }

    return Object.entries(buckets).map(([stops, stats]) => ({
        stops: Number(stops),
        label: stops === "0" ? "Non-stop" : `${stops} stops`,
        avg: stats.count === 0 ? 0 : Math.round(stats.total / stats.count),
        count: stats.count,
    }));
}

export function derivePriceStats(offers: FlightOffer[]) {
    if (offers.length === 0) return null;
    const prices = offers.map((o) => o.priceTotal).sort((a, b) => a - b);
    const min = prices[0];
    const max = prices[prices.length - 1];
    const mid = Math.floor(prices.length / 2);
    const median = prices.length % 2 === 0 ? Math.round((prices[mid - 1] + prices[mid]) / 2) : prices[mid];
    return { min, max, median };
}

export function deriveAveragePriceByAirline(offers: FlightOffer[], maxItems = 8) {
    const buckets: Record<string, { total: number; count: number }> = {};

    for (const offer of offers) {
        offer.airlineCodes.forEach((code) => {
            if (!buckets[code]) buckets[code] = { total: 0, count: 0 };
            buckets[code].total += offer.priceTotal;
            buckets[code].count += 1;
        });
    }

    const entries = Object.entries(buckets)
        .map(([code, stats]) => ({
            airline: code,
            label: code,
            avg: stats.count === 0 ? 0 : Math.round(stats.total / stats.count),
            count: stats.count,
        }))
        .sort((a, b) => b.count - a.count || a.avg - b.avg)
        .slice(0, maxItems);

    return entries;
}

export function deriveDepartureHourBuckets(offers: FlightOffer[]) {
    const buckets: Record<string, { total: number; count: number; min: number }> = {};

    for (const offer of offers) {
        const date = new Date(offer.departAt);
        const hour = date.getUTCHours();
        const bucketStart = Math.floor(hour / 3) * 3; // 0,3,6...
        const key = bucketStart.toString().padStart(2, "0");
        if (!buckets[key]) buckets[key] = { total: 0, count: 0, min: offer.priceTotal };
        buckets[key].total += offer.priceTotal;
        buckets[key].count += 1;
        buckets[key].min = Math.min(buckets[key].min, offer.priceTotal);
    }

    return Object.entries(buckets)
        .map(([key, stats]) => {
            const start = Number(key);
            const end = (start + 3) % 24;
            const label = `${String(start).padStart(2, "0")}:00–${String(end).padStart(2, "0")}:00`;
            return {
                label,
                bucket: start,
                avg: stats.count ? Math.round(stats.total / stats.count) : 0,
                min: stats.min,
            };
        })
        .sort((a, b) => a.bucket - b.bucket);
}
