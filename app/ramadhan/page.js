'use client';

import { useEffect, useState } from 'react';
import MainNavigation from '../Components/MainNavigation';
import { useLocationContext } from '@/app/context/locationContext';

// Simple helper to clean time strings if needed
// "04:39 (WIB)" -> "04:39"
const cleanTime = str => str?.match(/\d{1,2}:\d{1,2}/)?.[0] || '';

// Calculate Imsak manually: Subuh - 10 mins
// (Though API with tune might give it correctly, we stick to our logic for consistency)
const getImsakFromFajr = fajrTime => {
  if (!fajrTime) return '';
  const [h, m] = fajrTime.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  d.setMinutes(d.getMinutes() - 10);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

export default function RamadhanPage() {
  const { coords, locationName, getLocationName, updateCoords } =
    useLocationContext();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayLoc, setDisplayLoc] = useState(locationName || 'Jakarta');

  useEffect(() => {
    const fetchRamadhan = async () => {
      setLoading(true);
      try {
        let lat = coords?.lat;
        let lon = coords?.lon;
        let locName = locationName;

        // Fallback: If no context coords, try fetching from DB (saved location)
        if (!lat || !lon) {
          const { getOrCreateUserId } = await import('@/helpers/user');
          const userId = getOrCreateUserId(true);
          if (userId) {
            const res = await fetch(`/api/prayer-times?userId=${userId}`);
            const json = await res.json();
            if (json.ok && json.data?.location) {
              lat = json.data.location.lat;
              lon = json.data.location.lon;
              // Try to get name
              const name = await getLocationName(lat, lon);
              locName = name || 'Lokasi Tersimpan';
              // Sync to context
              updateCoords({ lat, lon });
            }
          }
        }

        // Default to Jakarta if still no coords
        if (!lat || !lon) {
          lat = -6.2088;
          lon = 106.8456;
          locName = 'Jakarta';
        }

        setDisplayLoc(locName);

        // Fetch Gregorian Calendar for Feb & March 2026
        // Ramadhan starts 19 Feb 2026 (Government confirmed)
        // Tune is not needed since we use Gregorian dates and just map Ramadhan days
        const febUrl = `https://api.aladhan.com/v1/calendar/2026/2?latitude=${lat}&longitude=${lon}&method=20`;
        const marUrl = `https://api.aladhan.com/v1/calendar/2026/3?latitude=${lat}&longitude=${lon}&method=20`;

        const [febRes, marRes] = await Promise.all([
          fetch(febUrl),
          fetch(marUrl),
        ]);

        const febJson = await febRes.json();
        const marJson = await marRes.json();

        if (febJson.data && marJson.data) {
          const allDays = [...febJson.data, ...marJson.data];

          // 1 Ramadhan = 19 Feb 2026
          // Find index of 19 Feb
          const startIndex = allDays.findIndex(
            day => day.date.gregorian.date === '19-02-2026'
          );

          if (startIndex !== -1) {
            // Take 30 days from there
            const ramadhanDays = allDays.slice(startIndex, startIndex + 30);

            // Map to our structure
            const mapped = ramadhanDays.map((day, i) => {
              // Overwrite Hijri date manually
              // shallow copy
              const newDay = { ...day };
              newDay.date = {
                ...day.date,
                hijri: {
                  ...day.date.hijri,
                  day: (i + 1).toString(),
                  month: { en: 'Ramadhan', ar: 'رمضان' },
                },
              };
              return newDay;
            });

            setSchedule(mapped);
          } else {
            setError('Jadwal tidak ditemukan untuk tanggal tersebut.');
          }
        } else {
          setError('Gagal memuat jadwal.');
        }
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan koneksi.');
      } finally {
        setLoading(false);
      }
    };

    fetchRamadhan();
  }, [coords?.lat, coords?.lon]); // Only re-run if coords specifically change -> wait, if we updateCoords inside, this triggers loop?
  // updateCoords sets state -> re-render -> useEffect triggers.
  // If we set state to SAME value, React might skip.
  // But new object {lat, lon} !== old object.
  // safe way: check if lat/lon is same as current coords before updating?
  // Or just rely on the fact that if coords exist, we skip the DB fetch block.
  // BUT the dependency is `coords`.
  // If coords exist, we skip DB fetch. We use coords.
  // We do NOT call updateCoords.
  // So no loop.
  // Only loops if we keep finding NO coords, fetch DB, update coords to NULL? (impossible if DB has data)
  // If DB returns data, we updateCoords. Next run, coords exist. Logic skips DB fetch. Loop ends.

  return (
    <div className='flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans py-15 mb-20 pb-30 bg-zinc-50 dark:bg-black font-sans'>
      <header className='text-white p-6 mb-6 backdrop-blur p-4'>
        <h1 className='text-2xl font-bold text-center text-purple-900'>
          Jadwal Ramadhan 1447 H
        </h1>
        <p className='text-center text- text-sm mt-1 text-purple-900'>
          {displayLoc} • Februari - Maret 2026
        </p>
      </header>

      <main className='w-full max-w-3xl mx-auto px-4'>
        {loading && (
          <div className='flex justify-center py-20'>
            <div className='w-8 h-8 border-4 border-purple-300 border-t-purple-700 rounded-full animate-spin'></div>
          </div>
        )}

        {error && (
          <div className='text-center text-red-500 py-10 bg-red-50 rounded-xl'>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className='bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm text-left'>
                <thead className='bg-purple-50 text-purple-900 font-semibold border-b border-purple-100'>
                  <tr>
                    <th className='px-4 py-3 whitespace-nowrap'>Tgl</th>
                    <th className='px-4 py-3 text-center'>Imsak</th>
                    <th className='px-4 py-3 text-center'>Subuh</th>
                    <th className='px-4 py-3 text-center'>Zuhur</th>
                    <th className='px-4 py-3 text-center'>Asar</th>
                    <th className='px-4 py-3 text-center'>Maghrib</th>
                    <th className='px-4 py-3 text-center'>Isya</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {schedule.map((day, idx) => {
                    const t = day.timings;
                    const date = day.date.gregorian;
                    const hijri = day.date.hijri;

                    const isEven = idx % 2 === 0;

                    const cleanFajr = cleanTime(t.Fajr);
                    const imsakVal = getImsakFromFajr(cleanFajr); // manual calc consistent with app

                    return (
                      <tr
                        key={idx}
                        className={isEven ? 'bg-white' : 'bg-zinc-50'}
                      >
                        <td className='px-4 py-3 whitespace-nowrap'>
                          <div className='font-bold text-gray-800'>
                            {hijri.day} Ram
                          </div>
                          <div className='text-xs text-gray-500'>
                            {date.day} {date.month.en.slice(0, 3)}
                          </div>
                        </td>
                        <td className='px-4 py-3 text-center font-medium text-gray-600'>
                          {imsakVal}
                        </td>
                        <td className='px-4 py-3 text-center font-medium text-gray-600'>
                          {cleanFajr}
                        </td>
                        <td className='px-4 py-3 text-center text-gray-500'>
                          {cleanTime(t.Dhuhr)}
                        </td>
                        <td className='px-4 py-3 text-center text-gray-500'>
                          {cleanTime(t.Asr)}
                        </td>
                        <td className='px-4 py-3 text-center font-bold text-purple-700 bg-purple-50/50'>
                          {cleanTime(t.Maghrib)}
                        </td>
                        <td className='px-4 py-3 text-center text-gray-500'>
                          {cleanTime(t.Isha)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <MainNavigation />
    </div>
  );
}
