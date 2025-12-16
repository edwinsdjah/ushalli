import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function MapController({ route, isRouting }) {
  const map = useMap();
  const fittedRef = useRef(false);

  useEffect(() => {
    if (!route || route.length === 0) {
      fittedRef.current = false;
      return;
    }

    if (isRouting && !fittedRef.current) {
      const bounds = L.latLngBounds(route);
      map.fitBounds(bounds, {
        padding: [40, 40],
        animate: true,
      });

      fittedRef.current = true;
    }
  }, [route, isRouting, map]);

  return null;
}
