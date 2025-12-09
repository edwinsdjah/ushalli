"use client";
import { useEffect, useState } from "react";
import NotificationToggle from "@/app/Components/NotificationToggle";
import NotificationModal from "./Components/NotificationModal";
import LocationModal from "./Components/LocationModal";
import usePushNotification from "./hooks/usePushNotification";
import useUserLocation from "./hooks/useUserLocation";
import { getOrCreateUserId } from "@/helpers/user";

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

  const [prayers, setPrayers] = useState(null);

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
        } else {
          console.log("timings dari API:", json.data.timings);
          console.warn("Tidak ada timings dari API");
          console.log("Full response:", json);
        }
      } catch (err) {
        console.error("Failed fetching prayer times", err);
      }
    })();
  }, [coords]);

  return (
    <>
      {/* 🔔 Modal pertama kali untuk push notification */}
      <NotificationModal
        open={permission === "default"} // muncul jika belum pernah pilih
        onAllow={subscribeToPush}
        onIgnore={() => Notification.requestPermission()} // supaya modal hilang
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
              {Object.entries(prayers).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong> {value}
                </p>
              ))}
            </div>
          )}

          {/* 🔔 Toggle hanya untuk UI setelah user memberi izin */}
          <NotificationToggle isSubscribed={isSubscribed} />
        </main>
      </div>
    </>
  );
}
