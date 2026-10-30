// Server only.
import type { SprintChoice } from "./sprint";

export const SPRINT_KEYS: Record<string, { answer: SprintChoice; why: string }> = {
  t1: { answer: "close", why: "A known test file, a known user, a scheduled demo. EICAR is harmless by design." },
  t2: { answer: "close", why: "A few typos then a success from the usual place. Normal behaviour, no pattern of guessing." },
  t3: { answer: "close", why: "The VPN exit explains the second location. The user did not really travel." },
  t4: { answer: "investigate", why: "Unusual but not proven bad. Check who owns the laptop and whether someone changed the account's use." },
  t5: { answer: "escalate", why: "A new Domain Admin with no ticket is a possible attacker gaining full control. Escalate immediately." },
  t6: { answer: "close", why: "Blocked scanning noise. Worth a watch if it repeats, but nothing got through." },
  t7: { answer: "escalate", why: "A confirmed phishing campaign with clicks. Level 2 needs to reset passwords and purge the email." },
  t8: { answer: "close", why: "A signed updater making normal connections is expected." },
  t9: { answer: "escalate", why: "Data leaving at night for a person who is on leave points to a stolen or misused account." },
  t10: { answer: "close", why: "An approved scan with a ticket. The alert should be tuned, not escalated." },
  t11: { answer: "investigate", why: "Could be a holiday login or a stolen password. Ask the user, check for other sign-ins and MFA." },
};
