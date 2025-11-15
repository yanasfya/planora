import { NextResponse } from "next/server";
import { detectCurrencyFromDestination, convertPrice, CURRENCIES } from "@/lib/currency";

export interface Hotel {
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

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CityPricing {
  low: number;
  medium: number;
  high: number;
  currency: string;
  areas: string[];
  hotelTypes: {
    budget: string[];
    moderate: string[];
    luxury: string[];
  };
}

// In-memory cache with TTL tracking
const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for hotel results

// Comprehensive city pricing database with realistic local prices
const CITY_PRICING: Record<string, CityPricing> = {
  bangkok: {
    low: 25,
    medium: 60,
    high: 180,
    currency: "USD",
    areas: ["Sukhumvit", "Silom", "Riverside", "Old City", "Siam"],
    hotelTypes: {
      budget: ["Hostel", "Guesthouse", "Budget Hotel"],
      moderate: ["Boutique Hotel", "Business Hotel", "City Hotel"],
      luxury: ["Resort", "Grand Hotel", "Luxury Hotel"],
    },
  },
  paris: {
    low: 80,
    medium: 180,
    high: 450,
    currency: "USD",
    areas: ["Marais", "Latin Quarter", "Champs-Élysées", "Montmartre", "Saint-Germain"],
    hotelTypes: {
      budget: ["Budget Hotel", "Pension", "Inn"],
      moderate: ["Boutique Hotel", "Hôtel de Charme", "City Hotel"],
      luxury: ["Palace Hotel", "Grand Hotel", "Luxury Suites"],
    },
  },
  tokyo: {
    low: 65,
    medium: 140,
    high: 380,
    currency: "USD",
    areas: ["Shinjuku", "Shibuya", "Ginza", "Asakusa", "Roppongi"],
    hotelTypes: {
      budget: ["Capsule Hotel", "Business Hotel", "Ryokan"],
      moderate: ["City Hotel", "Boutique Hotel", "Modern Hotel"],
      luxury: ["Imperial Hotel", "Luxury Tower", "Grand Hotel"],
    },
  },
  "new york": {
    low: 120,
    medium: 250,
    high: 550,
    currency: "USD",
    areas: ["Manhattan", "Brooklyn", "Times Square", "SoHo", "Upper East Side"],
    hotelTypes: {
      budget: ["Budget Hotel", "Inn", "Hostel"],
      moderate: ["Boutique Hotel", "City Hotel", "Business Hotel"],
      luxury: ["Luxury Hotel", "Grand Hotel", "5-Star Resort"],
    },
  },
  london: {
    low: 90,
    medium: 200,
    high: 480,
    currency: "USD",
    areas: ["Westminster", "Covent Garden", "Shoreditch", "Kensington", "Camden"],
    hotelTypes: {
      budget: ["Budget Hotel", "B&B", "Inn"],
      moderate: ["Boutique Hotel", "Town House", "City Hotel"],
      luxury: ["Grand Hotel", "Luxury Hotel", "Palace Hotel"],
    },
  },
  barcelona: {
    low: 70,
    medium: 150,
    high: 380,
    currency: "USD",
    areas: ["Gothic Quarter", "Eixample", "Gracia", "Barceloneta", "El Born"],
    hotelTypes: {
      budget: ["Hostal", "Pension", "Budget Hotel"],
      moderate: ["Boutique Hotel", "Casa", "Design Hotel"],
      luxury: ["Grand Hotel", "Luxury Hotel", "Palace"],
    },
  },
  bali: {
    low: 35,
    medium: 85,
    high: 250,
    currency: "USD",
    areas: ["Seminyak", "Ubud", "Canggu", "Nusa Dua", "Sanur"],
    hotelTypes: {
      budget: ["Guesthouse", "Homestay", "Budget Villa"],
      moderate: ["Boutique Resort", "Villa", "Beach Hotel"],
      luxury: ["Luxury Villa", "5-Star Resort", "Private Estate"],
    },
  },
  dubai: {
    low: 95,
    medium: 220,
    high: 600,
    currency: "USD",
    areas: ["Downtown", "Marina", "Palm Jumeirah", "JBR", "Business Bay"],
    hotelTypes: {
      budget: ["Hotel Apartment", "Budget Hotel", "Inn"],
      moderate: ["City Hotel", "Beach Resort", "Business Hotel"],
      luxury: ["Luxury Resort", "7-Star Hotel", "Palace Hotel"],
    },
  },
  rome: {
    low: 75,
    medium: 160,
    high: 400,
    currency: "USD",
    areas: ["Trastevere", "Centro Storico", "Vatican", "Monti", "Trevi"],
    hotelTypes: {
      budget: ["Pensione", "Budget Hotel", "B&B"],
      moderate: ["Boutique Hotel", "Palazzo", "Design Hotel"],
      luxury: ["Grand Hotel", "Luxury Hotel", "Historic Palace"],
    },
  },
  singapore: {
    low: 85,
    medium: 170,
    high: 420,
    currency: "USD",
    areas: ["Marina Bay", "Orchard", "Chinatown", "Sentosa", "Clarke Quay"],
    hotelTypes: {
      budget: ["Budget Hotel", "Capsule Hotel", "Hostel"],
      moderate: ["City Hotel", "Boutique Hotel", "Business Hotel"],
      luxury: ["Luxury Hotel", "Integrated Resort", "5-Star Hotel"],
    },
  },
  sydney: {
    low: 95,
    medium: 190,
    high: 450,
    currency: "USD",
    areas: ["CBD", "Darling Harbour", "Bondi", "The Rocks", "Surry Hills"],
    hotelTypes: {
      budget: ["Budget Hotel", "Hostel", "Motel"],
      moderate: ["Boutique Hotel", "Harbor Hotel", "City Hotel"],
      luxury: ["Luxury Hotel", "5-Star Resort", "Waterfront Hotel"],
    },
  },
};

function extractCityName(destination: string): string {
  const parts = destination.split(",");
  return parts[0].trim();
}

function getCityPricing(city: string): CityPricing {
  const normalized = city.toLowerCase();

  // Check if we have specific pricing for this city
  if (CITY_PRICING[normalized]) {
    return CITY_PRICING[normalized];
  }

  // Default fallback pricing (medium-tier city)
  return {
    low: 60,
    medium: 130,
    high: 300,
    currency: "USD",
    areas: ["Downtown", "City Center", "Historic District", "Waterfront", "Old Town"],
    hotelTypes: {
      budget: ["Budget Hotel", "Hostel", "Inn"],
      moderate: ["Boutique Hotel", "City Hotel", "Business Hotel"],
      luxury: ["Luxury Hotel", "Grand Hotel", "Resort"],
    },
  };
}

function generateBookingUrl(
  city: string,
  budget: "low" | "medium" | "high",
  pricing: CityPricing,
  checkInDate?: string,
  checkOutDate?: string,
  hotelIndex: number = 0
): string {
  // Use provided dates or default to 30 days from now
  let checkIn = checkInDate;
  let checkOut = checkOutDate;

  if (!checkIn || !checkOut) {
    const defaultCheckIn = new Date();
    defaultCheckIn.setDate(defaultCheckIn.getDate() + 30);
    const defaultCheckOut = new Date(defaultCheckIn);
    defaultCheckOut.setDate(defaultCheckOut.getDate() + 2);

    checkIn = defaultCheckIn.toISOString().split("T")[0];
    checkOut = defaultCheckOut.toISOString().split("T")[0];
  }

  // Get price range based on budget with variation per hotel
  const basePrice = pricing[budget];
  const priceVariations = [
    { min: 0.85, max: 1.15 }, // Hotel 1: ±15%
    { min: 0.80, max: 1.20 }, // Hotel 2: ±20%
    { min: 0.75, max: 1.25 }, // Hotel 3: ±25%
  ];

  const variation = priceVariations[hotelIndex] || priceVariations[0];
  const minPrice = Math.floor(basePrice * variation.min);
  const maxPrice = Math.ceil(basePrice * variation.max);

  // Build Booking.com search URL with parameters
  const params = new URLSearchParams({
    ss: city,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: "2",
    group_children: "0",
    no_rooms: "1",
    nflt: `price=USD-${minPrice}-${maxPrice}-1`,
  });

  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

function getUnsplashImage(index: number): string {
  // Use real, high-quality Unsplash photo IDs for hotel images
  const photoIds = [
    "1566073771259-6a8506099945", // Luxury hotel lobby
    "1542314831-068cd1dbfeeb",   // Modern hotel room
    "1551882547-ff40c63fe5fa",   // Hotel exterior
  ];

  const photoId = photoIds[index % photoIds.length];
  return `https://images.unsplash.com/photo-${photoId}?w=400&h=300&fit=crop&q=80`;
}

function generateRealisticHotelName(
  city: string,
  area: string,
  budget: "low" | "medium" | "high",
  index: number
): string {
  // Budget hotel chains and patterns
  const budgetChains = [
    `${city} Express Hotel`,
    `Budget Inn ${area}`,
    `${city} Hostel ${area}`,
  ];

  // Medium hotel chains (realistic brands)
  const mediumChains = [
    `Novotel ${city} ${area}`,
    `${city} Grand Hotel`,
    `Mercure ${area}`,
  ];

  // Luxury hotel patterns
  const luxuryChains = [
    `The ${area} Palace`,
    `${city} Luxury Suites`,
    `Grand Hotel ${city}`,
  ];

  if (budget === "low") {
    return budgetChains[index % budgetChains.length];
  } else if (budget === "medium") {
    return mediumChains[index % mediumChains.length];
  } else {
    return luxuryChains[index % luxuryChains.length];
  }
}

function generateAmenities(budget: "low" | "medium" | "high"): string[] {
  const baseAmenities = ["Free WiFi"];

  if (budget === "low") {
    return [...baseAmenities, "24-Hour Reception", "Luggage Storage"];
  } else if (budget === "medium") {
    return [...baseAmenities, "Breakfast Included", "Gym", "Airport Shuttle"];
  } else {
    return [...baseAmenities, "Spa & Wellness", "Pool", "Fine Dining", "Concierge"];
  }
}

function getRating(budget: "low" | "medium" | "high"): number {
  if (budget === "low") return 3;
  if (budget === "medium") return 4;
  return 5;
}

function generateSmartHotels(
  city: string,
  budget: "low" | "medium" | "high",
  checkInDate?: string,
  checkOutDate?: string
): Hotel[] {
  console.log("[Hotels API] Generating smart recommendations for:", city, budget, { checkInDate, checkOutDate });

  const pricing = getCityPricing(city);
  const basePrice = pricing[budget];
  const rating = getRating(budget);
  const amenities = generateAmenities(budget);

  // Generate 3 unique hotels with varied pricing
  const hotels: Hotel[] = [];
  const priceVariations = [0.9, 1.0, 1.15]; // Price variation for each hotel

  for (let i = 0; i < 3; i++) {
    const area = pricing.areas[i % pricing.areas.length];
    const price = Math.round(basePrice * priceVariations[i]);

    hotels.push({
      id: `${city}-${budget}-${i}`,
      name: generateRealisticHotelName(city, area, budget, i),
      price,
      currency: pricing.currency,
      rating,
      image: getUnsplashImage(i),
      amenities: amenities.slice(0, 3),
      location: `${area}, ${city}`,
      bookingUrl: generateBookingUrl(city, budget, pricing, checkInDate, checkOutDate, i),
    });
  }

  console.log("[Hotels API] Generated", hotels.length, "smart recommendations");
  return hotels;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const destination = searchParams.get("destination");
    const budget = searchParams.get("budget") as "low" | "medium" | "high";
    const datesParam = searchParams.get("dates");
    const currencyParam = searchParams.get("currency");

    // Parse dates if provided (format: YYYY-MM-DD,YYYY-MM-DD)
    let checkInDate: string | undefined;
    let checkOutDate: string | undefined;

    if (datesParam) {
      const dates = datesParam.split(",");
      checkInDate = dates[0]?.trim();
      checkOutDate = dates[1]?.trim();
    }

    // Auto-detect currency from destination or use provided currency
    const detectedCurrency = currencyParam || detectCurrencyFromDestination(destination || "");
    const autoDetected = !currencyParam;

    console.log("[Hotels API] Request for:", { destination, budget, checkInDate, checkOutDate, currency: detectedCurrency, autoDetected });

    if (!destination) {
      return NextResponse.json(
        { error: "Destination parameter is required" },
        { status: 400 }
      );
    }

    if (!budget || !["low", "medium", "high"].includes(budget)) {
      return NextResponse.json(
        { error: "Valid budget parameter (low/medium/high) is required" },
        { status: 400 }
      );
    }

    const city = extractCityName(destination);

    // Check hotel results cache first (30-minute TTL)
    // Include dates and currency in cache key to ensure different requests are cached separately
    const cacheKey = `${city.toLowerCase()}-${budget}-${checkInDate || "default"}-${checkOutDate || "default"}-${detectedCurrency}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("[Hotels API] ✓ Returning cached data (HIT)");
      const response: HotelsResponse = {
        hotels: cached.data.hotels,
        city: cached.data.city,
        budget: cached.data.budget,
        currency: cached.data.currency,
      };

      return NextResponse.json(response, {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=900",
          "X-Cache-Status": "HIT",
          "X-Data-Source": "SMART_RECOMMENDATIONS",
        },
      });
    }

    console.log("[Hotels API] Cache miss, generating smart recommendations");

    // Generate smart hotel recommendations with dates (in USD)
    const hotelsUSD = generateSmartHotels(city, budget, checkInDate, checkOutDate);

    // Convert prices to target currency
    const hotels = hotelsUSD.map((hotel) => ({
      ...hotel,
      priceUSD: hotel.price, // Keep original USD price
      price: convertPrice(hotel.price, detectedCurrency),
      currency: detectedCurrency,
    }));

    const currencyInfo = {
      code: detectedCurrency,
      symbol: CURRENCIES[detectedCurrency as keyof typeof CURRENCIES]?.symbol || "$",
      autoDetected,
    };

    const responseData = {
      hotels,
      city,
      budget,
      currency: currencyInfo,
      source: "SMART_RECOMMENDATIONS",
    };

    // Cache the result for 30 minutes
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });
    console.log("[Hotels API] Cached result for:", cacheKey);

    const response: HotelsResponse = {
      hotels,
      city,
      budget,
      currency: currencyInfo,
    };

    console.log(
      "[Hotels API] Returning",
      hotels.length,
      "smart recommendations for",
      city,
      `(${budget}, ${detectedCurrency})`
    );

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=900",
        "X-Cache-Status": "MISS",
        "X-Data-Source": "SMART_RECOMMENDATIONS",
      },
    });
  } catch (error) {
    console.error("[Hotels API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: `Hotels service error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
