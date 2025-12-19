export const prayerNames = {
  fajr: "Subuh",
  sunrise: "Terbit",
  dhuhr: "Zuhur",
  asr: "Asar",
  maghrib: "Maghrib",
  isha: "Isya",
};

const orderWithSunrise = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
const prayerOrder = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

/** Convert "HH:mm" → Date */
function toDate(today, hm) {
  const [h, m] = hm.split(":");
  return new Date(`${today}T${h}:${m}:00`);
}

/** Preprocess times once only */
function buildTimes(t, includeSunrise = false, date = new Date()) {
  const today = date.toISOString().split("T")[0];
  const list = includeSunrise ? orderWithSunrise : prayerOrder;

  return list
    .map((name) => {
      if (!t[name]) return null;
      return {
        name,
        time: toDate(today, t[name]),
      };
    })
    .filter(Boolean);
}

function safeToDate(baseDate, hm) {
  if (!hm) return null;

  const [h, m] = hm.split(":").map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
}

export function getCurrentPrayer(t, now = new Date()) {
  const fajr = safeToDate(now, t.fajr);
  const sunrise = safeToDate(now, t.sunrise);
  const dhuhr = safeToDate(now, t.dhuhr);
  const asr = safeToDate(now, t.asr);
  const maghrib = safeToDate(now, t.maghrib);
  const isha = safeToDate(now, t.isha);

  if (fajr && sunrise && now >= fajr && now < sunrise) return "fajr";
  if (dhuhr && asr && now >= dhuhr && now < asr) return "dhuhr";
  if (asr && maghrib && now >= asr && now < maghrib) return "asr";
  if (maghrib && isha && now >= maghrib && now < isha) return "maghrib";

  // ✅ FIX: Isya berlaku sampai Subuh besok
  if (isha && now >= isha) {
    const tomorrowFajr = getTomorrowFajr(t, now);
    if (now < tomorrowFajr) return "isha";
  }

  return null;
}

export function getNextPrayer(t, now = new Date()) {
  const fajr = safeToDate(now, t.fajr);
  const sunrise = safeToDate(now, t.sunrise);
  const dhuhr = safeToDate(now, t.dhuhr);
  const asr = safeToDate(now, t.asr);
  const maghrib = safeToDate(now, t.maghrib);
  const isha = safeToDate(now, t.isha);

  // ⏰ sebelum subuh
  if (fajr && now < fajr) {
    return { name: "fajr", time: fajr };
  }

  // 🌅 setelah subuh & sebelum terbit → terbit
  if (sunrise && now >= fajr && now < sunrise) {
    return { name: "sunrise", time: sunrise };
  }

  // 🌞 SETELAH TERBIT → LANGSUNG ZUHUR (INI YANG HILANG)
  if (dhuhr && sunrise && now >= sunrise && now < dhuhr) {
    return { name: "dhuhr", time: dhuhr };
  }

  if (asr && now < asr) return { name: "asr", time: asr };
  if (maghrib && now < maghrib) return { name: "maghrib", time: maghrib };
  if (isha && now < isha) return { name: "isha", time: isha };

  // 🌙 lewat isya → subuh besok
  return { name: "fajr", time: getTomorrowFajr(t, now) };
}

export function getTomorrowFajr(t, now = new Date()) {
  const [h, m] = t.fajr.split(":");
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  const nextDate = d.toISOString().split("T")[0];
  return new Date(`${nextDate}T${h}:${m}:00`);
}
