"use client";
import { useEffect, useState } from "react";
import { getDistanceKm } from "@/utils/distance";

const THRESHOLD_KM = 50; // minimal 5 km baru refetch

export default function useGeolocationPrayer() {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState(null);

  useEffect(() => {
    async function init() {
      if (!("geolocation" in navigator)) {
        console.warn("Geolocation not supported");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          const saved = JSON.parse(localStorage.getItem("ushalli_location"));

          const now = Date.now();
          let shouldUpdate = false;

          if (!saved) {
            shouldUpdate = true;
          } else {
            const distance = getDistanceKm(
              saved.lat,
              saved.lon,
              latitude,
              longitude
            );

            const oneDay = 24 * 60 * 60 * 1000;

            if (distance >= THRESHOLD_KM) {
              shouldUpdate = true;
            } else if (now - saved.timestamp > oneDay) {
              shouldUpdate = true;
            }
          }

          if (shouldUpdate) {
            const data = await fetchPrayerTimes(latitude, longitude);

            localStorage.setItem(
              "ushalli_location",
              JSON.stringify({
                lat: latitude,
                lon: longitude,
                timestamp: now,
                prayerTimes: data,
              })
            );

            setPrayerTimes(data);
          } else {
            setPrayerTimes(saved.prayerTimes);
          }

          setCoords({ latitude, longitude });
          setLoading(false);
        },
        (err) => {
          console.error("Location error:", err);
          setLoading(false);
        }
      );
    }

    init();
  }, []);

  return { coords, prayerTimes, loading };
}

async function fetchPrayerTimes(lat, lon) {
  const res = await fetch(`/api/prayer-times?lat=${lat}&lon=${lon}`);
  return res.json();
}
