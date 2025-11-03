import { z } from "zod";

export const BudgetBreakdownSchema = z.object({
  category: z.string(),
  amount: z.number().nonnegative()
});

export const BudgetSchema = z.object({
  currency: z.string().min(3).max(3),
  total: z.number().nonnegative(),
  breakdown: z.array(BudgetBreakdownSchema)
});

export const ItineraryItemSchema = z.object({
  id: z.string(),
  time: z.string(),
  title: z.string(),
  location: z.string(),
  category: z.string(),
  cost: z.number().nonnegative().optional().default(0),
  notes: z.string().optional()
});

export const DayPlanSchema = z.object({
  day: z.number().int().positive(),
  date: z.string(),
  summary: z.string(),
  items: z.array(ItineraryItemSchema)
});

export const LodgingSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  pricePerNight: z.number().nonnegative(),
  rating: z.number().min(0).max(5),
  url: z.string().url()
});

export const WeatherSchema = z.object({
  date: z.string(),
  icon: z.string(),
  description: z.string(),
  temperature: z.object({ high: z.number(), low: z.number() })
});

export const TripSchema = z.object({
  id: z.string(),
  title: z.string().min(3),
  destination: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  travelers: z.number().int().positive(),
  preferences: z.array(z.string()),
  budget: BudgetSchema,
  itinerary: z.array(DayPlanSchema),
  lodging: z.array(LodgingSchema),
  weather: z.array(WeatherSchema),
  notes: z.string().optional(),
  status: z.enum(["draft", "confirmed", "archived"])
});

export const TripInputSchema = TripSchema.omit({ id: true }).extend({
  userId: z.string().optional()
});

export type TripDocument = z.infer<typeof TripSchema>;
export type TripInput = z.infer<typeof TripInputSchema>;

export const TripFilterSchema = z.object({
  status: z.enum(["draft", "confirmed", "archived"]).optional(),
  q: z.string().optional()
});

export const AuthCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
