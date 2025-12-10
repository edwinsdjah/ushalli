"use client";

import { useEffect, useState } from "react";

const prayerNames = {
  fajr: "Subuh",
  sunrise: "Terbit",
  dhuhr: "Zuhur",
  asr: "Asar",
  maghrib: "Maghrib",
  isha: "Isya",
};

export default function PrayerCards({ prayers, locationName }) {
  const [countdown, setCountdown] = useState("");
  const [nextPrayer, setNextPrayer] = useState("");
  const [currentPrayer, setCurrentPrayer] = useState("");

  useEffect(() => {
    if (!prayers) return;

    const update = () => {
      const { name: nextName, time: nextTime } = getNextPrayer(prayers);
      const current = getCurrentPrayer(prayers);

      const now = new Date();
      const diff = nextTime - now;

      if (diff < 1000) {
        setCurrentPrayer(current);
        setNextPrayer(nextName);
        return;
      }

      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

      setCountdown(`${h}:${m}:${s}`);
      setNextPrayer(nextName);
      setCurrentPrayer(current);
    };

    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [prayers]);

  if (!prayers) return null;

  return (
    <div className="bg-gradient-to-r from-green-200 via-emerald-100 to-teal-200 shadow-lg rounded-xl p-6 mx-auto w-full max-w-3xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 text-center md:text-left">
        <div>
          <p className="text-sm text-gray-600">
            Menuju waktu sholat{" "}
            <span className="font-semibold text-gray-800">
              {prayerNames[nextPrayer]}
            </span>
          </p>
          <div className="text-6xl font-mono font-bold text-gray-900">
            {countdown}
          </div>
        </div>

        <div className="text-right">
          <p className="text-md font-semibold text-gray-800">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="text-sm text-gray-600">Lokasi: {locationName}</p>
        </div>
      </div>

      <div className="flex gap-4 justify-center overflow-x-auto py-4">
        {Object.entries(prayers)
          .filter(([key]) =>
            ["fajr", "dhuhr", "asr", "maghrib", "isha"].includes(key)
          )
          .map(([key, time]) => (
            <div
              key={key}
              className={`bg-white shadow-md rounded-lg px-4 py-2 text-center min-w-[100px] transition 
              ${
                key === currentPrayer
                  ? "bg-yellow-200 border-2 border-yellow-500 scale-105"
                  : ""
              }`}
            >
              <div className="font-semibold text-sm">
                {prayerNames[key]}
              </div>
              <div className="text-lg">{time}</div>
            </div>
          ))}
      </div>
    </div>
  );
}

/* ------------------ LOGIC FUNCTIONS ------------------ */

function getCurrentPrayer(t) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const order = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const times = order.map((name) => {
    if (!t[name]) return null;

    const [h, m] = t[name].split(":");
    const time = new Date(`${today}T${h.padStart(2, "0")}:${m}:00`);

    return { name, time };
  }).filter(Boolean);

  for (let i = 0; i < times.length; i++) {
    const current = times[i].time;
    const next = times[i + 1]
      ? times[i + 1].time
      : getTomorrowFajr(t);

    if (now >= current && now < next) return times[i].name;
  }

  return null;
}

function getNextPrayer(t) {
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

function getTomorrowFajr(t) {
  const [h, m] = t["fajr"].split(":");

  const d = new Date();
  d.setDate(d.getDate() + 1);

  const tomorrow = d.toISOString().split("T")[0];
  return new Date(`${tomorrow}T${h}:${m}:00`);
}
