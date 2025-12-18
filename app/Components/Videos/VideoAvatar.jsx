"use client";

import React, { useState } from "react";
import { USTADZ_LIST } from "@/data/ustadz";

const VideoAvatar = ({ loadVideos }) => {
  const [active, setActive] = useState("adi-hidayat");

  const handleClick = slug => {
    setActive(slug);
    loadVideos(slug);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
      {USTADZ_LIST.map(ustadz => (
        <button
          key={ustadz.slug}
          onClick={() => handleClick(ustadz.slug)}
          className="flex flex-col items-center min-w-[72px] focus:outline-none"
        >
          {/* AVATAR */}
          <div
            className={`w-16 h-16 rounded-full overflow-hidden border-2 transition
              ${
                active === ustadz.slug
                  ? "border-purple-800"
                  : "border-transparent"
              }
            `}
          >
            <img
              src={ustadz.avatar}
              alt={ustadz.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* NAME */}
          <span
            className={`mt-2 text-xs text-center leading-tight
              ${
                active === ustadz.slug
                  ? "font-semibold text-purple-800"
                  : "text-gray-500"
              }
            `}
          >
            {ustadz.name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default VideoAvatar;
