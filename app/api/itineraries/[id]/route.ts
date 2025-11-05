import { NextResponse } from "next/server";
import { dbConnect } from "@lib/db";
import ItineraryModel from "@lib/itineraryModel";
type Params = { params: { id: string } };
export async function GET(_req: Request, { params }: Params){
  await dbConnect();
  const doc = await ItineraryModel.findById(params.id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}
