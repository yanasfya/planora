import { z } from "zod";

export const BudgetEnum = z.enum(["low", "medium", "high"]);

export const PrefsSchema = z.object({
  destination: z.string().min(1),
  startDate: z.string(), // ISO date string from your input
  endDate: z.string(),
  // Coerce any casing (e.g., "Medium", "HIGH") to lowercase and validate
  budget: z.preprocess(
    (v) => (typeof v === "string" ? v.toLowerCase() : v),
    BudgetEnum
  ),
  interests: z.array(z.string()).default([]),
});

export type Prefs = z.infer<typeof PrefsSchema>;
