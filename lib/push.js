import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn(
    "VAPID keys are not set. Push notifications will not work until you set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY."
  );
} else {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

/**
 * sendPush(subscription, payload)
 * - subscription: object { endpoint, keys: { p256dh, auth } }
 * - payload: stringified JSON (recommended)
 */
export async function sendPush(sub, payload) {
  try {
    const res = await webpush.sendNotification(sub, payload);
    return { ok: true, result: res };
  } catch (error) {
    return { ok: false, error: err };
  }
}

export { webpush };
