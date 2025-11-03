import { TripInput, TripSchema, TripDocument } from "@/lib/zod-schemas";
import { sampleTrips } from "@/lib/sample-data";

export interface LLMGenerateParams {
  prompt: string;
  signal?: AbortSignal;
}

export async function generateItinerary({ prompt }: LLMGenerateParams): Promise<TripDocument> {
  // Mocked LLM call for demo purposes.
  const mockTrip = sampleTrips[0];
  const merged = { ...mockTrip, id: `trip-${crypto.randomUUID()}` } satisfies TripDocument;
  return TripSchema.parse(merged);
}

export async function validateTripJson(json: unknown): Promise<TripDocument> {
  return TripSchema.parse(json);
}

export async function mapPromptFromTrip(input: TripInput): Promise<string> {
  return `Create a ${input.itinerary.length}-day trip for ${input.travelers} travelers to ${input.destination} with focus on ${input.preferences.join(", ")}`;
}
