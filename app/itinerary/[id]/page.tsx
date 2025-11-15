"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ItinerarySchema, type Itinerary } from "@lib/types";
import { ArrowLeft, Loader2, Share2, Download } from "lucide-react";
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
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-gray-900">
                  {itinerary.prefs.destination}
                </h1>
                <p className="text-sm text-gray-600">
                  {itinerary.prefs.startDate} - {itinerary.prefs.endDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CurrencySelector variant="inline" showLabel={false} />
              <button className="hidden items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:inline-flex">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button className="hidden items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:inline-flex">
                <Download className="h-4 w-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 md:hidden">
          <h1 className="text-2xl font-bold text-gray-900">
            {itinerary.prefs.destination}
          </h1>
          <p className="mt-1 text-gray-600">
            {itinerary.prefs.startDate} - {itinerary.prefs.endDate}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-xl bg-white p-6 shadow-md">
              <WeatherWidget destination={itinerary.prefs.destination} />
            </div>

            {itinerary.days.map((day) => (
              <div key={day.day} className="rounded-xl bg-white shadow-md">
                <DayCard day={day} />
              </div>
            ))}
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="lg:sticky lg:top-24 lg:space-y-6">
              <div className="rounded-xl bg-white p-4 shadow-md">
                <MapWidget
                  destination={itinerary.prefs.destination}
                  activityCount={totalActivities}
                />
              </div>

              <div className="rounded-xl bg-white shadow-md">
                <HotelWidget
                  destination={itinerary.prefs.destination}
                  budget={itinerary.prefs.budget}
                  checkInDate={itinerary.prefs.startDate}
                  checkOutDate={itinerary.prefs.endDate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
