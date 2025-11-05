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
