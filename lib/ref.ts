// The ?ref= label a link carries, for example /?ref=linkedin-post2. Kept so the admin Students page can show which post brought someone.
// A label is letters, digits, "-" and "_", up to 40 long. Anything else is dropped (never rejected), so an odd link still counts as a normal visit.
const REF = /^[a-z0-9_-]{1,40}$/;

export function cleanRef(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim().toLowerCase();
  return REF.test(s) ? s : null;
}
