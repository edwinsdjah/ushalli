let cachedVideos = null;

export function getCachedRandomVideos() {
  return cachedVideos;
}

export function setCachedRandomVideos(videos) {
  cachedVideos = videos;
}
