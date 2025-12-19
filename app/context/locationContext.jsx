'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState(null);
  const [region, setRegion] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [neighborhood, setNeighborhood] = useState(null);
  const [prayers, setPrayers] = useState(null);
  const [lastPrayerCoords, setLastPrayerCoords] = useState(null);

  // ✅ wrapper resmi
  const updateCoords = useCallback(c => {
    setCoords(c);
  }, []);

  const getLocationName = useCallback(async (lat, lon) => {
    try {
      const res = await fetch(
        `/api/reverse-geocode?lat=${lat}&lon=${lon}`
      );

      if (!res.ok) throw new Error();
      
      const data = await res.json();
      const result = data.data
      const city =
        result.address.suburb ||
        result.address.town ||
        result.address.village ||
        result.address.county ||
        result.address.state ||
        result.address.city;
      setNeighborhood(result.address.neighbourhood)
      setRegion(result.address.city)
      setAddress(result.display_name || null);
      setLocationName(city || '');
      return city;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  const setPrayerData = useCallback((timings, coords) => {
    setPrayers(timings);
    setLastPrayerCoords(coords);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        coords,
        updateCoords, // ⬅️ gunakan ini
        locationName,
        address,
        getLocationName,
        prayers,
        lastPrayerCoords,
        setPrayerData,
        neighborhood,
        region
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  return useContext(LocationContext);
}
