export type CommsScenario = {
  id: string;
  title: string;
  audience: string;
  difficulty: "Beginner" | "Intermediate";
  /** Message or situation the analyst is responding to */
  situation: string;
  /** Facts the analyst can use. Nothing else is known. */
  facts: string[];
  task: string;
};

export const COMMS: CommsScenario[] = [
  {
    id: "c1",
    title: "A worried user who clicked a link",
    audience: "Employee, not technical",
    difficulty: "Beginner",
    situation:
      "Message from s.nair: \"Hi, I got an email about my mailbox being full and I clicked the link and typed my password. Am I in trouble? Please help.\"",
    facts: [
      "The email is the phishing example M-01 in the mailbox.",
      "The link leads to a fake login page on harborpine-helpdesk.test.",
      "Nobody has checked yet whether the password was used.",
    ],
    task: "Write your reply to s.nair. Keep it calm, plain and useful.",
  },
  {
    id: "c2",
    title: "Escalation note to the Level 2 analyst",
    audience: "L2 analyst, technical",
    difficulty: "Intermediate",
    situation: "You have decided alert SL-1003 is real and need to hand it to Level 2 right now.",
    facts: [
      "Host: web-bastion-02 (10.20.1.12).",
      "Source address 203.0.113.58 made 25 failed SSH logins between 02:41 and 02:43.",
      "The account admin then logged in successfully at 02:43:58 and ran curl with sudo.",
      "Intel says 203.0.113.58 is a known attacker address.",
      "You have not touched the server.",
    ],
    task: "Write the escalation note. A good one lets Level 2 act without asking you anything.",
  },
  {
    id: "c3",
    title: "A manager asks about a false alarm",
    audience: "IT manager, semi-technical",
    difficulty: "Beginner",
    situation:
      "Message from your manager: \"I saw a port scan alert from 10.20.9.5 overnight. Was that an attack, and do we need to do anything?\"",
    facts: [
      "10.20.9.5 is the approved vulnerability scanner.",
      "It runs every Wednesday night under change ticket CHG-2231.",
      "The alert fired because scanning looks like an attack to the rule.",
      "The same alert will fire again next week.",
    ],
    task: "Reply in two or three sentences a manager can read in ten seconds.",
  },
  {
    id: "c4",
    title: "A stressed user locked out before a meeting",
    audience: "Employee, impatient",
    difficulty: "Intermediate",
    situation:
      "Message from d.rossi: \"My account is locked and I have a client call in 10 minutes. Unlock it NOW please!!\"",
    facts: [
      "The account was locked after 8 failed sign-ins from an address d.rossi does not normally use.",
      "You cannot yet tell whether d.rossi made those attempts.",
      "Company policy: confirm the person's identity before unlocking or resetting anything.",
    ],
    task: "Write a reply that is kind, firm about policy and gives a clear next step.",
  },
];
