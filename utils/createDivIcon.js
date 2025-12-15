import L from 'leaflet';

export function createDivIcon(html, size = [40, 40]) {
  return L.divIcon({
    html,
    className: '', // IMPORTANT: kosongin biar Tailwind jalan
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
  });
}
