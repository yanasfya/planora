import { connectMongo } from "@/lib/db/mongoose";
import { TripModel } from "@/lib/db/models";
import { sampleTrips } from "@/lib/sample-data";
import { TripDocument, TripInput } from "@/lib/zod-schemas";
import { runEnrichmentPipeline } from "@/lib/enrich";

export async function listTrips(): Promise<TripDocument[]> {
  try {
    await connectMongo();
    const trips = await TripModel.find().lean();
    if (!trips.length) {
      return sampleTrips;
    }
    return trips as TripDocument[];
  } catch (error) {
    console.warn("Falling back to sample trips", error);
    return sampleTrips;
  }
}

export async function getTripById(id: string): Promise<TripDocument | null> {
  try {
    await connectMongo();
    const trip = await TripModel.findOne({ id }).lean();
    if (!trip) {
      return sampleTrips.find((item) => item.id === id) ?? null;
    }
    return trip as TripDocument;
  } catch (error) {
    console.warn("Falling back to sample trip", error);
    return sampleTrips.find((item) => item.id === id) ?? sampleTrips[0];
  }
}

export async function createTrip(payload: TripInput): Promise<TripDocument> {
  const seed = sampleTrips[0];
  const base: TripDocument = {
    ...seed,
    ...payload,
    itinerary: payload.itinerary.length ? payload.itinerary : seed.itinerary,
    lodging: payload.lodging.length ? payload.lodging : seed.lodging,
    weather: payload.weather.length ? payload.weather : seed.weather,
    budget: payload.budget.total > 0 ? payload.budget : seed.budget,
    id: `trip-${crypto.randomUUID()}`
  };

  const enriched = await runEnrichmentPipeline(base);

  try {
    await connectMongo();
    const doc = await TripModel.create(enriched);
    return doc.toObject() as TripDocument;
  } catch (error) {
    console.warn("Persisting trip failed, returning enriched version", error);
    return enriched;
  }
}
