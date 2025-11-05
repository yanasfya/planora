import { create } from "zustand";

export type Activity = {
  title?: string;
  time?: string;
  description?: string;
};

export type DayPlan = {
  title?: string;
  date?: string;
  summary?: string;
  activities?: Activity[];
};

export type ItineraryResponse = {
  destination?: string;
  duration?: string;
  budget?: string;
  interests?: string[];
  overview?: string;
  summary?: string;
  tips?: string[];
  days?: DayPlan[];
  [key: string]: unknown;
};

type TripState = {
  itinerary: ItineraryResponse | null;
  loading: boolean;
  error: string | null;
  setItinerary: (itinerary: ItineraryResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

export const useTripStore = create<TripState>((set) => ({
  itinerary: null,
  loading: false,
  error: null,
  setItinerary: (itinerary) => set({ itinerary }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ itinerary: null, error: null }),
}));
