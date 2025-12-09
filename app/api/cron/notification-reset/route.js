import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import PrayerTimes from "@/models/PrayerTimes";

const SECRET = process.env.PUSH_SERVER_SECRET;

export async function POST(req) {
  try {
    // Security check
    const body = await req.json().catch(() => ({}));
    const provided = body?.secret || req.headers.get("x-cron-secret");

    if (!SECRET || provided !== SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    // Hari ini (local)
    const today = new Date().toLocaleDateString("en-CA");

    // Reset semua flag untuk tanggal hari ini
    const result = await PrayerTimes.updateMany(
      { date: today },
      {
        $set: {
          "notificationsSent.fajr": false,
          "notificationsSent.dhuhr": false,
          "notificationsSent.asr": false,
          "notificationsSent.maghrib": false,
          "notificationsSent.isha": false,
        },
      }
    );

    return NextResponse.json({
      ok: true,
      resetCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("cron-reset error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
