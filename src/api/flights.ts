import type { FlightOffer, SearchParams } from "../types/flights";
import { apiClient } from "./client";

export async function searchFlights(params: SearchParams): Promise<FlightOffer[]> {
    return apiClient<FlightOffer[]>("/api/flights/search", {
        method: "POST",
        body: JSON.stringify(params),
    });
}
