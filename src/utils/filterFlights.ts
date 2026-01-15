import type {FiltersState, FlightOffer} from "../types/flights";

export function filterFlights(offers: FlightOffer[], filters: FiltersState) {
    return offers.filter((o) => {
        if (filters.maxStops !== null && o.stops > filters.maxStops) return false;

        if (filters.airlines.length > 0) {
            const has = o.airlineCodes.some((c) => filters.airlines.includes(c));
            if (!has) return false;
        }

        const [minP, maxP] = filters.priceRange;
        return !(o.priceTotal < minP || o.priceTotal > maxP);
    });
}
