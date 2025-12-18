"use client";

import React, { useState, useEffect } from "react";
import MainNavigation from "../Components/MainNavigation";
import VideoAvatar from "../Components/Videos/VideoAvatar";
import LoadingSpinner from "../Components/LoadingSpinner";

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
      {/* === PILIH USTADZ === */}
      <VideoAvatar loadVideos={loadVideos} />

      {/* === VIDEO CONTAINER === */}
      <div
        className={`relative space-y-4 transition
          ${loading ? "blur-sm pointer-events-none" : ""}
        `}
      >
        {videos.map(video => (
          <div key={video.videoId} className="space-y-2">
            {activeVideoId === video.videoId ? (
              <iframe
                className="w-full aspect-video rounded-xl"
                src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div
                className="relative cursor-pointer"
                onClick={() => setActiveVideoId(video.videoId)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full aspect-video object-cover rounded-xl"
                />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 text-white p-4 rounded-full">
                    ▶
                  </div>
                </div>
              </div>
            )}

            <h3 className="text-sm font-semibold">
              {video.title}
            </h3>
          </div>
        ))}
      </div>

      {/* === LOADING OVERLAY === */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <LoadingSpinner />
        </div>
      )}

      <MainNavigation />
    </div>
  );
};

export default UstadzPage;
