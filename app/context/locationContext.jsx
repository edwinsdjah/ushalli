"use client";

import { createContext, useContext, useState, useCallback } from "react";

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [coords, setCoords] = useState(null);
  const [locationName, setLocationName] = useState("");

  const getLocationName = useCallback(async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );

      if (!res.ok) throw new Error("Gagal mendapatkan nama lokasi");

      const data = await res.json();
      console.log(data)
      const city =
        data.address.suburb ||
        data.address.town ||
        data.address.village ||
        data.address.county ||
        data.address.state ||
        data.address.city;

      setLocationName(city || "Lokasi tidak ditemukan");

      return city;
    } catch (e) {
      console.error("Location lookup error:", e);
      return null;
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        coords,
        setCoords,
        locationName,
        getLocationName,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  return useContext(LocationContext);
}
