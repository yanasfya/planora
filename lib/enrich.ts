import { TripDocument, TripSchema } from "@/lib/zod-schemas";
import { sleep } from "@/lib/utils";

export async function enrichTripWithWeather(trip: TripDocument): Promise<TripDocument> {
  await sleep(100);
  return {
    ...trip,
    weather: trip.weather.map((entry, index) => ({
      ...entry,
      description: `${entry.description} • Feels like ${entry.temperature.high - 2 + index}°`
    }))
  };
}

export async function enrichTripWithPois(trip: TripDocument): Promise<TripDocument> {
  await sleep(120);
  return trip;
}

export async function runEnrichmentPipeline(trip: TripDocument): Promise<TripDocument> {
  const enriched = await enrichTripWithWeather(trip);
  return TripSchema.parse(await enrichTripWithPois(enriched));
}
