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
export function haversineDistance(a, b) {
  if (!a || !b) return 0;

  const R = 6371000; // meter
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
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
