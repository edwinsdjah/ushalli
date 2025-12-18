import connect from "@/lib/mongoose";
import UstadzVideo from "@/models/UstadzVideo";

export async function GET() {
  await connect();

  // 🔥 ambil SEMUA dokumen
  const docs = await UstadzVideo.find();

  if (!docs.length) {
    return Response.json({ videos: [] });
  }

  // flatten semua video
  const allVideos = docs.flatMap((doc) =>
    doc.videos.map((v) => ({
      videoId: v.videoId,
      title: v.title,
      thumbnail: v.thumbnail,
      publishedAt: v.publishedAt,
      ustadz: doc.ustadzSlug,
    }))
  );

  if (!allVideos.length) {
    return Response.json({ videos: [] });
  }

  // 🔥 RANDOM BEBAS
  const shuffled = shuffle(allVideos);

  return Response.json({
    videos: shuffled.slice(0, 5),
  });
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}
