'use client';

import VideoCardSkeleton from './VideoCardSkeleton';

export default function RandomVideoSliderSkeleton({ count = 5 }) {
  return (
    <section className='relative '>
      <div className='flex flex-row gap-4 overflow-x-hidden pr-16'>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`min-w-[85vw] ${index === 0 ? 'ml-4' : ''}`}
          >
            <VideoCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}
