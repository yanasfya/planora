"use client";

import { MapPin, Navigation } from "lucide-react";

interface MapWidgetProps {
  destination: string;
  activityCount: number;
  className?: string;
}

export default function MapWidget({
  destination,
  activityCount,
  className = "",
}: MapWidgetProps) {
  return (
    <div className={`flex h-full flex-col ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Location</h3>
        <MapPin className="h-5 w-5 text-blue-600" />
      </div>

      <div className="relative flex-1 overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 via-blue-50 to-green-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 shadow-lg">
              <Navigation className="h-10 w-10 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">{destination}</h4>
            <p className="mt-2 text-sm text-gray-600">
              {activityCount} locations to explore
            </p>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/90 p-3 shadow-md backdrop-blur-sm">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Interactive map</span> coming soon
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          View Map
        </button>
        <button className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
          Directions
        </button>
      </div>
    </div>
  );
}
