import { NextResponse } from "next/server";

export interface WeatherData {
  current: {
    temp: number;
    description: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    day: string;
    temp_min: number;
    temp_max: number;
    temp: number;
    description: string;
    icon: string;
    precipitation?: number;
  }>;
  travelTip: string;
}

const MAJOR_CITIES_COORDS: Record<string, { lat: number; lon: number }> = {
  paris: { lat: 48.8566, lon: 2.3522 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
  "new york": { lat: 40.7128, lon: -74.006 },
  barcelona: { lat: 41.3874, lon: 2.1686 },
  bali: { lat: -8.3405, lon: 115.092 },
  london: { lat: 51.5074, lon: -0.1278 },
  rome: { lat: 41.9028, lon: 12.4964 },
  dubai: { lat: 25.2048, lon: 55.2708 },
  singapore: { lat: 1.3521, lon: 103.8198 },
  sydney: { lat: -33.8688, lon: 151.2093 },
};

function generateTravelTip(forecast: WeatherData["forecast"]): string {
  const avgTemp = forecast.reduce((acc, day) => acc + day.temp, 0) / forecast.length;
  const hasRain = forecast.some((day) => day.precipitation && day.precipitation > 0.3);
  const hasCold = forecast.some((day) => day.temp < 10);
  const hasHot = forecast.some((day) => day.temp > 30);

  if (hasRain && hasCold) {
    return "Pack layers, a warm jacket, and waterproof gear. Rain and cooler temperatures expected.";
  }
  if (hasRain) {
    return "Don't forget an umbrella and a light rain jacket. Showers are in the forecast.";
  }
  if (hasCold) {
    return "Bring warm layers and a jacket. Temperatures will be on the cooler side.";
  }
  if (hasHot) {
    return "Stay hydrated and wear sunscreen. Hot weather ahead!";
  }
  if (avgTemp > 20 && avgTemp < 28) {
    return "Perfect weather for outdoor activities. Light layers recommended.";
  }
  return "Check the forecast and pack accordingly for your trip.";
}

function extractCityName(destination: string): string {
  const parts = destination.split(",");
  return parts[0].trim();
}

function getFallbackCoords(city: string): { lat: number; lon: number } | null {
  const normalized = city.toLowerCase();
  return MAJOR_CITIES_COORDS[normalized] || null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const destination = searchParams.get("destination");

    console.log("[Weather API] Request for destination:", destination);

    if (!destination) {
      return NextResponse.json(
        { error: "Destination parameter is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.error("[Weather API] OPENWEATHER_API_KEY is not set in environment");
      return NextResponse.json(
        { error: "Weather service not configured" },
        { status: 500 }
      );
    }

    const city = extractCityName(destination);
    console.log("[Weather API] Extracted city name:", city);

    let lat: number;
    let lon: number;

    const fallbackCoords = getFallbackCoords(city);
    if (fallbackCoords) {
      console.log("[Weather API] Using fallback coordinates for:", city, fallbackCoords);
      lat = fallbackCoords.lat;
      lon = fallbackCoords.lon;
    } else {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        city
      )}&limit=1&appid=${apiKey}`;
      console.log("[Weather API] Geocoding URL:", geoUrl.replace(apiKey, "API_KEY"));

      const geoResponse = await fetch(geoUrl);
      console.log("[Weather API] Geocoding response status:", geoResponse.status);

      if (!geoResponse.ok) {
        const errorText = await geoResponse.text();
        console.error("[Weather API] Geocoding failed:", errorText);
        throw new Error(`Geocoding failed with status ${geoResponse.status}`);
      }

      const geoData = await geoResponse.json();
      console.log("[Weather API] Geocoding result:", JSON.stringify(geoData));

      if (!geoData || geoData.length === 0) {
        console.error("[Weather API] No geocoding results for:", city);
        return NextResponse.json(
          { error: `Location not found: ${city}` },
          { status: 404 }
        );
      }

      lat = geoData[0].lat;
      lon = geoData[0].lon;
      console.log("[Weather API] Geocoded coordinates:", { lat, lon });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    console.log("[Weather API] Fetching weather from:", weatherUrl.replace(apiKey, "API_KEY"));

    const weatherResponse = await fetch(weatherUrl);
    console.log("[Weather API] Weather response status:", weatherResponse.status);

    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error("[Weather API] Weather fetch failed:", errorText);
      throw new Error(`Weather fetch failed with status ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    console.log("[Weather API] Weather data received, forecast items:", weatherData.list?.length);

    const current = {
      temp: Math.round(weatherData.list[0].main.temp),
      description: weatherData.list[0].weather[0].description,
      icon: weatherData.list[0].weather[0].icon,
    };

    const forecastMap = new Map<string, typeof weatherData.list[0]>();
    weatherData.list.forEach((item: typeof weatherData.list[0]) => {
      const date = item.dt_txt.split(" ")[0];
      if (!forecastMap.has(date) || item.dt_txt.includes("12:00:00")) {
        forecastMap.set(date, item);
      }
    });

    const forecast = Array.from(forecastMap.values())
      .slice(0, 5)
      .map((item) => {
        const date = new Date(item.dt * 1000);
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return {
          date: item.dt_txt.split(" ")[0],
          day: days[date.getDay()],
          temp_min: Math.round(item.main.temp_min),
          temp_max: Math.round(item.main.temp_max),
          temp: Math.round(item.main.temp),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          precipitation: item.pop,
        };
      });

    const travelTip = generateTravelTip(forecast);

    const response: WeatherData = {
      current,
      forecast,
      travelTip,
    };

    console.log("[Weather API] Successfully returning weather data");

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[Weather API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Weather service error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
