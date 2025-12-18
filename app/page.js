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
import HomeBanner from "./Components/HomeBanner";
import RandomVideoSlider from "./Components/Videos/RandomVideoSlider";
import VideoCard from "./Components/Videos/VideoCard";

export default function Home() {
  // PUSH NOTIFICATION
  const { isSubscribed } = usePushNotification();
  const [randomVideos, setRandomVideos] = useState([]);

  // LOCATION + PRAYER CONTEXT
  const {
    coords: ctxCoords,
    updateCoords,
    getLocationName,
    locationName,
    prayers,
    lastPrayerCoords,
    setPrayerData,
  } = useLocationContext();

  // USER LOCATION (browser) → AUTO UPDATE CONTEXT
  const { modalOpen, requestLocation, ignoreLocation } =
    useUserLocation(updateCoords);

  const userId = getOrCreateUserId();

  const [btnLoading, setBtnLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);

  /* =========================
     FETCH PRAYER TIMES (CACHED)
  ========================== */
  useEffect(() => {
    if (!ctxCoords || !userId) return;

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
          getLocationName(ctxCoords.lat, ctxCoords.lon);
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
    setLocationStatus("updating");

    try {
      await requestLocation(); // ✅ tunggu selesai
      setLocationStatus("updated");
    } catch (err) {
      setLocationStatus("failed");
    } finally {
      setBtnLoading(false); // ✅ INI YANG HILANG SEBELUMNYA
    }
  };

  /* =========================
     AUTO CLEAR STATUS
  ========================== */
  useEffect(() => {
    if (!locationStatus) return;
    const t = setTimeout(() => setLocationStatus(null), 3000);
    return () => clearTimeout(t);
  }, [locationStatus]);

  useEffect(() => {
    fetch("/api/ustadz/random-videos")
      .then((res) => res.json())
      .then((data) => setRandomVideos(data.videos || []));
  }, []);

  return (
    <>
      <LocationModal
        open={modalOpen}
        onAllow={requestLocation}
        onIgnore={ignoreLocation}
      />

      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
        <main className="flex flex-col w-full max-w-3xl mx-auto px-4 pt-16 pb-32 gap-4">
          <PrayerCards prayers={prayers} locationName={locationName} />
          <div className="flex flex-row items-center gap-3 mt-4">
            <UpdateLocationButton
              onUpdate={handleUpdateLocation}
              loading={btnLoading}
              locationStatus={locationStatus}
            />
            <NotificationToggle isSubscribed={isSubscribed} />
          </div>
          <HomeBanner />
          {randomVideos.length > 0 && (
            <>
              <h2 className="text-base font-semibold mt-6">
                Kajian Islami Pilihan Hari Ini
              </h2>

              <RandomVideoSlider videos={randomVideos} />
            </>
          )}
        </main>
        <MainNavigation />
      </div>
    </>
  );
}
