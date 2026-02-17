import { NextResponse } from 'next/server';
import connect from '@/lib/mongoose';
import Subscription from '@/models/Subscription';
import PrayerTimes from '@/models/PrayerTimes';
import { sendPush } from '@/lib/push';
import { DateTime } from 'luxon';

const SECRET = process.env.PUSH_SERVER_SECRET;

const PRAYER_NAME_MAP = {
  imsak: 'Imsak',
  fajr: 'Subuh',
  dhuhr: 'Zuhur',
  asr: 'Asar',
  maghrib: 'Maghrib',
  isha: 'Isya',
  sunrise: 'Terbit Matahari',
};

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const provided = body?.secret || req.headers.get('x-cron-secret');

    if (!SECRET || provided !== SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();

    // 🔥 Ambil semua jadwal hari ini (server-day)
    // Kita akan cek lagi pakai tz user agar tidak salah hari
    const allDocs = await PrayerTimes.find({}).lean();

    const sendResults = [];

    for (const pt of allDocs) {
      const tz = pt.timezone || 'UTC';

      // 📅 Hitung tanggal lokal user
      const nowUser = DateTime.now().setZone(tz);

      const todayUser = nowUser.toFormat('yyyy-MM-dd');

      // Tidak cocok dengan tanggal sholat user → skip
      if (pt.date !== todayUser) continue;

      // 🎯 Epoch menit ini (versi user timezone)
      const currentMinuteEpoch = nowUser.startOf('minute').toMillis();

      const timingsEpoch = pt.timingsEpoch || {};
      const sentFlags = pt.notificationsSent || {};

      for (const [prayerName, epoch] of Object.entries(timingsEpoch)) {
        if (!epoch) continue;

        // ❌ Sudah dikirim → skip
        if (sentFlags[prayerName]) continue;

        // 🕒 Kirim jika masuk dalam 1 menit interval
        if (epoch >= currentMinuteEpoch && epoch < currentMinuteEpoch + 60000) {
          const localName = PRAYER_NAME_MAP[prayerName] || prayerName;

          const payloadObj = {
            title:
              localName === 'Imsak'
                ? `Pengingat Waktu Imsak`
                : `Waktu Sholat ${localName}`,
            body: `Sudah masuk waktu ${localName}.`,
            url: '/',
            tag: `prayer-${prayerName}-${pt.date}`,
            prayer: prayerName,
            date: pt.date,
          };

          // Ambil subscription sesuai user
          const subs = pt.userId
            ? await Subscription.find({ userId: pt.userId }).lean()
            : await Subscription.find({}).lean();

          // Kirim push
          const pushResults = await Promise.all(
            subs.map(async s => {
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

          // ✔ Tandai sudah dikirim
          await PrayerTimes.updateOne(
            { _id: pt._id },
            { $set: { [`notificationsSent.${prayerName}`]: true } }
          );
        }
      }
    }

    return NextResponse.json({ ok: true, results: sendResults });
  } catch (err) {
    console.error('cron send error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
