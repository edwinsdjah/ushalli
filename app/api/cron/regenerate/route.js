// app/api/cron/route.js
import { NextResponse } from "next/server";
import PrayerTimes from "@/models/PrayerTimes";
import { regeneratePrayerTimesForUser } from "@/utils/regeneratePrayer";
import { DateTime } from "luxon";
import connect from "@/lib/mongoose";

export async function GET(req) {
  await connect();

  const users = await PrayerTimes.find({});

  for (const user of users) {
    const userNow = DateTime.now().setZone(user.timezone);
    // Hanya regenerate pada jam 00:00 timezone masing-masing
    if (userNow.hour === 0) {
      await regeneratePrayerTimesForUser(user);
    }
  }

  return NextResponse.json({ ok: true });
}
