// Types and small pure helpers for the admin dashboard. No server code here, so the same file can be tested in a browser.

export type Kpis = { signups: number; visitors: number; active: number; cases: number; avg_score: number | null };

/** What admin_overview() returns (supabase/migrations/0003_analytics.sql). */
export type Overview = {
  days: number;
  from: string;
  to: string;
  tracking_since: string | null;
  accounts_total: number;
  cur: Kpis;
  prev: Kpis;
  series: { day: string; visitors: number; signups: number; cases: number; active: number }[];
  funnel: { accounts: number; opened: number; closed1: number; closed3: number; returned: number };
  alerts: { alert: string; attempts: number; avg_score: number; verdict_pct: number }[];
  sections: { section: string; views: number; visitors: number }[];
};

/** One row of admin_recent_users(). */
export type RecentUser = { name: string; email: string; joined: string; role: string; cases: number; last_seen: string | null };

/** What admin_guests() returns (supabase/migrations/0007_admin_guests.sql). A guest is a browser with no signed-in account. */
export type Guests = {
  days: number;
  from: string;
  to: string;
  tracking_since: string | null;
  guests_total: number;
  cur: {
    visitors: number; views: number; opened: number; returned: number; signed_in_later: number; cases: number; avg_score: number | null;
    signup_page: number; new_accounts: number; unconfirmed: number;
  };
  prev: { visitors: number; views: number; opened: number; cases: number; signup_page: number; new_accounts: number };
  series: { day: string; visitors: number; cases: number; signups: number }[];
  sections: { section: string; views: number; visitors: number }[];
};

/** One row of admin_guest_log(). `guest` is the first 6 characters of the browser id; closed cases carry none. */
export type GuestLogRow = {
  id: number;
  at: string;
  kind: "view" | "case_closed";
  guest: string | null;
  path: string | null;
  score: number | null;
  alert: string | null;
  verdict_ok: boolean | null;
  escalate_ok: boolean | null;
};

export const RANGES = [7, 30, 90] as const;
export type Range = (typeof RANGES)[number];

export const METRICS = {
  visitors: { label: "Visitors", what: "Unique browsers that opened ShiftLab" },
  signups: { label: "New accounts", what: "Students who created an account" },
  active: { label: "Active students", what: "Signed-in students who used the site" },
  cases: { label: "Cases closed", what: "Reports submitted for scoring" },
} as const;
export type Metric = keyof typeof METRICS;

// The address bar is untrusted, so anything unexpected falls back to the default.
export const parseRange = (v: unknown): Range => RANGES.find((r) => String(r) === v) ?? 30;
export const parseMetric = (v: unknown): Metric => (typeof v === "string" && Object.hasOwn(METRICS, v) ? (v as Metric) : "visitors");

export type Delta = { dir: "up" | "down" | "flat" | "none"; text: string };

/** Percentage change against the window before. "New" when there was nothing before. */
export function pctDelta(cur: number, prev: number): Delta {
  if (cur === 0 && prev === 0) return { dir: "none", text: "—" };
  if (prev === 0) return { dir: "up", text: "New" };
  const p = ((cur - prev) / prev) * 100;
  if (Math.abs(p) < 0.05) return { dir: "flat", text: "0%" };
  const a = Math.abs(p);
  // a jump from 2 to 200 reads as "999%+", not a number nobody can take in
  return { dir: p > 0 ? "up" : "down", text: a >= 1000 ? "999%+" : `${a >= 100 ? Math.round(a) : a.toFixed(1)}%` };
}

/** Difference in points, for rates and scores. */
export function ptsDelta(cur: number | null, prev: number | null): Delta {
  if (cur === null || prev === null) return { dir: "none", text: "—" };
  const d = cur - prev;
  if (Math.abs(d) < 0.05) return { dir: "flat", text: "0 pts" };
  return { dir: d > 0 ? "up" : "down", text: `${Math.abs(d).toFixed(1)} pts` };
}

export const num = (n: number) => n.toLocaleString("en-IN");

/** "2026-10-28" -> "28 Oct". */
export const shortDay = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

/** "28 Oct, 2:32 pm" in India time, for the guest log. */
export const clockTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

/** "5 min ago", "3 h ago", "2 d ago", or a date once it is older than two weeks. */
export function ago(iso: string | null, now: number): string {
  if (!iso) return "never";
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 14) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

const SECTION: Record<string, string> = {
  "": "Landing page", signup: "Sign-up page", login: "Log-in page", "reset-password": "Password reset", dashboard: "Dashboard", queue: "Alert queue",
  alerts: "Alert pages", mailbox: "Mailbox", comms: "Comms", logs: "Log search", lookup: "Intel check", tools: "Tools", "ai-check": "AI check",
  shift: "Shift", sprint: "Sprint", playbooks: "Playbooks", glossary: "Glossary", handover: "Handover", reports: "Reports", profile: "Profile",
  practice: "Practice hub", start: "Start here", welcome: "Profile setup",
};
// Object.hasOwn: a path segment such as "constructor" must not pick up something from Object.prototype.
export const sectionLabel = (s: string) => (Object.hasOwn(SECTION, s) ? SECTION[s] : s);
