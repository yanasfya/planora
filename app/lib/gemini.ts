import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import type { Prefs } from "@lib/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  "models/gemini-2.5-pro",
  "models/gemini-2.5-flash",
].filter(Boolean) as string[];

const BudgetEnum = z.enum(["low", "medium", "high"]);
const CoercedBudget = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
  BudgetEnum
);

const RESPONSE_SCHEMA = z.object({
  prefs: z.object({
    destination: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    budget: CoercedBudget,
    interests: z.array(z.string()).default([]),
  }),
  days: z
    .array(
      z.object({
        day: z.number().int().min(1),
        summary: z.string().optional(),
        activities: z
          .array(
            z.object({
              title: z.string(),
              time: z.string(),
              location: z.string(),
            })
          )
          .min(1),
      })
    )
    .min(1),
});

export async function generateItinerary(prefs: Prefs) {
  for (const m of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: m });

      const prompt = `
Return ONLY valid JSON matching this shape (no prose):

{
  "prefs": {
    "destination": "${prefs.destination}",
    "startDate": "${prefs.startDate}",
    "endDate": "${prefs.endDate}",
    "budget": "${prefs.budget}"
  },
  "days": [
    {
      "day": <1-based day index>,
      "summary": "<one-sentence summary>",
      "activities": [
        { "title": "<what>", "time": "<HH:MM>", "location": "<where>" },
        { "title": "<what>", "time": "<HH:MM>", "location": "<where>" },
        { "title": "<what>", "time": "<HH:MM>", "location": "<where>" }
      ]
    }
  ]
}

Rules:
- Output **only** JSON (no markdown fences).
- Keep "budget" lowercase exactly.
- Times in 24h HH:MM.
- Ensure all required fields exist.
`;

      const res = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = res.response.text().trim();

      const json = JSON.parse(text);
      const validated = RESPONSE_SCHEMA.parse(json);

      return validated;
    } catch (e) {
      // Try next model if this one fails
    }
  }

  throw new Error("All candidate models failed to produce valid JSON.");
}
