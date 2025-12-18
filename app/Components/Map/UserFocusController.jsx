import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

export default function UserFocusController({ userPos }) {
  const map = useMap();
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!userPos || focusedRef.current) return;

    map.setView([userPos.lat, userPos.lon], map.getZoom(), {
      animate: true,
    });

    focusedRef.current = true;
  }, [userPos, map]);

  return null;
}
