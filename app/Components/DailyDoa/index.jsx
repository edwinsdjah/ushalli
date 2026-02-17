'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { DOA_HARIAN } from '@/data/doa-harian';

export default function DailyDoa() {
  const [doa, setDoa] = useState(null);
  const [loading, setLoading] = useState(true);

  const pickRandomDoa = () => {
    setLoading(true);
    // Simple random pick
    const random = DOA_HARIAN[Math.floor(Math.random() * DOA_HARIAN.length)];

    // Simulate a small delay for better UX (optional)
    setTimeout(() => {
      setDoa(random);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    pickRandomDoa();
  }, []);

  return (
    <div className='w-full bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-base font-semibold text-gray-800 dark:text-gray-200'>
          Doa Harian
        </h2>
        <button
          onClick={pickRandomDoa}
          className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-gray-500'
          aria-label='Acak Doa'
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className='min-h-[180px] flex flex-col justify-center'>
        {loading ? (
          <div className='animate-pulse space-y-3'>
            <div className='h-6 bg-gray-200 rounded w-1/3 mx-auto'></div>
            <div className='h-8 bg-gray-200 rounded w-3/4 mx-auto'></div>
            <div className='h-4 bg-gray-200 rounded w-full'></div>
          </div>
        ) : doa ? (
          <div className='text-center space-y-4 animate-fadeIn'>
            <h3 className='text-lg font-bold text-[var(--color-royal)]'>
              {doa.title}
            </h3>

            <p className='font-amiri text-2xl leading-loose text-gray-800 dark:text-gray-100 dir-rtl'>
              {doa.arabic}
            </p>

            <div className='text-sm space-y-1'>
              <p className='text-[var(--color-royal)]/80 italic'>{doa.latin}</p>
              <p className='text-gray-500 dark:text-gray-400'>
                {doa.translation}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
