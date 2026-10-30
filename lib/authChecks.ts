// Pure form checks for the login / signup card. No React, no network.
// shortcut: the common-password list is a short built-in one, swap for a real breached-password check (e.g. HIBP range API) when accounts go live.

export type EmailResult = null | { t: "invalid"; m: string } | { t: "typo"; fix: string };

const SUGGEST = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "proton.me", "live.com", "rediffmail.com", "yahoo.in"];
const KNOWN = SUGGEST.concat(["mail.com", "aol.com", "gmx.com", "zoho.com", "protonmail.com", "yahoo.co.in", "msn.com", "me.com", "hey.com", "fastmail.com"]);

function lev(a: string, b: string): number {
  const d: number[][] = [];
  for (let i = 0; i <= a.length; i++) d[i] = [i];
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** Bad shape, or a misspelled well-known provider (gmsil.com). `kept` is an address the user chose to keep as typed. */
export function checkEmail(value: string, kept: string): EmailResult {
  const v = value.trim();
  if (!v) return { t: "invalid", m: "Enter your email." };
  const m = /^([^@\s]+)@([^@\s]+)$/.exec(v);
  if (!m || /\.\./.test(v) || !/^[^.\s][^@\s]*\.[A-Za-z]{2,}$/.test(m[2])) return { t: "invalid", m: "Enter an email like name@example.com." };
  const dom = m[2].toLowerCase();
  if (!KNOWN.includes(dom) && v !== kept) {
    for (const s of SUGGEST) if (lev(dom, s) <= 2) return { t: "typo", fix: `${m[1]}@${s}` };
  }
  return null;
}

const COMMON_BASES = ["password", "passw0rd", "qwerty", "qwertyuiop", "iloveyou", "letmein", "welcome", "admin", "shiftlab", "abc", "monkey", "dragon", "football", "cricket", "india"];

function isCommon(p: string): boolean {
  const l = p.toLowerCase();
  if (/^(.)\1+$/.test(l)) return true; // aaaaaaaa
  if ("0123456789".includes(l) || "9876543210".includes(l)) return true; // 12345678
  if ("abcdefghijklmnopqrstuvwxyz".includes(l) || "qwertyuiopasdfghjklzxcvbnm".includes(l)) return true;
  return COMMON_BASES.includes(l.replace(/[^a-z]+$/, "").replace(/^[^a-z]+/, ""));
}

function personal(p: string, email: string, name: string): boolean {
  const l = p.toLowerCase();
  return [email.split("@")[0], name].some((b) => {
    const s = b.toLowerCase().replace(/[^a-z0-9]/g, "");
    return s.length >= 4 && l.includes(s);
  });
}

export type PwChecks = { len: boolean; mixed: boolean; num: boolean; sym: boolean };
export type PwReport = { checks: PwChecks; level: 0 | 1 | 2 | 3 | 4; hint: string; block: string };

const HINTS = ["", "Easy to guess. Add length, numbers or symbols.", "Okay. A longer password is safer.", "Good. A few more characters would make it strong.", "Strong."];

/** Strength level 0-4, a live checklist, and `block` (non-empty = refuse this password at signup). */
export function checkPassword(p: string, email: string, name: string): PwReport {
  const checks: PwChecks = { len: p.length >= 8, mixed: /[a-z]/.test(p) && /[A-Z]/.test(p), num: /\d/.test(p), sym: /[^A-Za-z0-9]/.test(p) };
  const pts = +checks.mixed + +checks.num + +checks.sym + +(p.length >= 12) + +(p.length >= 16);
  if (!p) return { checks, level: 0, hint: "", block: "" };
  if (p.length < 8) return { checks, level: 1, hint: "Too short.", block: "Use at least 8 characters." };
  if (new TextEncoder().encode(p).length > 72) return { checks, level: 1, hint: "Too long.", block: "Use 72 characters or fewer." }; // Supabase's limit
  if (isCommon(p)) return { checks, level: 1, hint: "Too common. Attackers try this first.", block: "That password is on the list people guess first. Pick something else." };
  if (personal(p, email, name)) return { checks, level: 1, hint: "Contains your name or email.", block: "Leave your name or email out of your password." };
  const level = (pts <= 1 ? 1 : pts === 2 ? 2 : pts === 3 ? 3 : 4) as 1 | 2 | 3 | 4;
  return { checks, level, hint: HINTS[level], block: "" };
}
