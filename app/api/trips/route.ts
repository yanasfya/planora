import { NextResponse } from "next/server";
import { listTrips, createTrip } from "@/lib/trip-service";
import { TripInputSchema } from "@/lib/zod-schemas";

export async function GET() {
  const trips = await listTrips();
  return NextResponse.json(trips);
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = TripInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const trip = await createTrip(parsed.data);
  return NextResponse.json(trip, { status: 201 });
}
