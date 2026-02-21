'use client';

import React, { useState, useEffect } from 'react';
import MainNavigation from '../Components/MainNavigation';
import VideoAvatar from '../Components/Videos/VideoAvatar';
import VideoCard from '../Components/Videos/VideoCard';
import VideoCardSkeleton from '../Components/Videos/VideoCardSkeleton';

const SKELETON_COUNT = 5;

const UstadzPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState(null);

  async function loadVideos(slug) {
    setLoading(true);
    setActiveVideoId(null);

    try {
      const res = await fetch(`/api/ustadz/videos?ustadz=${slug}`);
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (err) {
      console.error('Gagal fetch video', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideos('adi-hidayat');
  }, []);

  return (
    <div className='flex min-h-screen flex-col py-15 pb-30 mb-15 px-4 bg-zinc-50 dark:bg-black font-sans'>
      {/* === PILIH USTADZ === */}
      <VideoAvatar loadVideos={loadVideos} />

      {/* === VIDEO LIST / SKELETON === */}
      <div className='space-y-5 md:flex md:flex-row gap-3 md:flex-wrap'>
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))
          : videos.map(video => (
              <VideoCard
                key={video.videoId}
                video={video}
                isActive={activeVideoId === video.videoId}
                onPlay={() => setActiveVideoId(video.videoId)}
                type='grid'
              />
            ))}
      </div>

      <MainNavigation />
    </div>
  );
};

export default UstadzPage;
