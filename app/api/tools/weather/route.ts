import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { destination } = await request.json();
  return NextResponse.json({
    destination,
    forecast: [
      { date: "2024-05-01", high: 24, low: 16, description: "Clear" },
      { date: "2024-05-02", high: 21, low: 14, description: "Cloudy" }
    ]
  });
}
