export type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export type SearchParams = {
    origin: string;       // IATA code e.g. DAC
    destination: string;  // IATA code e.g. DXB
    departDate: string;   // YYYY-MM-DD
    returnDate?: string;  // optional for roundtrip
    adults: number;
    cabin: CabinClass;
};

export type FlightOffer = {
    id: string;
    priceTotal: number;
    currency: string;

    airlineCodes: string[];      // e.g. ["EK"]
    stops: number;               // 0,1,2...
    durationMinutes: number;     // total duration

    departAt: string;            // ISO
    arriveAt: string;            // ISO
    segments: Array<{
        from: string;
        to: string;
        departAt: string;
        arriveAt: string;
        airline: string;
        flightNumber?: string;
        durationMinutes: number;
    }>;
};

export type FiltersState = {
    maxStops: number | null;      // null = any
    airlines: string[];           // selected airline codes
    priceRange: [number, number]; // min/max
};
