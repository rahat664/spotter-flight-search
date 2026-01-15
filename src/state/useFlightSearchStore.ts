import { create } from "zustand";
import type { FiltersState, SearchParams, FlightOffer } from "../types/flights";

type Store = {
    search: SearchParams;
    filters: FiltersState;

    rawOffers: FlightOffer[];
    setRawOffers: (offers: FlightOffer[]) => void;

    isSearching: boolean;
    setIsSearching: (val: boolean) => void;
    lastSearchKey: string | null;
    setLastSearchKey: (key: string | null) => void;

    setSearch: (patch: Partial<SearchParams>) => void;
    setFilters: (patch: Partial<FiltersState>) => void;
    resetFilters: () => void;
};

const defaultSearch: SearchParams = {
    origin: "",
    destination: "",
    departDate: "",
    adults: 1,
    cabin: "ECONOMY",
};

const defaultFilters: FiltersState = {
    maxStops: null,
    airlines: [],
    priceRange: [0, 999999],
};

export const useFlightSearchStore = create<Store>((set, get) => ({
    search: defaultSearch,
    filters: defaultFilters,
    rawOffers: [],
    setRawOffers: (offers) => set({ rawOffers: offers }),
    isSearching: false,
    setIsSearching: (val) => set({ isSearching: val }),
    lastSearchKey: null,
    setLastSearchKey: (key) => set({ lastSearchKey: key }),

    setSearch: (patch) => set({ search: { ...get().search, ...patch } }),
    setFilters: (patch) => set({ filters: { ...get().filters, ...patch } }),

    resetFilters: () => set({ filters: defaultFilters }),
}));
