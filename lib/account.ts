import { cache } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type Account = {
  email: string;
  name: string;
  avatar: string;
  role: "student" | "admin";
  username: string;
  github: string;
  /** Signed in, but has not picked a username yet: the site sends them to /welcome first. */
  needsSetup: boolean;
};

/** The signed-in person and their profile row, or null for a guest. Runs once per request however many components ask. */
export const getAccount = cache(async (): Promise<Account | null> => {
  await connection(); // Supabase reads the clock; see lib/supabase/server.ts. Call this only inside <Suspense>.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;

  // The profile row is made by a database trigger at sign-up. If it is missing, show the page anyway.
  const { data: row, error } = await supabase.from("profiles").select("display_name, avatar, role, username, github").eq("id", claims.sub).maybeSingle();
  if (error) console.error("[account] could not read profile:", error.code); // code only, never the email
  return {
    email: claims.email ?? "",
    name: row?.display_name ?? "",
    avatar: row?.avatar ?? "",
    role: row?.role === "admin" ? "admin" : "student",
    username: row?.username ?? "",
    github: row?.github ?? "",
    // Only when the row was read fine and has no username. If the read fails (say 0004 was not run yet), nobody is locked into /welcome.
    needsSetup: !error && !!row && !row.username,
  };
});
