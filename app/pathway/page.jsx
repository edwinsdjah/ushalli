'use client';

import { useState } from 'react';
import TopBar from '@/components/ui/TopBar';
import { useNearbyMasjids } from '../hooks/useNearbyMasjid';
import { useRouting } from '../hooks/useRouting';
import { useLocationContext } from '../context/locationContext';
import useUserLocation from '../hooks/useUserLocation';
import { useMemo } from 'react';
import { findClosestRouteIndex, haversineDistance } from '@/utils/distance';
import MosqueMap from '../Components/Map/MosqueMap';
import MosqueBottomCard from '../Components/Map/MosqueBottomCard';
import MainNavigation from '../Components/MainNavigation';


export default function Page() {
  // 🔹 ambil context
  const { coords, address, updateCoords } = useLocationContext();

  // 🔹 hook GPS → update ke context
  const { modalOpen, loading, requestLocation, ignoreLocation } =
    useUserLocation(updateCoords);

  const [radius, setRadius] = useState(2000);
  const userPos = coords;
  const mosques = useNearbyMasjids(userPos, radius);
  const { route, routeInfo, routeTo, clearRoute } = useRouting(userPos);
  const [selectedMosque, setSelectedMosque] = useState(null);

  // Function update rute di bottom map
  const derivedRouteInfo = useMemo(() => {
    if (!routeInfo || !selectedMosque || !userPos) return routeInfo;

    const distance = haversineDistance(
      userPos,
      selectedMosque.position
    );

    // estimasi kasar (meter / menit)
    const SPEED = {
      walking: 80,   // ~5 km/h
      bicycle: 250,  // ~15 km/h
      driving: 600,  // ~36 km/h
    };

    const speed = SPEED[routeInfo.mode] || SPEED.bicycle;

    return {
      ...routeInfo,
      distance,
      time: Math.max(1, Math.round(distance / speed)),
    };
  }, [routeInfo, selectedMosque, userPos]);

  // Function potong polyline yang sudah dilewati
  const trimmedRoute = useMemo(() => {
    if (!route || !userPos) return route;

    const index = findClosestRouteIndex(route, userPos);

    // jaga-jaga agar tidak kosong
    return route.slice(Math.max(0, index));
  }, [route, userPos]);

  const handleCancel = () => {
    clearRoute();
    setSelectedMosque(null);
  };

  const displayedMosques =
    routeInfo && selectedMosque ? [selectedMosque] : mosques;

  return (
    <div className='relative h-screen w-full'>
      {/* TOP BAR */}
      <TopBar
        address={address}
        radius={radius}
        setRadius={setRadius}
        routeInfo={routeInfo}
        onClearRoute={handleCancel}
        onChangeMode={mode => {
          if (!selectedMosque) return;
          routeTo(selectedMosque.position, mode);
        }}
      />

      {/* MAP */}
      <MosqueMap
        userPos={userPos}
        radius={radius}
        mosques={displayedMosques}
        route={trimmedRoute}
        onRoute={routeTo}
        isRouting={!!routeInfo}
        onSelectMosque={setSelectedMosque}
        selectedMosque={selectedMosque}
      />

      {/* BOTTOM CARD */}
      <MosqueBottomCard
        mosque={selectedMosque}
        routeInfo={derivedRouteInfo}
        onRoute={routeTo}
        onCancel={handleCancel}
      />

      <MainNavigation visible={!selectedMosque} />
    </div>
  );
}
