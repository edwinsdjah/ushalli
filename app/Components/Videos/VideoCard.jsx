"use client";

import { Play } from "lucide-react";

export default function VideoCard({ video, showUstadz = false }) {
  return (
    <div className="space-y-1.5">
      {/* thumbnail */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black group cursor-pointer">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="relative group-hover:scale-110 transition-transform duration-300">
            {/* glow */}
            <div className="absolute inset-0 rounded-full bg-white/30 blur-md" />

            {/* button */}
            <div className="relative bg-black/60 backdrop-blur-md p-4 rounded-full shadow-xl">
              <Play
                className="w-6 h-6 ml-0.5"
                fill="white"
                stroke="white"
                strokeWidth={0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* title */}
      <h3 className="text-sm font-semibold leading-snug line-clamp-2">
        {video.title}
      </h3>

      {/* ustadz name */}
      {showUstadz && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
          Ustadz {video.ustadz?.replace("-", " ")}
        </p>
      )}
    </div>
  );
}
