import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Subscription from "@/models/Subscription";
import PrayerTimes from "@/models/PrayerTimes";
import { sendPush } from "@/lib/push";

const SECRET = process.env.PUSH_SERVER_SECRET;

// Mapping nama sholat → Bahasa Indonesia
const PRAYER_NAME_MAP = {
  fajr: "Subuh",
  dhuhr: "Zuhur",
  asr: "Asar",
  maghrib: "Maghrib",
  isha: "Isya",
  sunrise: "Terbit Matahari",
};

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const provided = body?.secret || req.headers.get("x-cron-secret");

    if (!SECRET || provided !== SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const today = new Date().toLocaleDateString("en-CA");

    // 🎯 Epoch menit ini (dibulatkan ke menit)
    const now = Date.now();
    const currentMinuteEpoch = Math.floor(now / 60000) * 60000;

    // Ambil semua jadwal hari ini
    const todays = await PrayerTimes.find({ date: today }).lean();

    const sendResults = [];

    for (const pt of todays) {
      const timingsEpoch = pt.timingsEpoch || {};
      const sentFlags = pt.notificationsSent || {};

      for (const [prayerName, epoch] of Object.entries(timingsEpoch)) {
        if (!epoch) continue;

        // ❌ Sudah dikirim hari ini → skip
        if (sentFlags[prayerName]) continue;

        // 🕒 Kirim TEPAT pada menitnya
        if (epoch === currentMinuteEpoch) {
          const localName = PRAYER_NAME_MAP[prayerName] || prayerName;

          const payloadObj = {
            title: `Waktu Sholat ${localName}`,
            body: `Sudah masuk waktu ${localName}.`,
            url: "/",
            tag: `prayer-${prayerName}-${pt.date}`,
            prayer: prayerName,
            date: pt.date,
          };

          // Ambil subscription user
          let subs = [];
          if (pt.userId) {
            subs = await Subscription.find({ userId: pt.userId }).lean();
          } else {
            subs = await Subscription.find({}).lean();
          }

          // Kirim push ke semua device user
          const pushResults = await Promise.all(
            subs.map(async (s) => {
              try {
                const r = await sendPush(
                  { endpoint: s.endpoint, keys: s.keys || {} },
                  JSON.stringify(payloadObj)
                );

                // Hapus subscription invalid
                if (
                  !r.ok &&
                  (r.error?.statusCode === 410 || r.error?.statusCode === 404)
                ) {
                  await Subscription.deleteOne({ endpoint: s.endpoint });
                }

                return {
                  endpoint: s.endpoint,
                  ok: r.ok,
                  error: r.ok ? null : String(r.error),
                };
              } catch (err) {
                return { endpoint: s.endpoint, ok: false, error: String(err) };
              }
            })
          );

          sendResults.push(...pushResults);

          // ✔ Tandai sudah dikirim agar tidak kirim ulang
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
