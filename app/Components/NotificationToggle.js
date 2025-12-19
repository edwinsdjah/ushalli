"use client";

import { Bell, BellOff } from "lucide-react";
import InstallPWAButton from "./InstallPWAButton";
import { usePush } from "../context/pushContext";

export default function NotificationToggle() {
  const {
    isSupported,
    permission,
    isSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
    loading,
  } = usePush();

  if (!isSupported) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-red-500">
          Browser kamu tidak mendukung push notification.
          <br />
          Silahkan install sebagai PWA.
        </p>
        <InstallPWAButton />
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <p className="text-sm text-red-500">
        Kamu menolak notifikasi. Aktifkan kembali dari pengaturan browser.
      </p>
    );
  }

  const handleToggle = async () => {
    if (loading) return;
    isSubscribed ? await unsubscribeFromPush() : await subscribeToPush();
  };

  let bgClass = "bg-[var(--color-royal)] hover:bg-purple-700";
  if (loading) bgClass = "bg-gray-500 cursor-not-allowed";
  else if (isSubscribed) bgClass = "bg-yellow-500 hover:bg-yellow-600";

  return (
    <button
      disabled={loading}
      onClick={handleToggle}
      className={`px-5 py-3 rounded-2xl font-semibold shadow-md transition-all
        ${bgClass} text-white ${!loading && "hover:scale-105 active:scale-95"}`}
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
