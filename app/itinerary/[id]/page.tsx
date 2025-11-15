"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ItinerarySchema, type Itinerary } from "@lib/types";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BentoGrid, BentoCard } from "../../components/BentoGrid";
import DayCard from "../../components/widgets/DayCard";
import WeatherWidget from "../../components/widgets/WeatherWidget";
import MapWidget from "../../components/widgets/MapWidget";
import HotelWidget from "../../components/widgets/HotelWidget";
import CurrencySelector from "../../components/CurrencySelector";

export default function ItineraryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await fetch(`/api/itineraries/${params.id}`);

        if (!response.ok) {
          setError("Itinerary not found");
          setLoading(false);
          return;
        }

        const data = await response.json();
        const validated = ItinerarySchema.parse(data);
        setItinerary(validated);
      } catch (err) {
        setError("Failed to load itinerary");
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [params.id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Loading itinerary...</p>
        </div>
      </main>
    );
  }

  if (error || !itinerary) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            {error || "Itinerary not found"}
          </h1>
          <p className="mt-4 text-gray-600">
            The itinerary you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  const totalActivities = itinerary.days.reduce(
    (acc, day) => acc + day.activities.length,
    0
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-medium text-gray-700 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
          <CurrencySelector variant="inline" showLabel={true} />
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Your Personalized Itinerary
            </h1>
            <p className="mt-2 text-gray-600">
              <span className="font-semibold">{itinerary.prefs.destination}</span> •{" "}
              {itinerary.prefs.startDate} to {itinerary.prefs.endDate}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                {itinerary.prefs.budget}
              </span>
              {itinerary.prefs.interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="rounded-xl bg-white px-6 py-3 font-semibold text-gray-700 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
          >
            Plan New Trip
          </button>
        </div>

        <BentoGrid>
          <BentoCard className="col-span-2 lg:col-span-2 lg:row-span-2">
            <MapWidget
              destination={itinerary.prefs.destination}
              activityCount={totalActivities}
            />
          </BentoCard>

          <BentoCard className="col-span-2 lg:col-span-4">
            <WeatherWidget destination={itinerary.prefs.destination} />
          </BentoCard>

          {itinerary.days.map((day) => (
            <BentoCard key={day.day} className="col-span-2 lg:col-span-2">
              <DayCard day={day} />
            </BentoCard>
          ))}

          <BentoCard className="col-span-2 lg:col-span-2">
            <HotelWidget
              destination={itinerary.prefs.destination}
              budget={itinerary.prefs.budget}
              checkInDate={itinerary.prefs.startDate}
              checkOutDate={itinerary.prefs.endDate}
            />
          </BentoCard>
        </BentoGrid>
      </div>
    </main>
  );
}
