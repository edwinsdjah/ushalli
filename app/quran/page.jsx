'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import MainNavigation from '../Components/MainNavigation';
import Image from 'next/image';

export default function QuranPage() {
  const [surahs, setSurahs] = useState([]);
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const res = await fetch('https://equran.id/api/v2/surat');
        const json = await res.json();
        if (json.code === 200) {
          setSurahs(json.data);
          setFilteredSurahs(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch surahs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = surahs.filter(
      s =>
        s.namaLatin.toLowerCase().includes(term) ||
        s.arti.toLowerCase().includes(term)
    );
    setFilteredSurahs(filtered);
  }, [search, surahs]);

  return (
    <div className='absolute top-0 z-[1000] w-full'>
      <div className='backdrop-blur p-4 shadow-sm sticky'>
        {/* ADDRESS */}
        <Link href='/' className='flex items-center'>
          <Image
            src='/logo.png' // ganti sesuai file logo kamu
            alt='Ushalli Logo'
            width={85}
            height={85}
            priority
          />
        </Link>
        <header className='py-6 sticky top-0 z-10 dark:bg-black/80 backdrop-blur-md'>
          <p className='text-gray-500 text-sm mb-4'>
            Baca dan dengarkan ayat suci Al-Quran
          </p>

          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              placeholder='Cari surah...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='
              w-full pl-10 pr-4 py-3 rounded-2xl
              bg-white dark:bg-zinc-900
              border border-gray-100 dark:border-zinc-800
              focus:ring-2 focus:ring-[var(--color-royal)] focus:border-transparent
              outline-none transition-all text-[var(--color-royal)]
            '
            />
          </div>
        </header>
      </div>

      <main className='px-2 flex flex-col gap-3'>
        {loading ? (
          <div className='flex justify-center py-20'>
            <div className='w-8 h-8 border-4 border-purple-300 border-t-[var(--color-royal)] rounded-full animate-spin'></div>
          </div>
        ) : (
          filteredSurahs.map(surah => (
            <Link
              key={surah.nomor}
              href={`/quran/${surah.nomor}`}
              className='
                group block bg-white dark:bg-zinc-900
                rounded-2xl p-4 border border-gray-100 dark:border-zinc-800
                hover:border-[var(--color-royal-accent)] hover:shadow-sm
                transition-all duration-300
              '
            >
              <div className='flex items-center gap-4'>
                <div
                  className='
                  flex items-center justify-center
                  w-10 h-10 rounded-full
                  bg-[var(--color-royal)]/10 text-[var(--color-royal)]
                  font-bold text-sm
                  group-hover:bg-[var(--color-royal)] group-hover:text-white
                  transition-colors
                '
                >
                  {surah.nomor}
                </div>
                <div className='flex-1'>
                  <h3 className='font-bold text-gray-900 dark:text-gray-100'>
                    {surah.namaLatin}
                  </h3>
                  <p className='text-xs text-gray-500'>
                    {surah.arti} • {surah.jumlahAyat} Ayat
                  </p>
                </div>
                <div className='text-right'>
                  <span className='font-amiri text-xl text-[var(--color-royal)] font-bold'>
                    {surah.nama}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </main>

      <MainNavigation />
    </div>
  );
}
