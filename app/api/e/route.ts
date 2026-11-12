import { cleanRef } from "@/lib/ref";
import { track } from "@/lib/track";

// Receives the page-view beacon from components/analytics/Tracker.tsx and the report beacons from lib/reportEvents.ts. Everything in the body is checked again here.
// shortcut: no rate limit. Anyone can post fake views; fine while the numbers are only for the owner. Add a limit before they matter.
const PATH = /^\/[A-Za-z0-9_\-/]{0,100}$/;
const VISITOR = /^[A-Za-z0-9-]{8,40}$/;
const ALERT = /^SL-\d{4}$/;
const REASONS = ["decision", "empty", "quality"];

export async function POST(req: Request) {
  // Only our own pages may report (browsers always send Origin on a POST from another site).
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.get("host")) return new Response(null, { status: 403 });
    } catch {
      return new Response(null, { status: 403 });
    }
  }

  const raw = await req.text();
  if (raw.length > 400) return new Response(null, { status: 413 });
  let body: { p?: unknown; v?: unknown; k?: unknown; a?: unknown; r?: unknown; s?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!body || typeof body !== "object") return new Response(null, { status: 400 });

  const { p, v, k, a, r } = body;
  if (v !== undefined && (typeof v !== "string" || !VISITOR.test(v))) return new Response(null, { status: 400 });

  // Report beacons: {k: "started" | "blocked", a: alert id, r: reason (blocked only)}.
  if (k !== undefined) {
    if ((k !== "started" && k !== "blocked") || typeof a !== "string" || !ALERT.test(a)) return new Response(null, { status: 400 });
    if (k === "blocked" && (typeof r !== "string" || !REASONS.includes(r))) return new Response(null, { status: 400 });
    await track(k === "started" ? "report_started" : "report_blocked", {
      path: `/alerts/${a}`,
      visitor: v,
      props: k === "started" ? { alert: a } : { alert: a, reason: r as string },
    });
    return new Response(null, { status: 204 });
  }

  if (typeof p !== "string" || !PATH.test(p) || p.startsWith("/admin")) return new Response(null, { status: 400 });

  // s = the ?ref= label of the link that brought the visit. A bad one is ignored, so the view still counts.
  const ref = cleanRef(body.s);
  await track("view", { path: p, visitor: v, props: ref ? { ref } : {} });
  return new Response(null, { status: 204 });
}
