"use server";

import { redirect } from "next/navigation";
import { cleanDetails } from "@/lib/profileRules";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { error: string };
type Patch = { display_name?: string; avatar?: string; username?: string; github?: string };

// Writes already-cleaned columns to the signed-in person's own profile row.
// Row-level security and the column grant in 0004_profile_identity.sql let this touch only the caller's own name, photo, username and GitHub.
// .select() returns the changed rows, so a missing row (or a missing migration) shows up as an error instead of a silent no-op.
async function write(patch: Patch): Promise<Result> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { error: "You are signed out. Sign in again to save." };

  const { data: rows, error } = await supabase.from("profiles").update(patch).eq("id", data.claims.sub).select("id");
  // shortcut: a taken username is only found out here, on save; add a live "is it free?" check if people trip over it.
  if (error?.code === "23505") return { error: "That username is already taken. Try another." };
  if (error || !rows?.length) {
    console.error("[profile] save failed:", error?.code ?? "no row"); // code only
    return { error: "Could not save to your account. Try again in a moment." };
  }
  return { ok: true };
}

/** Saves the signed-in person's name, photo, username and/or GitHub. Send only the fields that changed. */
export async function saveProfile(input: { name?: string; avatar?: string; username?: string; github?: string }): Promise<Result> {
  const cleaned = cleanDetails(input);
  if ("error" in cleaned) return cleaned;
  return write(cleaned.patch);
}

/** The welcome screen: name and username are required, photo and GitHub are optional. On success it opens the dashboard. */
export async function completeProfile(input: { name: string; username: string; github?: string; avatar?: string }): Promise<{ error: string }> {
  const cleaned = cleanDetails({ name: input.name, username: input.username, github: input.github ?? "", ...(input.avatar ? { avatar: input.avatar } : {}) });
  if ("error" in cleaned) return cleaned;
  if (Array.from(cleaned.patch.display_name ?? "").length < 2) return { error: "Enter your full name (at least 2 characters)." };

  const saved = await write(cleaned.patch);
  if ("error" in saved) return saved;
  redirect("/dashboard"); // outside any try/catch on purpose: redirect works by throwing
}
