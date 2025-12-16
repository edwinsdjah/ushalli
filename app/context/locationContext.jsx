'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState(null);
  const [locationName, setLocationName] = useState('');

  const [prayers, setPrayers] = useState(null);
  const [lastPrayerCoords, setLastPrayerCoords] = useState(null);

  // ✅ wrapper resmi
  const updateCoords = useCallback(c => {
    setCoords(c);
  }, []);

  const getLocationName = useCallback(async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      if (!res.ok) throw new Error();

      const data = await res.json();
      const city =
        data.address.suburb ||
        data.address.town ||
        data.address.village ||
        data.address.county ||
        data.address.state ||
        data.address.city;

      setAddress(data.display_name || null);
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
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  return useContext(LocationContext);
}
