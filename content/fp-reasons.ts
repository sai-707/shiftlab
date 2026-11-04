// Why a false positive was benign. Mirrors the "determination" step in real consoles (for example Defender's
// Security testing / Security personnel). Labels are safe for the browser; the right answer lives in answer-keys.ts.
export const FP_REASONS = [
  { id: "business", label: "Expected business activity" },
  { id: "testing", label: "Authorised security testing or training" },
  { id: "admin", label: "Approved admin or IT change" },
  { id: "system", label: "Normal tool or system behaviour (VPN, agent, scheduled job)" },
  { id: "user", label: "User error or stale setting" },
] as const;
