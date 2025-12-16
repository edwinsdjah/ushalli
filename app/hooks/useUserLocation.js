'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export default function useUserLocation() {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const watchIdRef = useRef(null);

  // 1️⃣ Init: cek izin & cache
  useEffect(() => {
    const alreadyAsked = localStorage.getItem('location_requested');

    if (!alreadyAsked) {
      setModalOpen(true);
      setLoading(false);
      return;
    }

    // load dari cache dulu (biar map langsung muncul)
    const saved = localStorage.getItem('user_coords');
    if (saved) setCoords(JSON.parse(saved));

    setLoading(false);
  }, []);

  // 2️⃣ Start watch GPS
  const startWatching = useCallback(() => {
    if (!('geolocation' in navigator)) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const c = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };

        setCoords(c);
        localStorage.setItem('user_coords', JSON.stringify(c));
      },
      err => {
        console.error('Location error:', err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );
  }, []);

  // 3️⃣ Request permission (dari modal)
  const requestLocation = useCallback(() => {
    setModalOpen(false);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      pos => {
        localStorage.setItem('location_requested', 'true');

        const c = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };

        setCoords(c);
        localStorage.setItem('user_coords', JSON.stringify(c));

        startWatching();
        setLoading(false);
      },
      err => {
        console.error('Location error:', err);
        setLoading(false);
      }
    );
  }, [startWatching]);

  // 4️⃣ Ignore
  const ignoreLocation = useCallback(() => {
    localStorage.setItem('location_requested', 'true');
    setModalOpen(false);
  }, []);

  // 5️⃣ Cleanup saat unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    coords,
    modalOpen,
    loading,
    requestLocation,
    ignoreLocation,
  };
}
