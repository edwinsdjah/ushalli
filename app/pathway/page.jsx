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

  const trimmedRoute = useMemo(() => {
    if (!route || !userPos) return route;

    const index = findClosestRouteIndex(route, userPos);

    // jaga-jaga agar tidak kosong
    return route.slice(Math.max(0, index));
  }, [route, userPos]);
    // Derived route info yang selalu update saat mode berubah
  const derivedRouteInfo = useMemo(() => {
  if (!routeInfo || !selectedMosque || !userPos || !route) return null;

  // ambil rute yang sudah dipotong
  const activeRoute = trimmedRoute;

  // hitung total jarak sepanjang polyline (meter)
  let distance = 0;
  for (let i = 1; i < activeRoute.length; i++) {
    const [lat1, lon1] = activeRoute[i - 1];
    const [lat2, lon2] = activeRoute[i];
    distance += haversineDistance({ lat: lat1, lon: lon1 }, [lat2, lon2]);
  }

  const SPEED = { walk: 80, bicycle: 250, drive: 600 }; // m/menit
  const speed = SPEED[routeInfo.mode] || SPEED.bicycle;

  return {
    ...routeInfo,
    distance: Math.round(distance),
    time: distance > 0 ? Math.max(1, Math.round(distance / speed)) : null,
  };
}, [routeInfo, selectedMosque, userPos, trimmedRoute]); // tambahkan trimmedRoute sebagai dependency



  // Function potong polyline yang sudah dilewati
  

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
