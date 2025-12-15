import { useEffect, useState } from 'react';

export function useGeoTracker() {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      pos => setPosition([pos.coords.latitude, pos.coords.longitude]),
      err => alert(err.message),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return position;
}
