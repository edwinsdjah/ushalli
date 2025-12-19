"use client";

import { useCallback, useEffect, useState } from "react";

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

  const userId = typeof window !== "undefined" ? getOrCreateUserId() : null;

  /**
   * 🔍 Cek status subscription dari DB
   */
  const checkSubscriptionStatus = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await fetch(`/api/push/status?userId=${userId}`);
      const data = await res.json();
      setIsSubscribed(!!data.subscribed);
    } catch {
      setIsSubscribed(false);
    }
  }, [userId]);

  /**
   * Init
   */
  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;

    setIsSupported(supported);
    if (!supported) return;

    setPermission(Notification.permission);
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  /**
   * Permission
   */
  const requestPermission = useCallback(async () => {
    if (!isSupported) return { ok: false };

    const result = await Notification.requestPermission();
    setPermission(result);

    return result === "granted"
      ? { ok: true }
      : { ok: false, error: "Permission denied" };
  }, [isSupported]);

  /**
   * Subscribe
   */
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

      // ✅ Pastikan fallback jika keys atau endpoint kosong
      const subPayload = {
        userId,
        endpoint: subscription.endpoint || "",
        keys: subscription.keys || {},
        subscription: subscription.toJSON(),
      };

      if (!subPayload.userId) throw new Error("userId is missing");
      if (!subPayload.endpoint)
        throw new Error("subscription endpoint missing");

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subPayload),
      });

      // 🔥 Regenerate prayer times
      const savedCoords = localStorage.getItem("user_coords");
      if (savedCoords) {
        const { lat, lon } = JSON.parse(savedCoords);
        await fetch("/api/prayer-times", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat,
            lon,
            userId,
            persist: true, // ✅ FIXED: subscribe = simpan ke DB
          }),
        });
      }

      setIsSubscribed(true);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [permission, requestPermission, userId]);

  /**
   * Unsubscribe + cleanup DB
   */
  const unsubscribeFromPush = useCallback(async () => {
    try {
      setLoading(true);

      const sw = await navigator.serviceWorker.ready;
      const sub = await sw.pushManager.getSubscription();

      if (sub) await sub.unsubscribe();

      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      setIsSubscribed(false);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    permission,
    isSupported,
    isSubscribed,
    loading,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
