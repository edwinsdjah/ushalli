'use client';

import { useEffect, useState } from 'react';

// Components
import LocationModal from './Components/LocationModal';
import PrayerCards from './Components/PrayerCards';
import UpdateLocationButton from './Components/UpdateLocationButton';
import NotificationToggle from '@/app/Components/NotificationToggle';
import MainNavigation from './Components/MainNavigation';
import DailyDoa from './Components/DailyDoa';
import RandomVideoSlider from './Components/Videos/RandomVideoSlider';
import RandomVideoSliderSkeleton from './Components/Videos/RandomVideoSkeleton';

// Hooks & Context
import useUserLocation from './hooks/useUserLocation';
import { useLocationContext } from '@/app/context/locationContext';
import { usePush } from './context/pushContext';
import { getOrCreateUserId } from '@/helpers/user';

export default function Home() {
  /* =========================
      GLOBAL CONTEXT
     ========================= */
  const SKELETON_COUNT = 5;
  const userId = getOrCreateUserId();
  const { isSubscribed } = usePush(); // ✅ context push

  const {
    coords,
    updateCoords,
    getLocationName,
    locationName,
    prayers,
    lastPrayerCoords,
    setPrayerData,
  } = useLocationContext();

  /* =========================
      LOCAL UI STATE
     ========================= */
  const [btnLoading, setBtnLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);
  const [randomVideos, setRandomVideos] = useState([]);
  const [randomVidLoading, setRandomVidLoading] = useState(true);

  /* =========================
      USER LOCATION
     ========================= */
  const { modalOpen, requestLocation, ignoreLocation } =
    useUserLocation(updateCoords);

  /* =========================
      FETCH PRAYER TIMES
     ========================= */
  useEffect(() => {
    if (!coords || !userId) return;

    const sameLocation =
      lastPrayerCoords &&
      lastPrayerCoords.lat === coords.lat &&
      lastPrayerCoords.lon === coords.lon;

    if (prayers && sameLocation) return;

    const fetchPrayerTimes = async () => {
      try {
        const res = await fetch('/api/prayer-times', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: coords.lat,
            lon: coords.lon,
            userId,
            persist: isSubscribed,
          }),
        });

        const json = await res.json();

        if (json?.data?.timings) {
          setPrayerData(json.data.timings, coords);
          getLocationName(coords.lat, coords.lon);
        }
      } catch (err) {
        console.error('Failed fetching prayer times', err);
      }
    };

    fetchPrayerTimes();
  }, [
    coords,
    userId,
    isSubscribed,
    prayers,
    lastPrayerCoords,
    setPrayerData,
    getLocationName,
  ]);

  /* =========================
      UPDATE LOCATION BUTTON
     ========================= */
  const handleUpdateLocation = async () => {
    if (btnLoading) return;

    setBtnLoading(true);
    setLocationStatus('updating');

    try {
      await requestLocation();
      setLocationStatus('updated');
    } catch {
      setLocationStatus('failed');
    } finally {
      setBtnLoading(false);
    }
  };

  /* =========================
      AUTO CLEAR STATUS
     ========================= */
  useEffect(() => {
    if (!locationStatus) return;
    const t = setTimeout(() => setLocationStatus(null), 3000);
    return () => clearTimeout(t);
  }, [locationStatus]);

  /* =========================
      FETCH RANDOM VIDEOS
     ========================= */
  useEffect(() => {
    const fetchRandomVideos = async () => {
      try {
        const res = await fetch('/api/ustadz/random-videos');
        const data = await res.json();
        setRandomVideos(data?.videos || []);
      } catch (err) {
        console.error('Failed fetching random videos', err);
      } finally {
        setRandomVidLoading(false);
      }
    };

    fetchRandomVideos();
  }, []);

  /* =========================
      RENDER
     ========================= */
  return (
    <>
      <LocationModal
        open={modalOpen}
        onAllow={requestLocation}
        onIgnore={ignoreLocation}
      />

      <div className='flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans'>
        <main className='flex w-full max-w-3xl mx-auto flex-col gap-4 px-4 pt-16 pb-32'>
          <PrayerCards prayers={prayers} locationName={locationName} />

          <div className='flex items-center gap-3 mt-4'>
            <UpdateLocationButton
              onUpdate={handleUpdateLocation}
              loading={btnLoading}
              locationStatus={locationStatus}
            />
            <NotificationToggle /> {/* ✅ ambil dari context */}
          </div>

          <DailyDoa />

          <h2 className='mt-6 text-black text-base font-semibold'>
            Kajian Islami Pilihan Hari Ini
          </h2>
          {randomVidLoading && (
            <>
              <RandomVideoSliderSkeleton />
            </>
          )}

          {!randomVidLoading && randomVideos.length > 0 && (
            <RandomVideoSlider videos={randomVideos} />
          )}
        </main>

        <MainNavigation />
      </div>
    </>
  );
}
