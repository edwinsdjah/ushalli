"use client";

import usePushNotification from "@/app/hooks/usePushNotification";

export default function NotificationToggle() {
  const {
    isSupported,
    permission,
    isSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
    loading,
  } = usePushNotification();

  // Jika browser tidak support
  if (!isSupported) {
    return <p>Browser kamu tidak mendukung push notification.</p>;
  }

  // Jika user belum memberikan permission sama sekali
  if (permission === "denied") {
    return (
      <p className="text-red-500">
        Kamu menolak notifikasi. Aktifkan kembali dari pengaturan browser.
      </p>
    );
  }

  const handleToggle = async () => {
    if (loading) return;

    if (isSubscribed) {
      await unsubscribeFromPush();
    } else {
      await subscribeToPush();
    }
  };

  return (
    <button
      disabled={loading}
      onClick={handleToggle}
      className="px-4 py-2 rounded bg-blue-600 text-white"
    >
      {loading
        ? "Processing..."
        : isSubscribed
        ? "Matikan Pengingat Waktu Sholat"
        : "Aktifkan Pengingat Waktu Sholat"}
    </button>
  );
}
