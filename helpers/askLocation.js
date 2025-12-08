export function shouldAskLocation() {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem("ushalli_location_permission");
}

export function saveLocationPermission(status) {
  localStorage.setItem("ushalli_location_permission", status);
}
