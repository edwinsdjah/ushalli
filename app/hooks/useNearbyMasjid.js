import { useEffect, useState } from 'react';
import { fetchNearbyMosques } from '../../services/geoapify';

export function useNearbyMasjids(position, radius) {
  const [mosques, setMosques] = useState([]);
  useEffect(() => {
    if (!position) return;
    fetchNearbyMosques({
      lat: position.lat,
      lon: position.lon,
      radius,
    }).then(setMosques);
  }, [position, radius]);

  return mosques;
}
