import { NextResponse } from "next/server";
import { sampleTrips } from "@/lib/sample-data";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ id: params.id, status: "completed", result: sampleTrips[0] });
}
