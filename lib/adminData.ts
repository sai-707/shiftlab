// SERVER ONLY. Reads the admin dashboard numbers through the admin-only database functions.
// The functions check the role themselves, so a non-admin gets "permission denied" even if the page gate were removed.
import { createClient } from "@/lib/supabase/server";
import type { Overview, RecentUser, Range } from "@/lib/adminStats";

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
