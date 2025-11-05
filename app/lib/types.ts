// app/lib/types.ts
import { z } from "zod";

// ----- Enums -----
export const BudgetEnum = z.enum(["low", "medium", "high"]);

// ----- Schemas used by the UI + LLM output -----
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
  startDate: z.string().min(4),  // ISO date string from input
  endDate: z.string().min(4),
  // accept "Medium", "HIGH", etc. and coerce to lowercase enum
  budget: z.preprocess(
    (v) => (typeof v === "string" ? v.toLowerCase() : v),
    BudgetEnum
  ),
  interests: z.array(z.string()).default([]),
});

export const ItinerarySchema = z.object({
  _id: z.string().optional(),       // when saved to Mongo
  prefs: PrefsSchema,
  days: z.array(DaySchema).min(1),
  createdAt: z.string().optional(),
});

// ----- Types -----
export type Activity   = z.infer<typeof ActivitySchema>;
export type Day        = z.infer<typeof DaySchema>;
export type Prefs      = z.infer<typeof PrefsSchema>;
export type Itinerary  = z.infer<typeof ItinerarySchema>;
