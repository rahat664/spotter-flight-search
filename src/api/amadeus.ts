import { apiClient } from "./client";
import type { SearchParams } from "../types/flights";

export async function searchLocations(query: string) {
    return apiClient<{ data: unknown[] }>(`/api/amadeus/locations?q=${encodeURIComponent(query)}`);
}

export async function searchFlightOffers(params: SearchParams): Promise<unknown> {
    const currency = import.meta.env.VITE_PUBLIC_CURRENCY || "USD";
    const searchParams = new URLSearchParams({
        origin: params.origin,
        destination: params.destination,
        departDate: params.departDate,
        adults: String(params.adults),
        travelClass: params.cabin,
        currencyCode: currency,
        max: "50",
    });

    if (params.returnDate) {
        searchParams.set("returnDate", params.returnDate);
    }

    return apiClient<unknown>(`/api/amadeus/flight-offers?${searchParams.toString()}`);
}
