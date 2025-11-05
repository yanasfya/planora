// app/api/itineraries/generate/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@lib/db";
import ItineraryModel from "@lib/itineraryModel";
import { PrefsSchema } from "@lib/types";
import { generateItinerary } from "@lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = PrefsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }
    const prefs = parsed.data;         // ✅ use parsed prefs

    await dbConnect();

    try {
      const itinerary = await generateItinerary(prefs); // ✅ pass prefs
      // (optional) validate itinerary with your ItinerarySchema here
      // const valid = ItinerarySchema.parse(itinerary);
      return NextResponse.json(itinerary);
    } catch (err: any) {
      console.error("LLM raw / validation error:", err?.message ?? err);
      return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
    }

  } catch (err: any) {
    console.error("Generate route failed:", err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
