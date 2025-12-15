'use client';

import { useEffect, useState } from 'react';
import NotificationToggle from '@/app/Components/NotificationToggle';
import NotificationModal from './Components/NotificationModal';
import LocationModal from './Components/LocationModal';
import usePushNotification from './hooks/usePushNotification';
import useUserLocation from './hooks/useUserLocation';
import { getOrCreateUserId } from '@/helpers/user';
import { useLocationContext } from '@/app/context/locationContext';
import PrayerCards from './Components/PrayerCards';
import UpdateLocationButton from './Components/UpdateLocationButton';
import MainNavigation from './Components/MainNavigation';

export default function Home() {
  // PUSH NOTIFICATION HOOK
  const { permission, subscribeToPush, isSubscribed } = usePushNotification();

  // LOCATION HOOK
  const { coords, modalOpen, requestLocation, ignoreLocation } =
    useUserLocation();

  // LOCATION CONTEXT
  const {
    coords: ctxCoords,
    setCoords,
    getLocationName,
  } = useLocationContext();

  const userId = getOrCreateUserId();
  const [prayers, setPrayers] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);

  // Update context
  useEffect(() => {
    if (!coords) return;
    if (
      !ctxCoords ||
      ctxCoords.lat !== coords.lat ||
      ctxCoords.lon !== coords.lon
    ) {
      setCoords(coords);
      setLocationName(getLocationName(coords.lat, coords.lon));
    }
  }, [coords]);

  // Fetch prayer times
  useEffect(() => {
    if (!ctxCoords || !userId) return;
    (async () => {
      try {
        const res = await fetch('/api/prayer-times', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: ctxCoords.lat,
            lon: ctxCoords.lon,
            userId,
          }),
        });
        const json = await res.json();
        if (json?.data?.timings) setPrayers(json.data.timings);
      } catch (err) {
        console.error('Failed fetching prayer times', err);
      }
    })();
  }, [ctxCoords, userId]);

  const handleUpdateLocation = async () => {
    setBtnLoading(true);
    await requestLocation();
    if (!coords) return;

    const res = await fetch(`/api/prayer-times?userId=${userId}`);
    const json = await res.json();
    const dbCoords = json?.data?.location;

    const isDifferent =
      !dbCoords || dbCoords.lat !== coords.lat || dbCoords.lon !== coords.lon;

    if (isDifferent) {
      await fetch('/api/prayer-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: coords.lat, lon: coords.lon, userId }),
      });
      setLocationStatus('different');
    } else {
      setLocationStatus('same');
    }
    setBtnLoading(false);
  };

  useEffect(() => {
    if (!locationStatus) return;
    const timeout = setTimeout(() => setLocationStatus(null), 3000);
    return () => clearTimeout(timeout);
  }, [locationStatus]);

  return (
    <>
      {/* Modals */}
      <LocationModal
        open={modalOpen}
        onAllow={requestLocation}
        onIgnore={ignoreLocation}
      />

      <div className='flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans'>
        <main className='flex flex-col w-full max-w-3xl mx-auto px-4 pt-16 pb-32 gap-6'>
          {/* Header */}
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left'>
            Jadwal Sholat
          </h1>

          {/* Prayer Cards */}
          {prayers && (
            <PrayerCards prayers={prayers} locationName={locationName} />
          )}

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row items-center gap-3 mt-4'>
            <UpdateLocationButton
              onUpdate={handleUpdateLocation}
              loading={btnLoading}
              locationStatus={locationStatus}
            />
            <NotificationToggle isSubscribed={isSubscribed} />
          </div>
        </main>

        {/* Bottom Navigation */}
        <MainNavigation />
      </div>
    </>
  );
}
