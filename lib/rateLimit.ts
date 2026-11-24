// Best-effort limit for the visit counter (app/api/e/route.ts): one source may send only so many events per window.
// It lives in the memory of one running server instance, so it slows a flood from one address down; it is not a hard wall.
// The hard limits are in the database (migration 0008) and, if you add it, a rate-limiting rule in the Cloudflare dashboard.
export function createLimiter(max: number, windowMs: number, maxKeys = 5000) {
  const hits = new Map<string, { n: number; reset: number }>();
  return function allow(key: string, now: number = Date.now()): boolean {
    const e = hits.get(key);
    if (!e || now >= e.reset) {
      if (hits.size >= maxKeys) {
        for (const [k, v] of hits) if (now >= v.reset) hits.delete(k);
        if (hits.size >= maxKeys) hits.clear(); // still full: start again rather than grow without bound
      }
      hits.set(key, { n: 1, reset: now + windowMs });
      return true;
    }
    e.n += 1;
    return e.n <= max;
  };
}
