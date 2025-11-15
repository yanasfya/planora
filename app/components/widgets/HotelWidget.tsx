"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Hotel as HotelIcon, Star, DollarSign, ExternalLink, Loader2, AlertCircle, MapPin } from "lucide-react";
import { useCurrency } from "@/app/contexts/CurrencyContext";
import { formatPrice } from "@/lib/currency";

interface Hotel {
  id: string;
  name: string;
  price: number;
  priceUSD: number;
  currency: string;
  rating: number;
  image: string;
  amenities: string[];
  location: string;
  bookingUrl: string;
}

interface HotelsResponse {
  hotels: Hotel[];
  city: string;
  budget: string;
  currency: {
    code: string;
    symbol: string;
    autoDetected: boolean;
  };
}

interface HotelWidgetProps {
  destination: string;
  budget: "low" | "medium" | "high";
  checkInDate?: string;
  checkOutDate?: string;
  className?: string;
}

export default function HotelWidget({
  destination,
  budget,
  checkInDate,
  checkOutDate,
  className = ""
}: HotelWidgetProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currencyInfo, setCurrencyInfo] = useState<{ code: string; symbol: string } | null>(null);

  const { getActiveCurrency, setAutoDetectedCurrency } = useCurrency();
  const activeCurrency = getActiveCurrency();

  const budgetRanges = {
    low: { label: "Budget", range: "$50-100/night" },
    medium: { label: "Moderate", range: "$100-250/night" },
    high: { label: "Luxury", range: "$250+/night" },
  };

  const currentBudget = budgetRanges[budget];

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build API URL with dates and currency
        let url = `/api/hotels?destination=${encodeURIComponent(destination)}&budget=${budget}`;

        if (checkInDate && checkOutDate) {
          url += `&dates=${checkInDate},${checkOutDate}`;
        }

        // Add currency parameter
        url += `&currency=${activeCurrency}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch hotels");
        }

        const data: HotelsResponse = await response.json();
        setHotels(data.hotels);
        setCurrencyInfo(data.currency);

        // Set auto-detected currency from API if it was auto-detected
        if (data.currency?.autoDetected) {
          setAutoDetectedCurrency(data.currency.code);
        }
      } catch (err) {
        console.error("Hotels fetch error:", err);
        setError("Unable to load hotels");
      } finally {
        setLoading(false);
      }
    };

    if (destination && budget) {
      fetchHotels();
    }
  }, [destination, budget, checkInDate, checkOutDate, activeCurrency]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HotelIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Recommended Hotels
            </h3>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl bg-gray-200 p-4"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="h-24 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || hotels.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HotelIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Recommended Hotels
            </h3>
          </div>
          <AlertCircle className="h-5 w-5 text-orange-600" />
        </div>
        <div className="rounded-xl bg-orange-50 p-4 text-center">
          <p className="text-sm text-gray-700">
            {error || "No hotels available"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Check Booking.com for options
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HotelIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Recommended Hotels
          </h3>
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          {currentBudget.label}
        </span>
      </div>

      <div className="space-y-3">
        {hotels.map((hotel, i) => (
          <motion.div
            key={hotel.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 transition-all hover:border-blue-300 hover:shadow-md"
          >
            {hotel.image && hotel.image !== "/placeholder-hotel.jpg" && (
              <div className="relative h-32 w-full overflow-hidden bg-gray-100">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{hotel.name}</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: hotel.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    {hotel.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{hotel.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {hotel.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(hotel.price, hotel.currency)}
                  </div>
                  <p className="text-xs text-gray-500">per night</p>
                </div>
              </div>
              <a
                href={hotel.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Book Now
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-lg bg-blue-50 p-3 text-center">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Estimated range:</span>{" "}
          {currentBudget.range}
        </p>
      </div>
    </div>
  );
}
