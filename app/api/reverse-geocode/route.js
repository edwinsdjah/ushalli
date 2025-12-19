import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat & lon required" }, { status: 400 });
  }

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    {
      headers: {
        // ⚠️ WAJIB
        "User-Agent": "UshalliApp/1.0 (contact@ushalli.app)",
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Reverse geocode failed" },
      { status: 502 }
    );
  }

  const data = await res.json();
  return NextResponse.json({ ok: true, data });
}
