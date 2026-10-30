import { track } from "@/lib/track";

// Receives the page-view beacon from components/analytics/Tracker.tsx. Everything in the body is checked again here.
// shortcut: no rate limit. Anyone can post fake views; fine while the numbers are only for the owner. Add a limit before they matter.
const PATH = /^\/[A-Za-z0-9_\-/]{0,100}$/;
const VISITOR = /^[A-Za-z0-9-]{8,40}$/;

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
  let body: { p?: unknown; v?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!body || typeof body !== "object") return new Response(null, { status: 400 });

  const { p, v } = body;
  if (typeof p !== "string" || !PATH.test(p) || p.startsWith("/admin")) return new Response(null, { status: 400 });
  if (v !== undefined && (typeof v !== "string" || !VISITOR.test(v))) return new Response(null, { status: 400 });

  await track("view", { path: p, visitor: v });
  return new Response(null, { status: 204 });
}
