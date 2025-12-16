'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  // LOCATION STATE
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState(null);
  const [locationName, setLocationName] = useState('');

  // PRAYER STATE (CACHE)
  const [prayers, setPrayers] = useState(null);
  const [lastPrayerCoords, setLastPrayerCoords] = useState(null);

  // GET LOCATION NAME
  const getLocationName = useCallback(async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );

      if (!res.ok) throw new Error('Gagal mendapatkan nama lokasi');

      const data = await res.json();

      const city =
        data.address.suburb ||
        data.address.town ||
        data.address.village ||
        data.address.county ||
        data.address.state ||
        data.address.city;

      setAddress(data.display_name || 'Alamat tidak ditemukan');
      setLocationName(city || 'Lokasi tidak ditemukan');

      return city;
    } catch (e) {
      console.error('Location lookup error:', e);
      return null;
    }
  }, []);

  // HELPER: set prayer data + coords
  const setPrayerData = useCallback((timings, coords) => {
    setPrayers(timings);
    setLastPrayerCoords(coords);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        // location
        coords,
        setCoords,
        locationName,
        address,
        getLocationName,

        // prayer cache
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
