// A "next" address from a link is only followed if it stays on this site. Checked the way the browser reads it:
// tabs and line breaks are dropped by URL parsing, so "/\t/evil.com" would otherwise turn into "//evil.com".
export function safeNext(next: string | null | undefined, origin: string, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/")) return fallback;
  try {
    const url = new URL(next, origin);
    return url.origin === origin ? url.pathname + url.search + url.hash : fallback;
  } catch {
    return fallback;
  }
}
