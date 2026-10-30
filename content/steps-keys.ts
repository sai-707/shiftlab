// SERVER ONLY. The answers for the bonus steps in content/steps.ts. Never import this from client code.
export type StepKey = {
  timeline?: { key: string[]; why: string };
  scope?: { answers: Record<string, string>; why: Record<string, string> };
};

export const STEP_KEYS: Record<string, StepKey> = {
  "SL-1033": {
    timeline: {
      key: ["t1", "t3", "t4", "t5", "t6", "t7"],
      why: "The story is: emails delivered, a password typed into the fake page, a sign-in from a hosting provider, a hiding rule, then mail to vendors. The vulnerability scan and the normal morning sign-in are unrelated.",
    },
    scope: {
      answers: { s1: "Compromised", s2: "Clicked only", s3: "Clicked only", s4: "Opened only", s5: "Not opened" },
      why: {
        s1: "Typing a password into the fake page hands the account over. The later foreign sign-in confirms it.",
        s2: "Clicked but sent nothing. Still worth a check of their sign-ins.",
        s3: "Clicked but sent nothing. Still worth a check of their sign-ins.",
        s4: "Opened without clicking. Remove the message from their mailbox.",
        s5: "Never opened. Remove the message before they do.",
      },
    },
  },
  "SL-1027": {
    timeline: {
      key: ["t2", "t3", "t4", "t5", "t6", "t7"],
      why: "The attack runs from the unknown VPN login, through the workstation, to recovery being deleted and files renamed. The nightly backup and the signature update are routine.",
    },
    scope: {
      answers: { s1: "Encrypted", s2: "Attacked, blocked", s3: "Used by the attacker", s4: "Untouched", s5: "Untouched" },
      why: {
        s1: "Files are being renamed right now, so this is where the damage is.",
        s2: "The deletion was attempted and stopped by EDR. Keep watching it.",
        s3: "The remote commands came from this workstation, so it needs isolating and checking.",
        s4: "No sign of activity.",
        s5: "The backup completed at 01:00 and sits on an immutable store, so recovery is possible.",
      },
    },
  },
};
