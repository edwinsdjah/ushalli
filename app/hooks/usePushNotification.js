"use client";

import { useCallback, useState, useEffect } from "react";

function getOrCreateUserId() {
  if (typeof window === "undefined") return null;

  let uid = localStorage.getItem("ushalli_user_id");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("ushalli_user_id", uid);
  }
  return uid;
}

export default function usePushNotification() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Jalankan hanya di client
  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;

    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);

      navigator.serviceWorker.ready.then(async (sw) => {
        const sub = await sw.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      });
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return { ok: false, error: "Not supported" };

    const result = await Notification.requestPermission();
    setPermission(result);

    return result === "granted"
      ? { ok: true }
      : { ok: false, error: "Permission not granted" };
  }, [isSupported]);

  const subscribeToPush = useCallback(async () => {
    try {
      setLoading(true);

      if (permission !== "granted") {
        const p = await requestPermission();
        if (!p.ok) return p;
      }

      const sw = await navigator.serviceWorker.ready;

      const keyRes = await fetch("/api/vapid-public-key");
      const { publicKey } = await keyRes.json();

      const b64ToUint8 = (b64) => {
        const padding = "=".repeat((4 - (b64.length % 4)) % 4);
        const base64 = (b64 + padding).replace(/-/g, "+").replace(/_/g, "/");
        const raw = atob(base64);
        return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
      };

      const subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: b64ToUint8(publicKey),
      });

      const userId = getOrCreateUserId();

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...subscription.toJSON(), userId }),
      });

      setIsSubscribed(true);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [permission, requestPermission]);

  const unsubscribeFromPush = useCallback(async () => {
    try {
      setLoading(true);

      const sw = await navigator.serviceWorker.ready;
      const sub = await sw.pushManager.getSubscription();

      if (sub) {
        await sub.unsubscribe();
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub),
        });
      }

      setIsSubscribed(false);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    permission,
    isSupported,
    isSubscribed,
    loading,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
