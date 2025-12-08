"use client";

import { useState, useEffect, useCallback } from "react";

export default function useUserLocation() {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const alreadyAsked = localStorage.getItem("location_requested");

    if (!alreadyAsked) {
      setModalOpen(true); // tampilkan modal
      setLoading(false);
      return;
    }

    // sudah pernah izin → load dari cache
    const saved = localStorage.getItem("user_coords");
    if (saved) setCoords(JSON.parse(saved));

    setLoading(false);
  }, []);

  const requestLocation = useCallback(() => {
    setModalOpen(false);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };

        localStorage.setItem("location_requested", "true");
        localStorage.setItem("user_coords", JSON.stringify(c));

        setCoords(c);
        setLoading(false);
      },
      (err) => {
        console.error("Location error:", err);
        setLoading(false);
      }
    );
  }, []);

  const ignoreLocation = useCallback(() => {
    localStorage.setItem("location_requested", "true");
    setModalOpen(false);
  }, []);

  return {
    coords,
    modalOpen,
    loading,
    requestLocation,
    ignoreLocation,
  };
}
