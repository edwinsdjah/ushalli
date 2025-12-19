"use client";

import { useEffect, useState } from "react";

// Components
import LocationModal from "./Components/LocationModal";
import PrayerCards from "./Components/PrayerCards";
import UpdateLocationButton from "./Components/UpdateLocationButton";
import NotificationToggle from "@/app/Components/NotificationToggle";
import MainNavigation from "./Components/MainNavigation";
import HomeBanner from "./Components/HomeBanner";
import RandomVideoSlider from "./Components/Videos/RandomVideoSlider";

// Hooks & Helpers
import usePushNotification from "./hooks/usePushNotification";
import useUserLocation from "./hooks/useUserLocation";
import { useLocationContext } from "@/app/context/locationContext";
import { getOrCreateUserId } from "@/helpers/user";

export default function Home() {
  /* =========================
      GLOBAL & CONTEXT STATE
     ========================= */
  const userId = getOrCreateUserId();
  const { isSubscribed } = usePushNotification();

  const {
    coords,
    updateCoords,
    getLocationName,
    locationName,
    prayers,
    lastPrayerCoords,
    setPrayerData,
  } = useLocationContext();

  /* =========================
      LOCAL UI STATE
     ========================= */
  const [btnLoading, setBtnLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);
  const [randomVideos, setRandomVideos] = useState([]);

  /* =========================
      USER LOCATION (BROWSER)
     ========================= */
  const { modalOpen, requestLocation, ignoreLocation } =
    useUserLocation(updateCoords);

  /* =========================
      FETCH PRAYER TIMES (CACHED)
     ========================= */
  useEffect(() => {
    if (!coords || !userId) return;

    const isSameLocation =
      lastPrayerCoords &&
      lastPrayerCoords.lat === coords.lat &&
      lastPrayerCoords.lon === coords.lon;

    if (prayers && isSameLocation) return;

    const fetchPrayerTimes = async () => {
      try {
        const res = await fetch("/api/prayer-times", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: coords.lat,
            lon: coords.lon,
            userId,
            persist: isSubscribed,
          }),
        });

        const json = await res.json();

        if (json?.data?.timings) {
          setPrayerData(json.data.timings, coords);
          getLocationName(coords.lat, coords.lon);
        }
      } catch (err) {
        console.error("Failed fetching prayer times", err);
      }
    };

    fetchPrayerTimes();
  }, [
    coords,
    userId,
    isSubscribed,
    prayers,
    lastPrayerCoords,
    setPrayerData,
    getLocationName,
  ]);

  /* =========================
      UPDATE LOCATION BUTTON
     ========================= */
  const handleUpdateLocation = async () => {
    if (btnLoading) return;

    setBtnLoading(true);
    setLocationStatus("updating");

    try {
      await requestLocation();
      setLocationStatus("updated");
    } catch {
      setLocationStatus("failed");
    } finally {
      setBtnLoading(false);
    }
  };

  /* =========================
      AUTO CLEAR STATUS
     ========================= */
  useEffect(() => {
    if (!locationStatus) return;

    const timer = setTimeout(() => {
      setLocationStatus(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [locationStatus]);

  /* =========================
      FETCH RANDOM VIDEOS
     ========================= */
  useEffect(() => {
    let active = true;

    fetch("/api/ustadz/random-videos")
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setRandomVideos(data?.videos || []);
        }
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, []);

  /* =========================
      RENDER
     ========================= */
  return (
    <>
      <LocationModal
        open={modalOpen}
        onAllow={requestLocation}
        onIgnore={ignoreLocation}
      />

      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
        <main className="flex w-full max-w-3xl mx-auto flex-col gap-4 px-4 pt-16 pb-32">
          <PrayerCards prayers={prayers} locationName={locationName} />

          <div className="flex items-center gap-3 mt-4">
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
              <h2 className="mt-6 text-base font-semibold">
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
