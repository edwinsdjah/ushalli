"use client";

import usePushNotification from "@/app/hooks/usePushNotification";
import { Bell, BellOff } from "lucide-react";
import InstallPWAButton from "./InstallPWAButton";

export default function NotificationToggle() {
  const {
    isSupported,
    permission,
    isSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
    loading,
  } = usePushNotification();

  // Browser tidak support
  if (!isSupported) {
    return (
      <div className="flex flex-row justify-center">
        <p className="text-sm text-red-500">
          Browser kamu tidak mendukung push notification.
          <br />
          Silahkan install sebagai PWA melalui button berikut
          <br />
        </p>
        <InstallPWAButton />
      </div>
    );
  }

  // User menolak permission
  if (permission === "denied") {
    return (
      <p className="text-sm text-red-500">
        Kamu menolak notifikasi. Aktifkan kembali dari pengaturan browser.
      </p>
    );
  }

  const handleToggle = async () => {
    if (loading) return;
    if (isSubscribed) await unsubscribeFromPush();
    else await subscribeToPush();
  };

  let bgClass = "bg-[var(--color-royal)] hover:bg-purple-700";
  let textClass = "text-white";

  if (loading) {
    bgClass = "bg-gray-500 cursor-not-allowed";
  } else if (isSubscribed) {
    bgClass = "bg-yellow-500 hover:bg-yellow-600";
  }

  return (
    <button
      disabled={loading}
      onClick={handleToggle}
      className={`px-5 py-3 rounded-2xl font-semibold shadow-md transition-all transform
        ${bgClass} ${textClass} ${
        !loading && "hover:scale-105 active:scale-95"
      }`}
    >
      {loading ? (
        "Processing..."
      ) : isSubscribed ? (
        <BellOff className="w-5 h-5" />
      ) : (
        <Bell className="w-5 h-5" />
      )}
    </button>
  );
}
