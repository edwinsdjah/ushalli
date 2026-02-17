'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Pause, BookOpen } from 'lucide-react';

export default function SurahDetail() {
  const params = useParams();
  const router = useRouter();
  const [surah, setSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!params.nomor) return;

    const fetchSurah = async () => {
      try {
        const res = await fetch(
          `https://equran.id/api/v2/surat/${params.nomor}`
        );
        const json = await res.json();
        if (json.code === 200) {
          setSurah(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch surah:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurah();
  }, [params.nomor]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className='min-h-screen bg-zinc-50 dark:bg-black font-sans'>
      {/* HEADER */}
      <header className='sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800'>
        <div className='max-w-3xl mx-auto px-4 py-4 flex items-center justify-between'>
          <button
            onClick={() => router.back()}
            className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition'
          >
            <ArrowLeft className='w-6 h-6 text-gray-700 dark:text-gray-300' />
          </button>

          <div className='text-center'>
            {loading ? (
              <div className='h-6 w-24 bg-gray-200 rounded animate-pulse'></div>
            ) : (
              <>
                <h1 className='text-lg font-bold text-[var(--color-royal)]'>
                  {surah?.namaLatin}
                </h1>
                <p className='text-xs text-gray-500'>
                  {surah?.arti} • {surah?.jumlahAyat} Ayat
                </p>
              </>
            )}
          </div>

          <button
            onClick={toggleAudio}
            className='
              flex items-center justify-center w-10 h-10 rounded-full
              bg-[var(--color-royal-accent)] text-purple-900
              hover:bg-yellow-500 transition shadow-sm
            '
          >
            {isPlaying ? (
              <Pause className='w-5 h-5 fill-current' />
            ) : (
              <Play className='w-5 h-5 fill-current ml-1' />
            )}
          </button>
        </div>
      </header>

      {/* AUDIO ELEMENT */}
      {surah?.audioFull?.['05'] && (
        <audio
          ref={audioRef}
          src={surah.audioFull['05']}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* CONTENT */}
      <main className='max-w-3xl mx-auto px-4 py-8 pb-32'>
        {loading ? (
          <div className='space-y-6'>
            {[1, 2, 3].map(i => (
              <div key={i} className='animate-pulse space-y-3'>
                <div className='h-4 bg-gray-200 rounded w-full'></div>
                <div className='h-4 bg-gray-200 rounded w-3/4'></div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex flex-col gap-6'>
            {/* BISMILLAH */}
            {surah?.nomor !== 1 && surah?.nomor !== 9 && (
              <div className='text-center py-6'>
                <p className='font-amiri text-3xl leading-loose text-gray-800 dark:text-gray-200'>
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
                </p>
              </div>
            )}

            {/* VERSES */}
            {surah?.ayat?.map(ayat => (
              <div
                key={ayat.nomorAyat}
                className='
                  bg-white dark:bg-zinc-900 rounded-3xl p-6
                  border border-gray-100 dark:border-zinc-800
                  hover:shadow-md transition-shadow
                '
              >
                {/* HEADER AYAT */}
                <div className='flex justify-between items-center mb-6'>
                  <span
                    className='
                    flex items-center justify-center w-8 h-8
                    rounded-full bg-[var(--color-royal)]/10 text-[var(--color-royal)]
                    text-sm font-bold
                  '
                  >
                    {ayat.nomorAyat}
                  </span>
                  <div className='flex gap-2 text-gray-400'>
                    {/* Actions like copy/share could go here */}
                  </div>
                </div>

                {/* ARABIC */}
                <p className='font-amiri text-3xl text-right leading-[2.5] text-gray-900 dark:text-gray-100 dir-rtl mb-4'>
                  {ayat.teksArab}
                </p>

                {/* LATIN */}
                <p className='text-sm text-[var(--color-royal)]/80 italic mb-2'>
                  {ayat.teksLatin}
                </p>

                {/* TRANSLATION */}
                <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
                  {ayat.teksIndonesia}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* NAVIGATION BAR (To keep context) */}
      {/* <MainNavigation /> (Optional mostly for detail page) */}
    </div>
  );
}
