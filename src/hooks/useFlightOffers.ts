import { useQuery } from "@tanstack/react-query";
import { searchFlightOffers } from "../api/amadeus";
import type { SearchParams } from "../types/flights";

export function useFlightOffers(params: SearchParams | null, enabled: boolean) {
    return useQuery({
        queryKey: ["flight-offers", params],
        enabled: enabled && Boolean(params),
        queryFn: () => searchFlightOffers(params as SearchParams),
        retry: 1,
        staleTime: 0,
    });
}
