import type { FlightOffer } from "../types/flights";

export function parseISODurationToMinutes(iso?: string): number {
    if (!iso) return 0;
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return 0;
    const hours = Number(match[1] || 0);
    const minutes = Number(match[2] || 0);
    return hours * 60 + minutes;
}

export function normalizeAmadeusOffers(raw: any): FlightOffer[] {
    const payload = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
    if (payload.length === 0) return [];

    return payload.map((offer: any, idx: number) => {
        const itineraries = offer.itineraries ?? [];
        const firstItin = itineraries[0] ?? {};
        const segments = (itineraries.flatMap((it: any) => it.segments || [])) as any[];
        const firstSeg = segments[0] || {};
        const lastSeg = segments[segments.length - 1] || firstSeg;
        const carrierCodes = Array.from(
            new Set(
                segments
                    .map((s) => s.carrierCode)
                    .filter(Boolean)
            )
        );

        const durationMinutes = parseISODurationToMinutes(firstItin.duration);
        const stops = Math.max(0, (firstItin.segments?.length || segments.length || 1) - 1);

        const mappedSegments: FlightOffer["segments"] = segments.map((s) => ({
            from: s.departure?.iataCode || "",
            to: s.arrival?.iataCode || "",
            departAt: s.departure?.at || "",
            arriveAt: s.arrival?.at || "",
            airline: s.carrierCode || "",
            durationMinutes: parseISODurationToMinutes(s.duration),
            flightNumber: s.number,
        }));

        return {
            id: offer.id || `offer-${idx}`,
            priceTotal: Number(offer.price?.total) || 0,
            currency: offer.price?.currency || "USD",
            airlineCodes: carrierCodes.length ? carrierCodes : offer.validatingAirlineCodes || [],
            stops,
            durationMinutes,
            departAt: firstSeg.departure?.at || "",
            arriveAt: lastSeg.arrival?.at || "",
            segments: mappedSegments,
        };
    });
}

// Simple dev-time sanity check
if (import.meta.env?.DEV) {
    console.assert(parseISODurationToMinutes("PT2H30M") === 150, "Duration parse failed");
    console.assert(parseISODurationToMinutes("PT45M") === 45, "Duration minutes parse failed");
}
