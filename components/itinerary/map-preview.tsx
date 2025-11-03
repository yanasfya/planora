import type { TripDocument } from "@/lib/zod-schemas";

export function MapPreview({ trip }: { trip: TripDocument }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/60">
      <iframe
        title="Map preview"
        className="h-full w-full"
        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.GOOGLE_MAPS_API_KEY ?? "FAKE_KEY"}&q=${encodeURIComponent(
          trip.destination
        )}`}
        loading="lazy"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/30" />
    </div>
  );
}
