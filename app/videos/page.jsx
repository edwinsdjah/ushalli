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
    <div className='p-4 space-y-5 mt-15 mb-15'>
      {/* === PILIH USTADZ === */}
      <VideoAvatar loadVideos={loadVideos} />

      {/* === VIDEO LIST / SKELETON === */}
      <div className='space-y-5'>
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))
          : videos.map(video => (
              <VideoCard
                key={video.videoId}
                video={video}
                showUstadz
                isActive={activeVideoId === video.videoId}
                onPlay={() => setActiveVideoId(video.videoId)}
              />
            ))}
      </div>

      <MainNavigation />
    </div>
  );
};

export default UstadzPage;
