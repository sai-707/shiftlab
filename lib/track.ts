// SERVER ONLY. Adds one row to the events table (see supabase/migrations/0003_analytics.sql).
// Never throws: counting a visit must never break the page or lose a student's case.
import { createClient } from "@/lib/supabase/server";

type Kind = "view" | "case_closed";
type Props = Record<string, string | number | boolean>;

// shortcut: callers wait for this write (one extra round trip, usually under 100 ms). Move it into next/server's after() if submit ever feels slow.
export async function track(kind: Kind, e: { path?: string; visitor?: string; props?: Props }): Promise<void> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    // No .select() on purpose: nobody may read the table back, only the admin functions can.
    const { error } = await supabase.from("events").insert({
      kind,
      user_id: data?.claims?.sub ?? null,
      visitor: e.visitor ?? null,
      path: e.path ?? null,
      props: e.props ?? {},
    });
    if (error) console.error("[track]", error.code); // code only, never the content
  } catch {
    console.error("[track] failed");
  }
}
