"use client";

import React, { useState, useEffect } from "react";
import MainNavigation from "../Components/MainNavigation";
import VideoAvatar from "../Components/Videos/VideoAvatar";
import LoadingSpinner from "../Components/LoadingSpinner";
import VideoCard from "../Components/Videos/VideoCard";

const UstadzPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState(null);

  async function loadVideos(slug) {
    setLoading(true);
    setActiveVideoId(null);

    try {
      const res = await fetch(`/api/ustadz/videos?ustadz=${slug}`);
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (err) {
      console.error("Gagal fetch video", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideos("adi-hidayat");
  }, []);

  return (
    <div className="p-4 space-y-4 mt-15 mb-15 relative">
      <VideoAvatar loadVideos={loadVideos} />

      {/* VIDEO LIST */}
      <div
        className={`space-y-5 transition
          ${loading ? "blur-sm pointer-events-none" : ""}
        `}
      >
        {videos.map(video => (
          <VideoCard
            key={video.videoId}
            video={video}
            isActive={activeVideoId === video.videoId}
            onPlay={() => setActiveVideoId(video.videoId)}
          />
        ))}
      </div>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <LoadingSpinner />
        </div>
      )}

      <MainNavigation />
    </div>
  );
};

export default UstadzPage;
