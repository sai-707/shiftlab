// SERVER ONLY. Reads the admin dashboard numbers through the admin-only database functions.
// The functions check the role themselves, so a non-admin gets "permission denied" even if the page gate were removed.
import { createClient } from "@/lib/supabase/server";
import type { GuestLogRow, Guests, Overview, RecentUser, Range } from "@/lib/adminStats";

// The clock for "3 d ago". A page component may not call Date.now() itself (the react-hooks/purity lint rule), so it is read here;
// the page runs once per request, which is all that label needs.
export const requestTime = () => Date.now();

export type OverviewResult = { ok: true; data: Overview } | { ok: false; code: string };

export async function getOverview(days: Range): Promise<OverviewResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_overview", { days });
  if (error || !data) {
    console.error("[admin] overview failed:", error?.code); // code only
    return { ok: false, code: error?.code ?? "empty" };
  }
  return { ok: true, data: data as Overview };
}

export async function getRecentUsers(n = 10): Promise<RecentUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_recent_users", { n });
  if (error) {
    console.error("[admin] recent users failed:", error.code);
    return [];
  }
  return (data ?? []) as RecentUser[];
}

export type GuestsResult = { ok: true; data: Guests; log: GuestLogRow[] } | { ok: false; code: string };

export async function getGuests(days: Range, logSize = 100): Promise<GuestsResult> {
  const supabase = await createClient();
  const [g, l] = await Promise.all([supabase.rpc("admin_guests", { days }), supabase.rpc("admin_guest_log", { n: logSize })]);
  const error = g.error ?? l.error;
  if (error || !g.data) {
    console.error("[admin] guests failed:", error?.code); // code only
    return { ok: false, code: error?.code ?? "empty" };
  }
  return { ok: true, data: g.data as Guests, log: (l.data ?? []) as GuestLogRow[] };
}
