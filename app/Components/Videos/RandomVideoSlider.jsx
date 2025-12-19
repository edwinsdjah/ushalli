'use client';
import { useState } from 'react';
import VideoCard from './VideoCard';

export default function RandomVideoSlider({ videos }) {
  const [activeVideoId, setActiveVideoId] = useState(null);
  if (!videos || videos.length === 0) return null;

  return (
    <section className='relative -mx-4'>
      <div
        className='
          flex gap-4 overflow-x-auto
          mx-4
          snap-x snap-mandatory
          no-scrollbar
          pr-16
        '
      >
        {videos.map((video, index) => (
          <div
            key={video.videoId}
            className={`
              min-w-[85vw] snap-start
              ${index === 0 ? 'ml-4' : ''}
            `}
          >
            <VideoCard
              video={video}
              showUstadz
              isActive={activeVideoId === video.videoId}
              onPlay={() => setActiveVideoId(video.videoId)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
