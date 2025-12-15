'use client';

import usePrayerCountdown from './usePrayerCountdown';
import { prayerNames } from './helpers';

export default function PrayerCards({ prayers, locationName }) {
  const { countdown, nextPrayer, currentPrayer } = usePrayerCountdown(prayers);
  if (!prayers) return null;

  return (
    <div
      className='
        mx-auto w-full max-w-3xl
        rounded-3xl p-6
        bg-gradient-to-br
        from-purple-100 via-purple-50 to-white
        shadow-xl
      '
    >
      {/* HEADER */}
      <div className='flex flex-col md:flex-row justify-between gap-6 mb-6'>
        <div>
          <p className='text-sm text-purple-700'>
            Menuju waktu sholat{' '}
            <span className='font-semibold text-purple-900'>
              {prayerNames[nextPrayer]}
            </span>
          </p>

          <div className='mt-1 text-5xl md:text-6xl font-mono font-bold text-purple-900 tracking-tight'>
            {countdown}
          </div>
        </div>

        <div className='md:text-right'>
          <p className='text-sm font-semibold text-gray-800'>
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <p className='text-xs text-gray-500 mt-1'>Lokasi · {locationName}</p>
        </div>
      </div>

      {/* PRAYER LIST */}
      <div className='flex gap-3 overflow-x-auto py-2'>
        {Object.entries(prayers)
          .filter(([key]) =>
            ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(key)
          )
          .map(([key, time]) => {
            const active = key === currentPrayer;

            return (
              <div
                key={key}
                className={`
                  min-w-[110px]
                  rounded-2xl px-4 py-3 text-center
                  transition-all duration-300
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
                <div
                  className={`text-xs font-medium ${
                    active ? 'text-[#F5C97A]' : 'text-gray-500'
                  }`}
                >
                  {prayerNames[key]}
                </div>

                <div className='mt-1 text-lg font-semibold'>{time}</div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
