"use client";

import { useEffect, useState } from "react";
import NotificationToggle from "@/app/Components/NotificationToggle";
import LocationModal from "./Components/LocationModal";
import usePushNotification from "./hooks/usePushNotification";
import useUserLocation from "./hooks/useUserLocation";
import { getOrCreateUserId } from "@/helpers/user";
import { useLocationContext } from "@/app/context/locationContext";
import PrayerCards from "./Components/PrayerCards";
import UpdateLocationButton from "./Components/UpdateLocationButton";
import MainNavigation from "./Components/MainNavigation";

export default function Home() {
  // PUSH NOTIFICATION
  const { isSubscribed } = usePushNotification();

  // USER LOCATION (browser)
  const { coords, modalOpen, requestLocation, ignoreLocation } =
    useUserLocation();

  // LOCATION + PRAYER CONTEXT
  const {
    coords: ctxCoords,
    setCoords,
    getLocationName,
    locationName,
    prayers,
    lastPrayerCoords,
    setPrayerData,
  } = useLocationContext();

  const userId = getOrCreateUserId();

  const [btnLoading, setBtnLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);

  useEffect(() => {
    if (!coords || ctxCoords) return;

    // ⬅️ First load ONLY
    setCoords(coords);
    getLocationName(coords.lat, coords.lon);
  }, [coords, ctxCoords]);

  /* =========================
     UPDATE CONTEXT COORDS
  ========================== */
  useEffect(() => {
    if (!coords || !btnLoading) return;

    const isSame =
      ctxCoords && ctxCoords.lat === coords.lat && ctxCoords.lon === coords.lon;

    if (!isSame) {
      setCoords(coords);
      getLocationName(coords.lat, coords.lon);
      setLocationStatus("different");
    } else {
      setLocationStatus("same");
    }

    setBtnLoading(false);
  }, [coords]);

  /* =========================
     FETCH PRAYER TIMES (CACHED)
  ========================== */
  useEffect(() => {
    if (!ctxCoords || !userId) return;
    // ⛔️ Skip fetch jika masih valid
    if (
      prayers &&
      lastPrayerCoords &&
      lastPrayerCoords.lat === ctxCoords.lat &&
      lastPrayerCoords.lon === ctxCoords.lon
    ) {
      return;
    }

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
          setPrayerData(json.data.timings, ctxCoords);
        }
      } catch (err) {
        console.error("Failed fetching prayer times", err);
      }
    })();
  }, [ctxCoords, userId]);

  /* =========================
     UPDATE LOCATION BUTTON
  ========================== */
  const handleUpdateLocation = async () => {
    if (btnLoading) return;
    setBtnLoading(true);
    await requestLocation(); // biarkan effect yang mematikan loading
  };

  /* =========================
     AUTO CLEAR STATUS
  ========================== */
  useEffect(() => {
    if (!locationStatus) return;
    const t = setTimeout(() => setLocationStatus(null), 3000);
    return () => clearTimeout(t);
  }, [locationStatus]);

  return (
    <>
      {/* Location Modal */}
      <LocationModal
        open={modalOpen}
        onAllow={requestLocation}
        onIgnore={ignoreLocation}
      />

      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
        <main className="flex flex-col w-full max-w-3xl mx-auto px-4 pt-16 pb-32 gap-4">
          <PrayerCards prayers={prayers} locationName={locationName} />
          <div className="flex flex-row sm:justify-items-normal items-center gap-3 mt-4">
            <UpdateLocationButton
              onUpdate={handleUpdateLocation}
              loading={btnLoading}
              locationStatus={locationStatus}
            />
            <NotificationToggle isSubscribed={isSubscribed} />
          </div>
        </main>

        <MainNavigation />
      </div>
    </>
  );
}
