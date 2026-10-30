// The rules for a person's name, photo, username and GitHub link. Plain functions, used by the browser (to guide typing)
// and again by the server actions, because the browser cannot be trusted.
// Keep the limits in step with supabase/migrations/0002_profile_details.sql and 0004_profile_identity.sql.

export const NAME_MAX = 30;
export const AVATAR_MAX = 100_000; // characters of data URL; a normal 160px JPEG is about a tenth of this
export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
export const GITHUB_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/; // GitHub's own rule: letters, digits, single hyphens, 39 at most
const RESERVED = new Set(["admin", "administrator", "root", "shiftlab", "support", "system", "owner", "moderator"]); // same list as the database

/** Only our own resized JPEGs are ever shown, so a hand-edited value cannot inject anything. */
export const validAvatar = (v: string) => v.length <= AVATAR_MAX && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(v);

/** "Asha Kumar" -> "AK", and "?" while there is no name yet. */
export const initialsOf = (name: string) =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => Array.from(w)[0].toUpperCase()).join("") || "?";

/** What a username field keeps while the person types: lowercase letters, digits and underscores, 20 at most. */
export const typedUsername = (v: string) => v.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);

/** A plain-English reason the username is not allowed, or null when it is fine. */
export function usernameProblem(v: string): string | null {
  if (!USERNAME_RE.test(v)) return "Use 3 to 20 lowercase letters, numbers or underscores.";
  if (RESERVED.has(v)) return "That username is not available.";
  return null;
}

/** "https://github.com/ada/", "github.com/ada", "@ada" and "ada" all become "ada". The result still has to pass GITHUB_RE. */
export const githubName = (v: string) =>
  v.trim().replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "").replace(/^@/, "").replace(/[/?#].*$/, "");

/** Cleans what the browser sent. Returns the columns to update, or an error to show. Send only the fields that changed. */
export function cleanDetails(input: { name?: unknown; avatar?: unknown; username?: unknown; github?: unknown }):
  | { patch: { display_name?: string; avatar?: string; username?: string; github?: string } }
  | { error: string } {
  const out: { display_name?: string; avatar?: string; username?: string; github?: string } = {};
  if (input.name !== undefined) {
    if (typeof input.name !== "string") return { error: "That could not be saved." };
    // one space between words, no control characters, counted in whole characters so an emoji is never cut in half
    out.display_name = Array.from(input.name.replace(/[\p{Cc}\s]+/gu, " ").trim()).slice(0, NAME_MAX).join("");
  }
  if (input.avatar !== undefined) {
    if (typeof input.avatar !== "string" || (input.avatar !== "" && !validAvatar(input.avatar))) return { error: "That could not be saved. Try a different picture." };
    out.avatar = input.avatar;
  }
  if (input.username !== undefined) {
    if (typeof input.username !== "string") return { error: "That could not be saved." };
    const u = input.username.trim().toLowerCase();
    const problem = usernameProblem(u);
    if (problem) return { error: problem };
    out.username = u;
  }
  if (input.github !== undefined) {
    if (typeof input.github !== "string") return { error: "That could not be saved." };
    const g = githubName(input.github);
    if (g !== "" && !GITHUB_RE.test(g)) return { error: "That does not look like a GitHub username." };
    out.github = g;
  }
  return Object.keys(out).length ? { patch: out } : { error: "That could not be saved." };
}
