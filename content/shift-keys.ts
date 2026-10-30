// SERVER ONLY. Urgency tiers and the best treatment for each alert in each shift.
// Tier 1 is the most urgent. Alerts in the same tier can be worked in either order.
import type { Treatment } from "./shifts";

export type ShiftKey = { tier: number; ideal: Treatment; why: string };

export const SHIFT_KEYS: Record<string, Record<string, ShiftKey>> = {
  "morning-rush": {
    r3: { tier: 1, ideal: "escalate", why: "A new Domain Admin with no ticket may mean an attacker has full control, and it is still in effect. It comes first." },
    r2: { tier: 2, ideal: "escalate", why: "A phishing campaign with clicks is still growing, because more people can click every minute. Level 2 must reset passwords and pull the email." },
    r6: { tier: 2, ideal: "escalate", why: "Data has left for an unknown site and the owner is away, which points to a stolen or misused account. It needs Level 2." },
    r4: { tier: 3, ideal: "handle", why: "It could be a holiday login or a stolen password. Ask the user and check MFA and other sign-ins. Nothing is spreading, so it waits for the urgent ones." },
    r1: { tier: 4, ideal: "close", why: "A harmless test file during a scheduled demo. Close it quickly." },
    r5: { tier: 4, ideal: "close", why: "Blocked scanner noise. Close it, and watch it only if it repeats." },
  },
  "night-shift": {
    n1: { tier: 1, ideal: "escalate", why: "Ransomware in progress. Every minute encrypts more files, so this goes first and to Level 2 now." },
    n2: { tier: 2, ideal: "escalate", why: "An attacker holds working admin access in the cloud account and it is spreading. It ranks right behind the ransomware." },
    n3: { tier: 2, ideal: "escalate", why: "A payment can still be stopped, but only until the second approver clicks. Escalate quickly." },
    n4: { tier: 3, ideal: "handle", why: "Contained, but the email is still in eight other mailboxes. Worth doing after the live problems." },
    n5: { tier: 4, ideal: "handle", why: "A real attempt that failed. You can block the scanner yourself, with no escalation." },
    n6: { tier: 4, ideal: "close", why: "The device and the change record explain it. Close it fast and ask for the range to be added as a known location." },
  },
  "patch-week": {
    p2: { tier: 1, ideal: "escalate", why: "A web shell in active use on a public server. The medium label is wrong: the attacker is on the server right now." },
    p3: { tier: 2, ideal: "escalate", why: "A stolen admin session with a new Super Admin account. The attacker is inside and is making a way to stay." },
    p4: { tier: 2, ideal: "escalate", why: "The password is in the attacker's hands. It must be reset and sessions revoked before it is used, which needs Level 2." },
    p1: { tier: 3, ideal: "handle", why: "A scary label on an isolated lab host. Open a ticket for its owner and carry on with the live problems." },
    p5: { tier: 4, ideal: "close", why: "One registered phone with an old password, the day after a change. Close it and ask the user to update the phone." },
    p6: { tier: 4, ideal: "close", why: "The label says data loss, but the destination is the approved enterprise tool. Close it and note why." },
  },
};
