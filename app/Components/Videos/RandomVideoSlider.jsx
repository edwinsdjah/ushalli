"use client";

export default function RandomVideoSlider({ videos }) {
  if (!videos.length) return null;

  return (
    <section className="relative -mx-4">
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pr-16">
        {videos.map((video, index) => (
          <div
            key={video.videoId}
            className={`min-w-[85vw] snap-start
              ${index === 0 ? "ml-4" : ""}
            `}
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />

              {/* play overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="bg-black/70 text-white p-4 rounded-full">
                  ▶
                </div>
              </div>
            </div>

            <h3 className="mt-2 text-sm font-semibold line-clamp-2">
              {video.title}
            </h3>

            <p className="text-xs text-gray-500 mt-1 capitalize">
              {video.ustadz.replace("-", " ")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
