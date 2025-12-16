import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

export default function FlyTo({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.flyTo(position, map.getZoom(), {
      animate: true,
      duration: 0.8,
    });
  }, [position, map]);

  return null;
}
