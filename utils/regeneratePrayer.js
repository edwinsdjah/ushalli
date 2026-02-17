import PrayerTimes from '@/models/PrayerTimes';
import { DateTime } from 'luxon';

export async function regeneratePrayerTimesForUser(user) {
  const { location, userId } = user;
  const lat = location.lat;
  const lon = location.lon;

  const api = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=20&tune=0,1,0,2,3,2,0,2,0`;
  const response = await fetch(api);
  const json = await response.json();
  if (!json?.data?.timings) return null;

  const t = json.data.timings;
  const clean = str => str?.match(/\d{1,2}:\d{1,2}/)?.[0] || null;

  // Simpan semua, termasuk sunrise
  const cleanTimings = {
    fajr: clean(t.Fajr),
    sunrise: clean(t.Sunrise),
    dhuhr: clean(t.Dhuhr),
    asr: clean(t.Asr),
    maghrib: clean(t.Maghrib),
    isha: clean(t.Isha),
  };

  const [day, month, year] = json.data.date.gregorian.date.split('-');
  const tz = json.data.meta.timezone;

  const convertToEpoch = hhmm =>
    hhmm
      ? DateTime.fromObject(
          {
            year: Number(year),
            month: Number(month),
            day: Number(day),
            hour: Number(hhmm.split(':')[0]),
            minute: Number(hhmm.split(':')[1]),
          },
          { zone: tz }
        ).toMillis()
      : null;

  // Calculate Imsak (10 mins before Fajr)
  const fajrTime = DateTime.fromObject(
    {
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: Number(cleanTimings.fajr.split(':')[0]),
      minute: Number(cleanTimings.fajr.split(':')[1]),
    },
    { zone: tz }
  );
  const imsakTime = fajrTime.minus({ minutes: 10 });
  const imsakString = imsakTime.toFormat('HH:mm');

  cleanTimings.imsak = imsakString;

  // Hanya buat epoch untuk yang perlu push notif, tidak termasuk sunrise
  const timingsEpoch = Object.fromEntries(
    Object.entries(cleanTimings)
      .filter(([key]) => key !== 'sunrise')
      .map(([key, val]) => [key, convertToEpoch(val)])
  );

  await PrayerTimes.updateOne(
    { userId }, // <── hanya cari berdasarkan userId
    {
      $set: {
        userId,
        timezone: tz,
        location: { lat, lon },
        date: `${year}-${month}-${day}`, // <── date selalu di-update
        timings: cleanTimings,
        timingsEpoch,
        updatedAt: new Date(),
        source: 'aladhan',
        notificationsSent: {
          imsak: false,
          fajr: false,
          dhuhr: false,
          asr: false,
          maghrib: false,
          isha: false,
        },
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  return { cleanTimings, timingsEpoch, timezone: tz };
}
