// SERVER ONLY. Reads the admin Roadmap page through the admin-only database function, which checks the role itself.
import { createClient } from "@/lib/supabase/server";
import type { RoadmapStats } from "@/lib/adminRoadmap";
import type { Result } from "@/lib/adminStudentsData";

export async function getRoadmapStats(): Promise<Result<RoadmapStats>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_roadmap");
  if (error || !data) {
    console.error("[admin] roadmap failed:", error?.code); // code only
    return { ok: false, code: error?.code ?? "empty" };
  }
  return { ok: true, data: data as RoadmapStats };
}
