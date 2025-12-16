'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Compass } from 'lucide-react';
import { useLocationContext } from '@/app/context/locationContext';
import MainNavigation from '../Components/MainNavigation';

// Hitung Arah Kiblat
function calculateQiblaDirection(lat, lon) {
  const kaabaLat = 21.422487;
  const kaabaLon = 39.826206;

  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (kaabaLat * Math.PI) / 180;
  const λ1 = (lon * Math.PI) / 180;
  const λ2 = (kaabaLon * Math.PI) / 180;

  const Δλ = λ2 - λ1;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

export default function CompassPage() {
  const { coords } = useLocationContext();

  const [heading, setHeading] = useState(0);
  const [qibla, setQibla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (!coords) {
      setLoading(false);
      return;
    }
    const q = calculateQiblaDirection(coords.lat, coords.lon);
    setQibla(q);
    setLoading(false);
  }, [coords]);

  useEffect(() => {
    if (!permissionGranted) return;

    const handler = e => {
      let d = null;

      if (typeof e.webkitCompassHeading === 'number') {
        d = e.webkitCompassHeading;
      } else if (typeof e.alpha === 'number') {
        d = 360 - e.alpha;
      }

      if (d !== null) {
        setHeading((d + 360) % 360);
      }
    };

    window.addEventListener('deviceorientation', handler, true);
    return () => window.removeEventListener('deviceorientation', handler);
  }, [permissionGranted]);

  const requestPermission = async () => {
    try {
      if (DeviceOrientationEvent?.requestPermission) {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res === 'granted') setPermissionGranted(true);
      } else {
        setPermissionGranted(true);
      }
    } catch (e) {
      console.error('Permission failed', e);
    }
  };

  const angleToQibla = qibla !== null ? (qibla - heading + 360) % 360 : 0;

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 font-sans'>
      {/* Instruksi */}
      <p className='mb-4 text-gray-500 text-center text-sm md:text-base tracking-wide'>
        Silakan Tempatkan Perangkat Anda dalam posisi mendatar
      </p>

      <Card className='w-full max-w-md rounded-3xl border-none bg-white shadow-xl'>
        <CardContent className='flex flex-col items-center gap-6'>
          {loading ? (
            <Loader2 className='animate-spin text-purple-600' />
          ) : !coords ? (
            <p className='text-center text-sm text-gray-600'>Lokasi belum tersedia.</p>
          ) : (
            <>
              {/* Kompas */}
              <div className='relative w-72 h-72 flex items-center justify-center'>
                {/* Lingkaran kompas abu-abu modern */}
                <div className='absolute inset-0 rounded-full bg-gray-100 border-gray-300 flex items-center justify-center'>
                  {/* Arah N, E, S, W */}
                  <span className='absolute top-2 text-gray-500 font-medium'>N</span>
                  <span className='absolute right-2 text-gray-500 font-medium'>E</span>
                  <span className='absolute bottom-2 text-gray-500 font-medium'>S</span>
                  <span className='absolute left-2 text-gray-500 font-medium'>W</span>
                </div>

                {/* Jarum Kiblat modern */}
                <div
                  className='absolute w-64 h-64 flex items-center justify-center transition-transform duration-200 ease-in-out'
                  style={{ transform: `rotate(${angleToQibla}deg)` }}
                >
                  <div className='relative flex flex-col items-center justify-start'>
                    {/* Panah jarum */}
                    <div className='w-1 h-36 bg-[var(--color-royal)] rounded shadow-lg relative'>
                      <div className='absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-10 border-b-purple-800  border-l-transparent border-r-transparent' />
                    </div>
                    {/* Ka'bah di ujung jarum */}
                    <div className='absolute -top-12 w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg'>
                      🕋
                    </div>
                  </div>
                </div>
              </div>

              {/* Lokasi */}
              <div className='mt-6 text-center text-gray-700 font-medium'>
                <p>Latitude: {coords.lat.toFixed(4)}</p>
                <p>Longitude: {coords.lon.toFixed(4)}</p>
              </div>

              {/* Tombol Aktifkan Sensor */}
              {!permissionGranted && (
                <button
                  onClick={requestPermission}
                  className='mt-4 flex items-center gap-2 px-4 py-2 bg-[var(--color-royal)] hover:bg-purple-800 text-white rounded-xl transition-all font-medium'
                >
                  <Compass size={20} />
                  Aktifkan Sensor
                </button>
              )}
            </>
          )}
        </CardContent>

        <MainNavigation />
      </Card>
    </div>
  );
}
