export async function fetchLatestVideosByChannel(channelId) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=5&key=${process.env.YOUTUBE_API_KEY}`;

  const res = await fetch(url);

  // 🔴 HANDLE RESPONSE ERROR
  if (!res.ok) {
    const text = await res.text();
    console.error("YouTube API error:", res.status, text);
    throw new Error("YouTube API failed");
  }

  const data = await res.json();
  console.log(data);

  if (!data.items) {
    console.error("Invalid YouTube response:", data);
    return [];
  }

  return data.items.map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    publishedAt: item.snippet.publishedAt,
  }));
}
