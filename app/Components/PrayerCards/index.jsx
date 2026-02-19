'use client';

import usePrayerCountdown from './usePrayerCountdown';
import { prayerNames, prayerOrder } from './helpers';

/* =========================
   UI HELPERS
========================= */
function Spinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-4',
  };

  return (
    <div
      className={`
        ${sizes[size]}
        border-purple-300
        border-t-purple-700
        rounded-full
        animate-spin
        mx-auto
      `}
    />
  );
}

const prayerIcons = {
  imsak: '/icons/ico_subuh.svg',
  fajr: '/icons/ico_subuh.svg',
  dhuhr: '/icons/ico_zuhur.svg',
  asr: '/icons/ico_ashar.svg',
  maghrib: '/icons/ico_maghrib.svg',
  isha: '/icons/ico_isya.svg',
};

function SkeletonBox({ className = '' }) {
  return (
    <span className={`bg-purple-200/60 animate-pulse rounded ${className}`} />
  );
}

/* =========================
   MAIN COMPONENT
========================= */
export default function PrayerCards({ prayers, locationName }) {
  const isLoading = !prayers;

  const { countdown, nextPrayer, currentPrayer } = usePrayerCountdown(
    prayers || {}
  );

  const displayPrayer = currentPrayer || nextPrayer;

  return (
    <>
      <div className='text-right'>
        <p className='text-sm font-semibold text-gray-800'>
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        <p className='text-xs text-gray-500 mt-1'>
          Lokasi :{' '}
          {isLoading ? (
            <SkeletonBox className='inline-block w-24 h-3 ml-1' />
          ) : (
            locationName
          )}
        </p>
      </div>
      <div
        className='
        mx-auto w-full max-w-3xl
        rounded-3xl p-6
        bg-gradient-to-br
        from-purple-100 via-purple-50 to-white
        shadow-xl
      '
      >
        {/* ================= HEADER ================= */}
        <div className='flex flex-row justify-between gap-6'>
          <div className='flex flex-col md:flex-row justify-between gap-6 mb-6'>
            <div>
              <p className='text-sm text-purple-700'>
                Menuju waktu{' '}
                {['Imsak', 'Terbit'].includes(prayerNames[nextPrayer])
                  ? ''
                  : 'Sholat '}
                <span className='font-semibold text-purple-900'>
                  {isLoading ? (
                    <SkeletonBox className='inline-block w-20 h-4 ml-1' />
                  ) : (
                    prayerNames[nextPrayer]
                  )}
                </span>
              </p>

              <div className='mt-3 flex items-center gap-3'>
                <div className='text-5xl md:text-6xl font-mono font-bold text-purple-900 tracking-tight'>
                  {isLoading ? <Spinner size='lg' /> : countdown}
                </div>
              </div>
            </div>
          </div>
          {!isLoading && displayPrayer && prayerIcons[displayPrayer] && (
            <img
              src={prayerIcons[displayPrayer]}
              alt={`Icon ${displayPrayer}`}
              className='w-18 h-18 md:w-12 md:h-12'
            />
          )}
        </div>

        {/* ================= PRAYER LIST ================= */}
        <div className='flex gap-3 overflow-x-auto py-2 no-scrollbar'>
          {(isLoading ? prayerOrder : prayerOrder)
            .filter(key =>
              ['imsak', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(key)
            )
            .map(key => {
              const active = key === currentPrayer && !isLoading;
              return (
                <div
                  key={key}
                  className={`
                  min-w-[110px]
                  rounded-2xl px-4 py-3 text-center
                  ${
                    active
                      ? `
                        bg-[var(--color-royal)]
                        text-white
                        scale-105
                        shadow-lg
                        ring-2 ring-[#F5C97A]
                      `
                      : `
                        bg-white
                        border border-gray-200
                        text-gray-800
                      `
                  }
                `}
                >
                  <div className='text-xs font-medium '>{prayerNames[key]}</div>

                  <div className='mt-1 text-lg font-semibold'>
                    {isLoading ? (
                      <SkeletonBox className='w-12 h-5 mx-auto' />
                    ) : (
                      prayers[key]
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}
