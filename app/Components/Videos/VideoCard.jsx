'use client';

import { Play } from 'lucide-react';

export default function VideoCard({
  video,
  isActive = false,
  onPlay,
  showUstadz = false,
  type,
}) {
  return (
    <div className={type === 'grid' ? 'md:w-[23.5%] space-y-2' : 'space-y-2'}>
      {/* VIDEO */}
      <div className='relative aspect-video rounded-2xl overflow-hidden bg-black group'>
        {isActive ? (
          <iframe
            className='w-full h-full'
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
            allow='autoplay; encrypted-media'
            allowFullScreen
          />
        ) : (
          <button
            onClick={onPlay}
            className='relative w-full h-full focus:outline-none'
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
            />

            {/* overlay */}
            <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
              <div className='relative group-hover:scale-110 transition-transform duration-300'>
                {/* glow */}
                <div className='absolute inset-0 rounded-full bg-white/30 blur-md' />

                {/* play */}
                <div className='relative bg-black/60 backdrop-blur-md p-4 rounded-full shadow-xl'>
                  <Play
                    className='w-6 h-6 ml-0.5'
                    fill='white'
                    stroke='white'
                    strokeWidth={0}
                  />
                </div>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* TITLE */}
      <h3 className='text-sm text-black leading-snug line-clamp-2'>
        {video.title}
      </h3>

      {/* USTADZ */}
      {showUstadz && (
        <p className='text-xs text-zinc-500 dark:text-zinc-400 capitalize'>
          {video.ustadz?.replace('-', ' ')}
        </p>
      )}
    </div>
  );
}
