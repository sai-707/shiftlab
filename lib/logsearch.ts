import type { LogEvent, LogSource } from "@/content/logs";

export const FIELDS = ["source", "host", "user", "src", "dst", "event", "time"] as const;
type Field = (typeof FIELDS)[number];

type Token = { field: Field | null; value: string; negate: boolean };

/** Splits a query into tokens. Supports "quoted phrases", field:value, and a leading - to exclude. */
export function parseQuery(query: string): Token[] {
  const tokens: Token[] = [];
  for (const m of query.matchAll(/(-?)(?:(\w+):)?(?:"([^"]+)"|(\S+))/g)) {
    const negate = m[1] === "-";
    const key = m[2]?.toLowerCase();
    const value = (m[3] ?? m[4] ?? "").toLowerCase();
    if (!value) continue;
    const field = key && (FIELDS as readonly string[]).includes(key) ? (key as Field) : null;
    // an unknown prefix such as "foo:bar" is treated as plain text
    tokens.push({ field, value: field || !key ? value : `${key}:${value}`, negate });
  }
  return tokens;
}

export function searchLogs(events: LogEvent[], query: string, source: LogSource | "all"): LogEvent[] {
  const tokens = parseQuery(query);
  return events.filter((ev) => {
    if (source !== "all" && ev.source !== source) return false;
    return tokens.every((t) => {
      const hay = t.field
        ? t.field === "time"
          ? ev.time
          : String(ev[t.field]).toLowerCase()
        : `${ev.time} ${ev.source} ${ev.host} ${ev.user} ${ev.src} ${ev.dst} ${ev.event} ${ev.detail}`.toLowerCase();
      const hit = t.field === "time" ? hay.startsWith(t.value) : hay.includes(t.value);
      return t.negate ? !hit : hit;
    });
  });
}
