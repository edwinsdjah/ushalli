import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Subscription from "@/models/Subscription";
import PrayerTimes from "@/models/PrayerTimes";
import { sendPush } from "@/lib/push";

const SECRET = process.env.PUSH_SERVER_SECRET;
const WINDOW_SECONDS = parseInt(process.env.CRON_WINDOW_SECONDS || "300", 10);

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const provided = body?.secret || req.headers.get("x-cron-secret");

    if (!SECRET || provided !== SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    // 1️⃣ Reset notificationsSent hari ini
    const today = new Date().toLocaleDateString("en-CA");
    await PrayerTimes.updateMany(
      { date: today },
      {
        $set: {
          "notificationsSent.fajr": false,
          "notificationsSent.dhuhr": false,
          "notificationsSent.ashar": false,
          "notificationsSent.maghrib": false,
          "notificationsSent.isya": false,
        },
      }
    );

    const now = Date.now();
    const windowStart = now;
    const windowEnd = now + WINDOW_SECONDS * 1000;

    // 2️⃣ Ambil jadwal hari ini
    const todays = await PrayerTimes.find({ date: today }).lean();
    const sendResults = [];

    for (const pt of todays) {
      const timingsEpoch = pt.timingsEpoch || {};
      const sentFlags = pt.notificationsSent || {};

      for (const [prayerName, epoch] of Object.entries(timingsEpoch)) {
        if (!epoch) continue;
        if (sentFlags[prayerName]) continue;

        if (epoch >= windowStart && epoch <= windowEnd) {
          const payloadObj = {
            title: `Waktu Sholat ${capitalize(prayerName)}`,
            body: `Sudah masuk waktu ${capitalize(prayerName)}.`,
            url: "/",
            tag: `prayer-${prayerName}-${pt.date}`,
            prayer: prayerName,
            date: pt.date,
          };

          let subs = [];
          if (pt.userId) {
            subs = await Subscription.find({ userId: pt.userId }).lean();
          } else {
            subs = await Subscription.find({}).lean();
          }

          const pushResults = await Promise.all(
            subs.map(async (s) => {
              try {
                const r = await sendPush(
                  { endpoint: s.endpoint, keys: s.keys || {} },
                  JSON.stringify(payloadObj)
                );

                if (
                  !r.ok &&
                  (r.error?.statusCode === 410 || r.error?.statusCode === 404)
                ) {
                  await Subscription.deleteOne({ endpoint: s.endpoint });
                }

                if (!r.ok) console.error("Push error:", r.error);

                return {
                  endpoint: s.endpoint,
                  ok: r.ok,
                  error: r.ok ? null : String(r.error),
                };
              } catch (err) {
                console.error("Push exception:", err);
                return { endpoint: s.endpoint, ok: false, error: String(err) };
              }
            })
          );

          sendResults.push(...pushResults);

          // Update flag sudah dikirim
          await PrayerTimes.updateOne(
            { _id: pt._id },
            { $set: { [`notificationsSent.${prayerName}`]: true } }
          );
        }
      }
    }

    return NextResponse.json({ ok: true, results: sendResults });
  } catch (err) {
    console.error("cron send error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function capitalize(s = "") {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
