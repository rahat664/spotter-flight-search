import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchLocations } from "../api/amadeus";

export function useAirports(query: string, debounceMs = 300) {
    const [debounced, setDebounced] = useState(query);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(query), debounceMs);
        return () => clearTimeout(t);
    }, [query, debounceMs]);

    return useQuery({
        queryKey: ["airports", debounced],
        enabled: debounced.length >= 2,
        queryFn: () => searchLocations(debounced),
        staleTime: 1000 * 60,
    });
}
