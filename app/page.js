"use client";

import { useEffect, useState } from "react";
import NotificationToggle from "@/app/Components/NotificationToggle";
import NotificationModal from "./Components/NotificationModal";
import LocationModal from "./Components/LocationModal";
import usePushNotification from "./hooks/usePushNotification";
import useUserLocation from "./hooks/useUserLocation";
import { getOrCreateUserId } from "@/helpers/user";
import { useLocationContext } from "@/app/context/locationContext";
import Link from "next/link";

export default function Home() {
  // PUSH NOTIFICATION HOOK
  const {
    permission,
    subscribeToPush,
    isSubscribed,
    loading: pushLoading,
  } = usePushNotification();

  const userId = getOrCreateUserId(); // <-- aman

  // LOCATION HOOK
  const {
    coords,
    modalOpen,
    loading: locLoading,
    requestLocation,
    ignoreLocation,
  } = useUserLocation();

  // LOCATION CONTEXT
  const { coords: ctxCoords, setCoords } = useLocationContext();

  const [prayers, setPrayers] = useState(null);

  // ⬅️ DEBUG: apakah context berubah?
  useEffect(() => {
    console.log("Context coords →", ctxCoords);
  }, [ctxCoords]);

  // 🔥 UPDATE CONTEXT SAAT HOOK MENGHASILKAN KOORDINAT
  useEffect(() => {
    if (!coords) {
      console.log("Home → coords dari hook masih null");
      return;
    }

    // Cegah setCoords berulang jika datanya sama
    if (
      !ctxCoords ||
      ctxCoords.lat !== coords.lat ||
      ctxCoords.lon !== coords.lon
    ) {
      console.log("Home → MENYIMPAN KE CONTEXT:", coords);
      setCoords(coords);
    }
  }, [coords, ctxCoords, setCoords]);

  // FETCH JADWAL SHOLAT
  useEffect(() => {
    if (!coords || !userId) return;

    (async () => {
      try {
        const res = await fetch("/api/prayer-times", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: coords.lat,
            lon: coords.lon,
            userId,
          }),
        });

        const json = await res.json();
        console.log("API PRAYERS:", json.data);

        if (json?.data?.timings) {
          setPrayers(json.data.timings);
        }
      } catch (err) {
        console.error("Failed fetching prayer times", err);
      }
    })();
  }, [coords]);

  useEffect(() => {
    console.log("HOOK coords:", coords);
    console.log("CONTEXT BEFORE:", ctxCoords);

    if (coords) {
      console.log("SETTING CTX:", coords);
      setCoords(coords);
    }
  }, [coords]);

  return (
    <>
      {/* 🔔 Modal pertama kali untuk push notification */}
      <NotificationModal
        open={permission === "default"}
        onAllow={subscribeToPush}
        onIgnore={() => Notification.requestPermission()}
        loading={pushLoading}
      />

      {/* 📍 Modal izin lokasi pertama kali */}
      <LocationModal
        open={modalOpen}
        onAllow={requestLocation}
        onIgnore={ignoreLocation}
      />

      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
          <h1 className="text-2xl font-bold">Jadwal Sholat</h1>

          {(locLoading || pushLoading) && <p>Loading...</p>}

          {prayers && (
            <div className="mt-4 space-y-1">
              {Object.entries(prayers).map(([key, value]) => {
                const prayerNames = {
                  fajr: "Subuh",
                  sunrise: "Terbit",
                  dhuhr: "Zuhur",
                  asr: "Asar",
                  maghrib: "Maghrib",
                  isha: "Isya",
                };

                const label = prayerNames[key] || key;

                return (
                  <p key={key}>
                    <strong>{label}:</strong> {value}
                  </p>
                );
              })}
            </div>
          )}

          {/* 🔔 Toggle hanya untuk UI setelah user memberi izin */}
          <NotificationToggle isSubscribed={isSubscribed} />
          <Link href={"/compass"}>Klik</Link>
        </main>
      </div>
    </>
  );
}
