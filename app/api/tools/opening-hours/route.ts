import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { placeId } = await request.json();
  return NextResponse.json({
    placeId,
    hours: {
      monday: "09:00-17:00",
      tuesday: "09:00-17:00",
      wednesday: "09:00-17:00",
      thursday: "09:00-20:00",
      friday: "09:00-20:00",
      saturday: "10:00-22:00",
      sunday: "10:00-16:00"
    }
  });
}
