import type { FlightOffer } from "../types/flights";

const CURRENCY = "USD";

type Seed = {
    from: string;
    to: string;
    via?: string[];
    stops: number;
    airline: string;
    departAt: string;
    durationMinutes: number; // end-to-end including layovers
    price: number;
};

type Adjustments = {
    priceDelta?: number;
    departShift?: number;   // minutes
    durationDelta?: number; // minutes
    extraStop?: boolean;
};

const fallbackConnections = ["DXB", "DOH", "IST", "DEL", "BKK", "SIN", "KUL", "CMB"];

const seeds: Seed[] = [
    { from: "DAC", to: "DXB", stops: 0, airline: "EK", departAt: "2024-08-20T05:40:00Z", durationMinutes: 430, price: 480 },
    { from: "DAC", to: "DOH", stops: 0, airline: "QR", departAt: "2024-08-20T07:15:00Z", durationMinutes: 370, price: 450 },
    { from: "DAC", to: "IST", via: ["DXB"], stops: 1, airline: "TK", departAt: "2024-08-20T09:00:00Z", durationMinutes: 620, price: 520 },
    { from: "DAC", to: "DEL", stops: 0, airline: "AI", departAt: "2024-08-20T10:10:00Z", durationMinutes: 140, price: 210 },
    { from: "DAC", to: "SIN", stops: 0, airline: "SQ", departAt: "2024-08-20T12:20:00Z", durationMinutes: 250, price: 430 },
    { from: "DAC", to: "KUL", via: ["CMB"], stops: 1, airline: "UL", departAt: "2024-08-20T14:00:00Z", durationMinutes: 310, price: 320 },
    { from: "DAC", to: "HKG", via: ["BKK"], stops: 1, airline: "CX", departAt: "2024-08-20T16:30:00Z", durationMinutes: 520, price: 610 },
    { from: "DAC", to: "JED", via: ["DOH"], stops: 1, airline: "EK", departAt: "2024-08-20T18:10:00Z", durationMinutes: 520, price: 540 },
    { from: "DAC", to: "FRA", via: ["IST", "VIE"], stops: 2, airline: "TK", departAt: "2024-08-21T01:40:00Z", durationMinutes: 930, price: 780 },
    { from: "DAC", to: "JFK", via: ["DXB"], stops: 1, airline: "EK", departAt: "2024-08-21T03:10:00Z", durationMinutes: 1180, price: 960 },
    { from: "DAC", to: "LHR", via: ["DOH"], stops: 1, airline: "QR", departAt: "2024-08-21T05:30:00Z", durationMinutes: 980, price: 880 },
    { from: "DAC", to: "BOM", stops: 0, airline: "AI", departAt: "2024-08-21T07:00:00Z", durationMinutes: 170, price: 190 },
    { from: "DAC", to: "BKK", stops: 0, airline: "BG", departAt: "2024-08-21T09:30:00Z", durationMinutes: 145, price: 240 },
    { from: "DAC", to: "MEL", via: ["SIN", "KUL"], stops: 2, airline: "SQ", departAt: "2024-08-21T08:45:00Z", durationMinutes: 1150, price: 1200 },
    { from: "DAC", to: "CDG", via: ["IST"], stops: 1, airline: "TK", departAt: "2024-08-21T10:15:00Z", durationMinutes: 950, price: 820 },
    { from: "DAC", to: "YYZ", via: ["DOH", "LHR"], stops: 2, airline: "QR", departAt: "2024-08-21T12:05:00Z", durationMinutes: 1180, price: 1050 },
];

const addMinutes = (iso: string, minutes: number) => {
    const date = new Date(iso);
    date.setUTCMinutes(date.getUTCMinutes() + minutes);
    return date.toISOString();
};

const fillConnections = (via: string[] | undefined, stops: number, seedIndex: number) => {
    const connectors = [...(via ?? [])];
    let cursor = seedIndex;
    while (connectors.length < stops) {
        connectors.push(fallbackConnections[cursor % fallbackConnections.length]);
        cursor++;
    }
    return connectors.slice(0, stops);
};

const buildOffer = (seed: Seed, idx: number, variant: string, adjustments: Adjustments = {}): FlightOffer => {
    const stops = adjustments.extraStop && seed.stops < 2 ? seed.stops + 1 : seed.stops;
    const via = fillConnections(seed.via, stops, idx);
    const layoverPerStop = 60;
    const totalLayover = stops * layoverPerStop;
    const totalDuration = Math.max(
        seed.durationMinutes + (adjustments.durationDelta ?? 0),
        (stops + 1) * 90 + totalLayover
    );
    const flightBudget = totalDuration - totalLayover;
    const legCount = stops + 1;
    const baseLeg = Math.max(70, Math.floor(flightBudget / legCount));
    let remainder = flightBudget - baseLeg * legCount;

    const path = [seed.from, ...via, seed.to];
    const segments: FlightOffer["segments"] = [];
    let departCursor = new Date(addMinutes(seed.departAt, adjustments.departShift ?? 0));

    for (let i = 0; i < legCount; i++) {
        const legDuration = baseLeg + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder -= 1;

        const arriveIso = addMinutes(departCursor.toISOString(), legDuration);
        segments.push({
            from: path[i],
            to: path[i + 1],
            departAt: departCursor.toISOString(),
            arriveAt: arriveIso,
            airline: seed.airline,
            durationMinutes: legDuration,
        });

        if (i < legCount - 1) {
            departCursor = new Date(addMinutes(arriveIso, layoverPerStop));
        } else {
            departCursor = new Date(arriveIso);
        }
    }

    const lastSegment = segments[segments.length - 1];

    return {
        id: `demo-${variant}-${idx + 1}`,
        priceTotal: seed.price + (adjustments.priceDelta ?? 0),
        currency: CURRENCY,
        airlineCodes: [seed.airline],
        stops,
        durationMinutes: flightBudget + totalLayover,
        departAt: segments[0].departAt,
        arriveAt: lastSegment.arriveAt,
        segments,
    };
};

const generateVariant = (
    variant: string,
    adjuster?: (idx: number, seed: Seed) => Adjustments
): FlightOffer[] => seeds.map((seed, idx) => buildOffer(seed, idx, variant, adjuster?.(idx, seed) ?? {}));

export const getDemoFlights = (): FlightOffer[] => {
    const firstPass = generateVariant("A", (idx) => ({
        priceDelta: (idx % 4) * 5,
        departShift: idx * 20,
        durationDelta: (idx % 3) * 10,
    }));

    const secondPass = generateVariant("B", (idx) => ({
        priceDelta: 40 + idx * 3,
        departShift: 24 * 60 + idx * 15,
        durationDelta: 30,
        extraStop: idx % 5 === 0,
    }));

    return [...firstPass, ...secondPass];
};
