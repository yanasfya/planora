import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { origin, destination } = await request.json();
  return NextResponse.json({
    durationMinutes: 18,
    origin,
    destination,
    mode: "transit"
  });
}
