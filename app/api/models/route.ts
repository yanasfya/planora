import { NextResponse } from "next/server";

async function list(endpoint: "v1" | "v1beta", key: string) {
  const url = `https://generativelanguage.googleapis.com/${endpoint}/models?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { endpoint, status: res.status, ok: res.ok, body: json };
}

export async function GET() {
  try {
    const key = process.env.GOOGLE_API_KEY!;
    if (!key) return NextResponse.json({ error: "Missing GOOGLE_API_KEY" }, { status: 500 });

    const [beta, v1] = await Promise.allSettled([
      list("v1beta", key),
      list("v1", key),
    ]);

    return NextResponse.json({
      v1beta: beta.status === "fulfilled" ? beta.value : { error: String(beta.reason) },
      v1:     v1.status   === "fulfilled" ? v1.value   : { error: String(v1.reason) },
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
