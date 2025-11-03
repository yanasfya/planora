import { listTrips } from "@/lib/trip-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { TripGrid } from "@/components/trips/trip-grid";

export default async function DashboardPage() {
  const trips = await listTrips();
  const upcoming = trips[0];

  return (
    <div className="space-y-8">
      {upcoming && (
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="bg-gradient-to-br from-primary/15 via-background to-accent/10">
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>Your travel pipeline at a glance.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4">
              <div className="rounded-3xl bg-background/70 p-6">
                <p className="text-sm text-muted-foreground">Active trips</p>
                <p className="mt-2 text-3xl font-semibold">{trips.length}</p>
              </div>
              <div className="rounded-3xl bg-background/70 p-6">
                <p className="text-sm text-muted-foreground">Budget managed</p>
                <p className="mt-2 text-3xl font-semibold">
                  {formatCurrency(upcoming.budget.total, upcoming.budget.currency)}
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-3 rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-6">
                <p className="text-sm text-muted-foreground">Need inspiration?</p>
                <Button asChild>
                  <Link href="/(app)/trip/create">Create new trip</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Live weather</CardTitle>
              <CardDescription>Powered by OpenWeather</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcoming.weather.map((entry) => (
                <div key={entry.date} className="flex items-center justify-between rounded-2xl bg-secondary/40 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">{entry.date}</p>
                    <p className="text-xs text-muted-foreground">{entry.description}</p>
                  </div>
                  <span className="text-sm font-semibold">
                    {entry.temperature.high}° / {entry.temperature.low}°
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      <TripGrid initialTrips={trips} />
    </div>
  );
}
