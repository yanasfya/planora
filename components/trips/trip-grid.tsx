"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { TripDocument } from "@/lib/zod-schemas";
import { Button } from "@/components/ui/button";

async function fetchTrips(): Promise<TripDocument[]> {
  const res = await fetch("/api/trips");
  if (!res.ok) throw new Error("Failed to load trips");
  return res.json();
}

export function TripGrid({ initialTrips }: { initialTrips: TripDocument[] }) {
  const { data: trips } = useQuery({
    queryKey: ["trips"],
    queryFn: fetchTrips,
    initialData: initialTrips,
    staleTime: 1000 * 30
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Trips</h2>
        <Button variant="outline" asChild>
          <Link href="/(app)/trip/create">Add trip</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {trips.map((trip) => (
          <Link
            key={trip.id}
            href={`/(app)/trip/${trip.id}`}
            className="group rounded-3xl border border-border/60 bg-card/80 p-6 transition hover:border-primary/60 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{trip.destination}</p>
                <h3 className="mt-1 text-lg font-semibold">{trip.title}</h3>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {trip.status}
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{trip.itinerary.length} day itinerary</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
