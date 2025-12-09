import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Subscription from "@/models/Subscription";
import PrayerTimes from "@/models/PrayerTimes";
import { sendPush } from "@/lib/push";

const SECRET = process.env.PUSH_SERVER_SECRET; // set di env
const WINDOW_SECONDS = parseInt(process.env.CRONT_WINDOW_SECONDS || "300", 10); // window
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    // simple secret check (can be header or body)
    const provided = body?.secret || req.headers.get("x-cron-secret");
    if (!SECRET || provided !== SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const now = Date.now();

    // mencari prayerTimes yang memiliki timingsEpoch.someTime in window [now, now + WINDOW]
    // asumsikan PrayerTimes dokumen memiliki field: date (YYYY-MM-DD), timingsEpoch: { fajr: Number, dhuhr: Number, ... }, notificationsSent: { fajr: Boolean, ... }, userId (optional)
    const windowStart = now;
    const windowEnd = now + WINDOW_SECONDS * 1000;

    // query: cari dokumen yang punya ANY timingEpoch between windowStart-windowEnd AND notificationsSent.prayerName != true
    // Mongoose can't do "any property" easily — simplest: fetch today's PrayerTimes and filter in JS
    const todayISO = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const today = new Date();
    const localDate = today.toLocaleDateString("en-CA"); // YYYY-MM-DD
    const todays = await PrayerTimes.find({ date: localDate }).lean();

    const sendResults = [];

    for (const pt of todays) {
      const timingsEpoch = pt.timingsEpoch || {};
      const sentFlags = pt.notificationsSent || {};

      for (const [prayerName, epoch] of Object.entries(timingsEpoch)) {
        if (!epoch) continue;
        if (sentFlags && sentFlags[prayerName]) continue; // already sent

        // jika epoch masuk window
        if (epoch >= windowStart && epoch <= windowEnd) {
          // build payload
          const payloadObj = {
            title: `Waktu Sholat ${capitalize(prayerName)}`,
            body: `Sudah masuk waktu ${capitalize(prayerName)}.`,
            url: "/", // you can route to prayer detail
            tag: `prayer-${prayerName}-${pt.date}`,
            prayer: prayerName,
            date: pt.date,
          };

          // find subscriptions to send:
          let subs;
          if (pt.userId) {
            subs = await Subscription.find({ userId: pt.userId }).lean();
          } else {
            // fallback: broadcast to all
            subs = await Subscription.find({}).lean();
          }

          for (const s of subs) {
            const subObj = { endpoint: s.endpoint, keys: s.keys || {} };
            const r = await sendPush(subObj, JSON.stringify(payloadObj));
            sendResults.push({
              endpoint: s.endpoint,
              ok: r.ok,
              error: r.ok ? null : String(r.error),
            });
            // if stale, clean up
            if (
              !r.ok &&
              r.error &&
              (r.error.statusCode === 410 || r.error.statusCode === 404)
            ) {
              await Subscription.deleteOne({ endpoint: s.endpoint });
            }
          }

          // mark as sent for this prayer (update doc)
          const updateQuery = { _id: pt._id };
          const updateSet = {};
          updateSet[`notificationsSent.${prayerName}`] = true;
          await PrayerTimes.updateOne(updateQuery, { $set: updateSet });
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
