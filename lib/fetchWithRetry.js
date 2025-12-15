export async function fetchWithRetry(
  url,
  { retries = 3, timeout = 8000 } = {}
) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(id);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 500));
    }
  }
}
