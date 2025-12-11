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
import PrayerCards from "./Components/PrayerCards";
import UpdateLocationButton from "./Components/UpdateLocationButton";

export default function Home() {
  // PUSH NOTIFICATION HOOK
  const {
    permission,
    subscribeToPush,
    isSubscribed,
    loading: pushLoading,
  } = usePushNotification();

  const userId = getOrCreateUserId();

  // LOCATION HOOK
  const {
    coords,
    modalOpen,
    loading: locLoading,
    requestLocation,
    ignoreLocation,
  } = useUserLocation();

  // LOCATION CONTEXT
  const {
    coords: ctxCoords,
    setCoords,
    getLocationName,
  } = useLocationContext();

  const [prayers, setPrayers] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);

  /**
   * 🔥 FIXED:
   * Hanya 1 effect yang men-set context dari coords hook.
   * Tidak ada duplikasi lagi.
   * Dependency hanya coords agar tidak loop.
   */
  useEffect(() => {
    if (!coords) return;

    // hanya update context jika beda
    if (
      !ctxCoords ||
      ctxCoords.lat !== coords.lat ||
      ctxCoords.lon !== coords.lon
    ) {
      setCoords(coords);
      setLocationName(getLocationName(coords.lat, coords.lon));
    }
  }, [coords]); // <— intentionally ONLY coords

  /**
   * 🔥 Ambil jadwal sholat ketika coords sudah masuk context.
   * Ini memastikan fetch hanya jalan sekali per perubahan lokasi.
   */
  useEffect(() => {
    if (!ctxCoords || !userId) return;

    (async () => {
      try {
        const res = await fetch("/api/prayer-times", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: ctxCoords.lat,
            lon: ctxCoords.lon,
            userId,
          }),
        });

        const json = await res.json();

        if (json?.data?.timings) {
          setPrayers(json.data.timings);
        }
      } catch (err) {
        console.error("Failed fetching prayer times", err);
      }
    })();
  }, [ctxCoords, userId]);

  const handleUpdateLocation = async () => {
    setBtnLoading(true);
    // ambil GPS terbaru
    await requestLocation();
    if (!coords) return;

    // ambil coords dari DB untuk user ini
    const res = await fetch(`/api/prayer-times?userId=${userId}`);
    const json = await res.json();
    const dbCoords = json?.data?.location;

    // jika DB tidak punya data → pasti insert
    const isDifferent =
      !dbCoords || dbCoords.lat !== coords.lat || dbCoords.lon !== coords.lon;

    if (isDifferent) {
      await fetch("/api/prayer-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: coords.lat,
          lon: coords.lon,
          userId,
        }),
      });
      setBtnLoading(false);
      setLocationStatus("different");
    } else {
      setBtnLoading(false);
      setLocationStatus("same");
    }
  };

  // auto reset location status
  useEffect(() => {
    if (!locationStatus) return;

    const timeout = setTimeout(() => {
      setLocationStatus(null);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [locationStatus]);

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
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-4 bg-white dark:bg-black sm:items-start">
          <h1 className="text-2xl font-bold">Jadwal Sholat</h1>
          {/* {(locLoading || pushLoading) && <p>Loading...</p>} */}
          {prayers && (
            <PrayerCards prayers={prayers} locationName={locationName} />
          )}

          {/* 🔔 Toggle hanya untuk UI setelah user memberi izin */}
          <NotificationToggle isSubscribed={isSubscribed} />
          <UpdateLocationButton
            onUpdate={handleUpdateLocation}
            loading={btnLoading}
            locationStatus={locationStatus}
          />
          <Link href={"/compass"}>Klik</Link>
        </main>
      </div>
    </>
  );
}
