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

export function getCurrentPrayer(t, now = new Date()) {
  const times = buildTimes(t, true, now);

  for (let i = 0; i < times.length; i++) {
    const current = times[i];
    const next = times[i + 1]
      ? times[i + 1]
      : { time: getTomorrowFajr(t, now) };

    if (now >= current.time && now < next.time) {
      return current.name === "sunrise" ? "" : current.name;
    }
  }

  return null;
}

export function getNextPrayer(t, now = new Date()) {
  const times = buildTimes(t, false, now);

  for (const item of times) {
    if (item.time > now) return item;
  }

  // After Isha → next prayer = tomorrow Fajr
  return { name: "fajr", time: getTomorrowFajr(t, now) };
}

export function getTomorrowFajr(t, now = new Date()) {
  const [h, m] = t.fajr.split(":");
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  const nextDate = d.toISOString().split("T")[0];
  return new Date(`${nextDate}T${h}:${m}:00`);
}
