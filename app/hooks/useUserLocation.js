'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export default function useUserLocation(onChange) {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const watchIdRef = useRef(null);

  /* =========================
     START WATCHING GPS
  ========================== */
  const startWatching = useCallback(() => {
    if (!('geolocation' in navigator)) return;
    if (watchIdRef.current !== null) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const c = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };

        setCoords(c);
        localStorage.setItem('user_coords', JSON.stringify(c));
        onChange?.(c);
      },
      err => console.error('Location error:', err),
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );
  }, [onChange]);

  /* =========================
     INIT (CACHE + PERMISSION)
  ========================== */
  useEffect(() => {
    const alreadyAsked = localStorage.getItem('location_requested');

    if (!alreadyAsked) {
      setModalOpen(true);
      setLoading(false);
      return;
    }

    const saved = localStorage.getItem('user_coords');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCoords(parsed);
      onChange?.(parsed);
    }

    startWatching();
    setLoading(false);
  }, [startWatching, onChange]);

  /* =========================
     REQUEST PERMISSION (MODAL)
  ========================== */
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
        onChange?.(c);

        startWatching();
        setLoading(false);
      },
      err => {
        console.error('Location error:', err);
        setLoading(false);
      }
    );
  }, [startWatching, onChange]);

  /* =========================
     IGNORE LOCATION
  ========================== */
  const ignoreLocation = useCallback(() => {
    localStorage.setItem('location_requested', 'true');
    setModalOpen(false);
  }, []);

  /* =========================
     CLEANUP
  ========================== */
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
