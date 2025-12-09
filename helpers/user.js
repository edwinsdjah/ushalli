export function getOrCreateUserId() {
  if (typeof window === "undefined") return null;

  let uid = localStorage.getItem("ushalli_user_id");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("ushalli_user_id", uid);
  }
  return uid;
}
