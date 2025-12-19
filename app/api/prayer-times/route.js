import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import PrayerTimes from "@/models/PrayerTimes";
import { DateTime } from "luxon";
import { fetchWithRetry } from "../../../lib/fetchWithRetry";

export async function POST(req) {
  try {
    await connect();

    const { lat, lon, userId, persist = false } = await req.json();

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "lat and lon required" },
        { status: 400 }
      );
    }

    // userId hanya WAJIB kalau persist
    if (persist && !userId) {
      return NextResponse.json(
        { error: "userId required when persist = true" },
        { status: 400 }
      );
    }

    // Fetch dari Aladhan
    const api = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`;
    const response = await fetchWithRetry(api);
    if (!response.ok) {
      console.error("Aladhan error:", response.status);
      return NextResponse.json(
        { error: "Aladhan API failed" },
        { status: 502 }
      );
    }

    const json = await response.json();
    if (!json?.data || !json.data.timings) {
      console.error("Aladhan returned empty timings:", json);
      return NextResponse.json(
        { error: "Aladhan empty data" },
        { status: 502 }
      );
    }

    const data = json.data;
    const t = data.timings;

    // Bersihkan "05:01 (WIB)" -> "05:01"
    const clean = (str) => (str?.match(/\d{1,2}:\d{1,2}/)?.[0] || "").trim();

    const cleanTimings = {
      fajr: clean(t.Fajr),
      dhuhr: clean(t.Dhuhr),
      asr: clean(t.Asr),
      maghrib: clean(t.Maghrib),
      isha: clean(t.Isha),
      sunrise: clean(t.Sunrise),
    };

    // Aladhan date = "07-12-2025"
    const [day, month, year] = data.date.gregorian.date.split("-");
    const today = `${year}-${month}-${day}`;

    const tz = data.meta.timezone; // e.g. "Asia/Jakarta"

    // Luxon converter
    const convertToEpoch = (timeString) => {
      if (!timeString) return null;

      const [hour, minute] = timeString.split(":").map(Number);

      const dt = DateTime.fromObject(
        {
          year: Number(year),
          month: Number(month),
          day: Number(day),
          hour,
          minute,
        },
        { zone: tz }
      );

      return dt.isValid ? dt.toMillis() : null;
    };

    const timingsEpoch = {
      fajr: convertToEpoch(cleanTimings.fajr),
      dhuhr: convertToEpoch(cleanTimings.dhuhr),
      asr: convertToEpoch(cleanTimings.asr),
      maghrib: convertToEpoch(cleanTimings.maghrib),
      isha: convertToEpoch(cleanTimings.isha),
      sunrise: convertToEpoch(cleanTimings.sunrise),
    };

    // Upsert DB
    let doc = null;

    if (persist) {
      await PrayerTimes.updateOne(
        { date: today, userId },
        {
          $set: {
            userId,
            date: today,
            timezone: tz,
            timings: cleanTimings,
            timingsEpoch,
            location: { lat, lon },
            source: "aladhan",
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );

      doc = await PrayerTimes.findOne({ date: today, userId }).lean();
    }

    return NextResponse.json({
      ok: true,
      data: persist
        ? doc
        : {
            date: today,
            timezone: tz,
            timings: cleanTimings,
            timingsEpoch,
            location: { lat, lon },
            source: "aladhan",
          },
    });
  } catch (err) {
    console.error("prayer API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connect();

    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const today = DateTime.local().toFormat("yyyy-MM-dd");

    const doc = await PrayerTimes.findOne({ date: today, userId }).lean();

    return NextResponse.json({ ok: true, data: doc || null });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
