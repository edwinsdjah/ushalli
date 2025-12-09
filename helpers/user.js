export function getOrCreateUserId(optional = false) {
  if (typeof window === "undefined") return null;

  let uid = localStorage.getItem("ushalli_user_id");

  // Jika optional = true, jangan membuat userId kalau belum ada
  if (optional) {
    return uid || null;
  }

  // Default: buat kalau belum ada
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("ushalli_user_id", uid);
  }

  return uid;
}
