'use client';

import { useState } from 'react';
import TopBar from '@/components/ui/TopBar';
import { useNearbyMasjids } from '../hooks/useNearbyMasjid';
import { useRouting } from '../hooks/useRouting';
import { useLocationContext } from '../context/locationContext';
import MosqueMap from '../Components/Map/MosqueMap';
import MosqueBottomCard from '../Components/Map/MosqueBottomCard';
import MainNavigation from '../Components/MainNavigation';

export default function Page() {
  const { coords, address: ctxAddress } = useLocationContext();
  const address = ctxAddress;
  const [radius, setRadius] = useState(2000);
  const userPos = coords;
  const mosques = useNearbyMasjids(userPos, radius);
  const { route, routeInfo, routeTo, clearRoute } = useRouting(userPos);
  const [selectedMosque, setSelectedMosque] = useState(null);

  const handleCancel = () => {
    clearRoute();
    setSelectedMosque(null);
  };

  const displayedMosques =
    routeInfo && selectedMosque ? [selectedMosque] : mosques;

  return (
    <div className='relative h-screen w-full'>
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

      <MosqueMap
        userPos={userPos}
        radius={radius}
        mosques={displayedMosques}
        route={route}
        onRoute={routeTo}
        isRouting={!!routeInfo}
        onSelectMosque={setSelectedMosque}
        selectedMosque={selectedMosque}
      />

      <MosqueBottomCard
        mosque={selectedMosque}
        routeInfo={routeInfo}
        onRoute={routeTo}
        onCancel={handleCancel}
      />
      <MainNavigation visible={!selectedMosque} />
    </div>
  );
}
