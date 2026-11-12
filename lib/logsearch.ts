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

/** The hosts, addresses and people named in a search: "src:203.0.113.58 event:failed" -> ["203.0.113.58"].
 *  An identifier carries a dot, a hyphen or a digit; plain words like "failed" or "post" are in too many searches to mean anything. */
const entities = (q: string): string[] =>
  q
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/^-/, "").split(":").pop() ?? "")
    .filter((t) => t.length > 3 && /[.\-\d]/.test(t));

/** Ids of the practice questions that are about the same host, address or person as this alert's ready-made searches.
 *  Empty when the alert has none, which is why the page keeps showing the rest of the questions underneath. */
export function questionsForAlert(alertId: string | null, links: { q: string }[], questions: { id: string; tryQuery: string }[]): string[] {
  if (!alertId) return [];
  const wanted = new Set(links.flatMap((l) => entities(l.q)));
  return questions.filter((q) => entities(q.tryQuery).some((v) => wanted.has(v))).map((q) => q.id);
}
