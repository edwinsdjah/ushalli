import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import PrayerTimes from "@/models/PrayerTimes";

export async function POST(req) {
  try {
    await connect();

    const { lat, lon, userId } = await req.json();

    if (!lat || !lon || !userId) {
      return NextResponse.json(
        { error: "lat, lon, and userId required" },
        { status: 400 }
      );
    }

    // Fetch dari Aladhan
    const api = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`;
    const response = await fetch(api);

    if (!response.ok) {
      console.error("Aladhan error:", response.status);
      return NextResponse.json(
        { error: "Aladhan API failed" },
        { status: 502 }
      );
    }

    let json;
    try {
      json = await response.json();
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return NextResponse.json(
        { error: "Invalid JSON from Aladhan" },
        { status: 502 }
      );
    }

    if (!json?.data || !json.data.timings) {
      console.error("Aladhan returned empty timings:", json);
      return NextResponse.json(
        { error: "Aladhan empty data" },
        { status: 502 }
      );
    }

    const data = json.data;
    const timingsFromAladhan = data.timings;

    const cleanTimings = {
      fajr: timingsFromAladhan.Fajr?.trim() || "",
      dhuhr: timingsFromAladhan.Dhuhr?.trim() || "",
      asr: timingsFromAladhan.Asr?.trim() || "",
      maghrib: timingsFromAladhan.Maghrib?.trim() || "",
      isha: timingsFromAladhan.Isha?.trim() || "",
      sunrise: timingsFromAladhan.Sunrise?.trim() || "",
    };

    // Tanggal aladhan: "07-12-2025" → yyyy-mm-dd
    const [day, month, year] = data.date.gregorian.date.split("-");
    const today = `${year}-${month}-${day}`;

    // Convert ke epoch (pakai UTC)
    const convertToEpoch = (timeString) => {
      const [h, m] = timeString.split(":");
      return Date.UTC(year, month - 1, day, h, m);
    };

    const timingsEpoch = {
      fajr: convertToEpoch(cleanTimings.fajr),
      dhuhr: convertToEpoch(cleanTimings.dhuhr),
      asr: convertToEpoch(cleanTimings.asr),
      maghrib: convertToEpoch(cleanTimings.maghrib),
      isha: convertToEpoch(cleanTimings.isha),
      sunrise: convertToEpoch(cleanTimings.sunrise),
    };

    // Upsert ke DB
    await PrayerTimes.updateOne(
      { date: today, userId },
      {
        $set: {
          userId,
          date: today,
          timezone: data.meta.timezone,
          timings: cleanTimings,
          timingsEpoch,
          location: { lat, lon },
          source: "aladhan",
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    // Ambil kembali doc dari DB supaya pasti lengkap
    const doc = await PrayerTimes.findOne({ date: today, userId }).lean();

    return NextResponse.json({ ok: true, data: doc });
  } catch (err) {
    console.error("prayer API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
