import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function MapController({ route }) {
  const map = useMap();

  useEffect(() => {
    if (!route || route.length === 0) return;

    const bounds = L.latLngBounds(route);
    map.fitBounds(bounds, {
      padding: [40, 40],
    });
  }, [route, map]);

  return null;
}
