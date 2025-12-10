export const prayerNames = {
  fajr: "Subuh",
  sunrise: "Terbit",
  dhuhr: "Zuhur",
  asr: "Asar",
  maghrib: "Maghrib",
  isha: "Isya",
};

export async function getLocationName(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
  );
  if (!res.ok) throw new Error("Gagal mendapatkan nama lokasi");
  const data = await res.json();
  console.log(data);
  const city =
    data.address.suburb ||
    data.address.town ||
    data.address.village ||
    data.address.county;
  return city;
}

export function getCurrentPrayer(t) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const order = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  const times = order
    .map((name) => {
      if (!t[name]) return null;
      const [h, m] = t[name].split(":");
      return {
        name,
        time: new Date(`${today}T${h}:${m}:00`),
      };
    })
    .filter(Boolean);

  for (let i = 0; i < times.length; i++) {
    const current = times[i].time;
    const next = times[i + 1] ? times[i + 1].time : getTomorrowFajr(t);

    if (now >= current && now < next) return times[i].name;
  }

  return null;
}

export function getNextPrayer(t) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const order = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  for (const name of order) {
    if (!t[name]) continue;
    const [h, m] = t[name].split(":");
    const time = new Date(`${today}T${h}:${m}:00`);
    if (time > now) return { name, time };
  }

  return { name: "fajr", time: getTomorrowFajr(t) };
}

export function getTomorrowFajr(t) {
  const [h, m] = t["fajr"].split(":");
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const nextDate = d.toISOString().split("T")[0];
  return new Date(`${nextDate}T${h}:${m}:00`);
}
