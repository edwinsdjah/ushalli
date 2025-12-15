import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function FlyTo({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) map.setView(position, 15);
  }, [position, map]);

  return null;
}
