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
    const prefs = parsed.data;

    await dbConnect();

    try {
      const itinerary = await generateItinerary(prefs);

      const savedItinerary = await ItineraryModel.create(itinerary);

      return NextResponse.json({
        ...itinerary,
        _id: savedItinerary._id.toString(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("LLM validation error:", errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Generate route failed:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
