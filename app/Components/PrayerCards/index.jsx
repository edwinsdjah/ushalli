"use client";

import usePrayerCountdown from "./usePrayerCountdown";
import { prayerNames } from "./helpers";

export default function PrayerCards({ prayers, locationName }) {
  const { countdown, nextPrayer, currentPrayer } = usePrayerCountdown(prayers);
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

      <div className="flex gap-4 md:justify-center sm:justify-start overflow-x-auto py-4">
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
              <div className="font-semibold text-sm">{prayerNames[key]}</div>
              <div className="text-lg">{time}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
