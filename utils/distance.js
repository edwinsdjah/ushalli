export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // radius bumi

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// utils/distance.js
// utils/distance.js
export function haversineDistance(a, b) {
  if (!a || !b) return 0;

  // pastikan properti ada
  const lat1 = a.lat;
  const lon1 = a.lon; // support lon atau lng
  const lat2 = b[0];
  const lon2 = b[1];
  if (
    typeof lat1 !== "number" ||
    typeof lon1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lon2 !== "number"
  )
    return 0;

  const R = 6371000; // meter
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const aCalc =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));
}

// utils/routeUtils.js
export function findClosestRouteIndex(route, userPos) {
  if (!route || route.length === 0 || !userPos) return 0;

  let minDist = Infinity;
  let closestIndex = 0;

  for (let i = 0; i < route.length; i++) {
    const dx = route[i][0] - userPos.lat;
    const dy = route[i][1] - userPos.lon;
    const dist = dx * dx + dy * dy;

    if (dist < minDist) {
      minDist = dist;
      closestIndex = i;
    }
  }

  return closestIndex;
}
