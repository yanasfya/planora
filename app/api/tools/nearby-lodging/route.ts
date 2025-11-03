import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { destination } = await request.json();
  return NextResponse.json({
    destination,
    hotels: [
      {
        id: "hotel-1",
        name: `${destination} Boutique Hotel`,
        pricePerNight: 280,
        rating: 4.6
      }
    ]
  });
}
