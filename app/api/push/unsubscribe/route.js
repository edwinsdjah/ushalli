import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Subscription from "@/models/Subscription";
import PrayerTimes from "@/models/PrayerTimes";

export async function POST(req) {
  try {
    await connect();
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "userId required" },
        { status: 400 }
      );
    }

    // Hapus semua subscription milik user
    const subResult = await Subscription.deleteMany({ userId });

    // Hapus semua prayer times milik user
    const prayerResult = await PrayerTimes.deleteMany({ userId });

    return NextResponse.json({
      ok: true,
      deletedSubscriptions: subResult.deletedCount,
      deletedPrayerTimes: prayerResult.deletedCount,
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
