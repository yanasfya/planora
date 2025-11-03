import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/db/mongoose";

export async function GET() {
  try {
    const db = await connectMongo();
    const state = db.connection.readyState; // 1 = connected
    return NextResponse.json({ ok: true, mongo: state });
  } catch (err) {
    console.error("Health error:", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
