import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { query } = await request.json();
  return NextResponse.json({
    results: [
      {
        id: "poi-1",
        name: `Highlight near ${query}`,
        rating: 4.7,
        address: "123 Market Street",
        category: "experience"
      }
    ]
  });
}
