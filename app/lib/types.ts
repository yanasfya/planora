import { z } from "zod";

export const BudgetEnum = z.enum(["low", "medium", "high"]);

export const ActivitySchema = z.object({
  title: z.string(),
  time: z.string(),
  location: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const DaySchema = z.object({
  day: z.number().int().min(1),
  summary: z.string().optional(),
  activities: z.array(ActivitySchema).min(1),
});

export const PrefsSchema = z.object({
  destination: z.string().min(1),
  startDate: z.string().min(4),
  endDate: z.string().min(4),
  budget: z.preprocess(
    (v) => (typeof v === "string" ? v.toLowerCase() : v),
    BudgetEnum
  ),
  interests: z.array(z.string()).default([]),
});

export const ItinerarySchema = z.object({
  _id: z.string().optional(),
  prefs: PrefsSchema,
  days: z.array(DaySchema).min(1),
  createdAt: z.string().optional(),
});

export type Activity = z.infer<typeof ActivitySchema>;
export type Day = z.infer<typeof DaySchema>;
export type Prefs = z.infer<typeof PrefsSchema>;
export type Itinerary = z.infer<typeof ItinerarySchema>;
