import type { TripDocument } from "@/lib/zod-schemas";
import Image from "next/image";

export function WeatherSidebar({ trip }: { trip: TripDocument }) {
  return (
    <aside className="rounded-3xl border border-border/60 bg-card p-6">
      <h3 className="font-display text-lg">Weather outlook</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Synced from OpenWeather to help you adjust outdoor plans.
      </p>
      <div className="mt-6 space-y-4">
        {trip.weather.map((entry) => (
          <div key={entry.date} className="flex items-center justify-between rounded-2xl bg-secondary/50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">{entry.date}</p>
              <p className="text-xs text-muted-foreground">{entry.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <Image
                src={`https://openweathermap.org/img/wn/${entry.icon}@2x.png`}
                alt={entry.description}
                width={48}
                height={48}
              />
              <div className="text-sm font-semibold">
                {entry.temperature.high}° / {entry.temperature.low}°
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
