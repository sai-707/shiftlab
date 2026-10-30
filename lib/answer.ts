/** True if the answer contains one of the accepted values as a whole word or number (case-insensitive). */
export function matchesAny(answer: string, accept: string[]): boolean {
  const a = answer.trim().toLowerCase();
  return accept.some((x) => {
    const escaped = x.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^0-9a-z])${escaped}($|[^0-9a-z])`).test(a);
  });
}
