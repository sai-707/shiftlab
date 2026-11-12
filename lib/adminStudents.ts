// Types and small pure helpers for the admin Students page. The numbers come from admin_students() and admin_student()
// (supabase/migrations/0010_students.sql). Kept apart from lib/adminStats.ts so the Dashboard, Analytics and Guests code stays as it was.

export const PAGE_SIZE = 50;

export type StudentRow = {
  id: string;
  name: string;
  email: string; // already masked by the database: a***@gmail.com
  joined: string;
  last_sign_in: string | null;
  method: string; // "email", "google", ...
  confirmed: boolean;
  role: string;
  closed: number;
  avg_score: number | null;
  active_alert: string | null;
  active_since: string | null;
  last_seen: string | null;
  source: string | null; // first ?ref= label, e.g. "linkedin-post2"
};

export type StudentsPage = { total: number; rows: StudentRow[] };

export type StudentCase = { alert_id: string; status: "active" | "closed"; score: number | null; started_at: string; closed_at: string | null };

export type Activity = {
  id: number;
  at: string;
  kind: string;
  path: string | null;
  alert: string | null;
  score: number | null;
  reason: string | null;
  ref: string | null;
  guest: boolean; // true = this browser did it before signing in
};

export type StudentDetail = {
  student: Omit<StudentRow, "closed" | "avg_score" | "active_alert" | "active_since" | "last_seen">;
  cases: StudentCase[];
  activity: Activity[];
};

/** "?page=2&q=ravi" for the Students list. Page 1 and an empty search are left out, so the plain list keeps a plain address. */
export function listHref(page: number, q: string): string {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `/admin/students?${s}` : "/admin/students";
}

/** A page number from the address bar: a whole number of at least 1, else 1. */
export function parsePage(raw: string | string[] | undefined): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(n) && n >= 1 && n <= 10_000 ? n : 1;
}

/** The search text from the address bar, trimmed and cut to 60 characters. */
export function parseQuery(raw: string | string[] | undefined): string {
  return (Array.isArray(raw) ? raw[0] : raw ?? "").trim().slice(0, 60);
}

/** How long a case took, "4 min", "1 h 20 min", or "—" when it was not closed. */
export function took(start: string, end: string | null): string {
  if (!end) return "—";
  const min = Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 60000));
  if (min < 1) return "under 1 min";
  if (min < 60) return `${min} min`;
  if (min < 60 * 24) return `${Math.floor(min / 60)} h ${min % 60} min`;
  return `${Math.floor(min / 1440)} d`;
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
