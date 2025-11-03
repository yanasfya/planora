import { notFound } from "next/navigation";
import { getTripById } from "@/lib/trip-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItineraryTimeline } from "@/components/itinerary/itinerary-timeline";
import { WeatherSidebar } from "@/components/itinerary/weather-sidebar";
import { BudgetChart } from "@/components/itinerary/budget-chart";
import { LodgingTable } from "@/components/tables/lodging-table";
import { MapPreview } from "@/components/itinerary/map-preview";
import { ShareActions } from "@/components/itinerary/share-actions";

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  const trip = await getTripById(params.id);
  const resolvedTrip = trip ?? notFound();

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">{resolvedTrip.destination}</p>
          <h1 className="font-display text-3xl">{resolvedTrip.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {resolvedTrip.startDate} – {resolvedTrip.endDate} • {resolvedTrip.travelers} travelers
          </p>
        </div>
        <ShareActions tripId={resolvedTrip.id} />
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-border/60 bg-card/80 p-6">
                <h2 className="font-display text-xl">Trip summary</h2>
                <p className="mt-3 text-sm text-muted-foreground">{resolvedTrip.notes}</p>
              </div>
              <div className="rounded-3xl border border-border/60 bg-card/80 p-6">
                <h2 className="font-display text-xl">Focus areas</h2>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  {resolvedTrip.preferences.map((preference) => (
                    <span key={preference} className="rounded-full bg-primary/10 px-4 py-2 font-medium text-primary">
                      #{preference}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <WeatherSidebar trip={resolvedTrip} />
          </div>
        </TabsContent>

        <TabsContent value="itinerary">
          <ItineraryTimeline trip={resolvedTrip} />
        </TabsContent>

        <TabsContent value="accommodation">
          <LodgingTable trip={resolvedTrip} />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetChart trip={resolvedTrip} />
        </TabsContent>

        <TabsContent value="map">
          <MapPreview trip={resolvedTrip} />
        </TabsContent>

        <TabsContent value="sharing">
          <div className="space-y-6 rounded-3xl border border-border/60 bg-card/80 p-6 text-sm text-muted-foreground">
            <p>
              Export options trigger serverless functions that render PDF itineraries, calendar feeds, and shareable pages. Use
              them to collaborate with clients and fellow travelers.
            </p>
            <ShareActions tripId={resolvedTrip.id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
