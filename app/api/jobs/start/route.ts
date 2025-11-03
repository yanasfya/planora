import { NextResponse } from "next/server";
import { mapPromptFromTrip, generateItinerary } from "@/lib/llm";
import { TripInputSchema } from "@/lib/zod-schemas";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = TripInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const prompt = await mapPromptFromTrip(parsed.data);
  const trip = await generateItinerary({ prompt });
  return NextResponse.json({ jobId: `job-${crypto.randomUUID()}`, prompt, preview: trip });
}
