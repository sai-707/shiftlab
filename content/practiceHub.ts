export type HubItem = { href: string; name: string; text: string; level: "Easy" | "Medium" };

/** Order matters: it is the suggested order for a beginner. */
export const LEARN: HubItem[] = [
  { href: "/playbooks", name: "Playbooks", text: "A step-by-step checklist for each type of alert.", level: "Easy" },
  { href: "/glossary", name: "Glossary", text: "What every security word means, in plain English.", level: "Easy" },
];

export const PRACTICE: HubItem[] = [
  { href: "/mailbox", name: "Phishing mailbox", text: "Staff forward suspicious emails. Decide if each is phishing, spam or safe.", level: "Easy" },
  { href: "/logs", name: "Log search", text: "Search the record of what computers did and answer questions from it.", level: "Easy" },
  { href: "/tools", name: "Analyst tools", text: "Check a link, an email header or how old a website is.", level: "Medium" },
  { href: "/sprint", name: "Triage sprint", text: "A busy shift: sort 11 alerts quickly into close, look at, or escalate.", level: "Medium" },
  { href: "/shift", name: "Shift mode", text: "Six alerts land at once. Choose what to work first and how to treat each, with an optional clock.", level: "Medium" },
  { href: "/ai-check", name: "Spot the AI's mistake", text: "An AI assistant wrote a triage summary. Find what it got wrong, or confirm it is right.", level: "Medium" },
  { href: "/comms", name: "Communication", text: "Write replies to users, managers and Level 2 analysts.", level: "Medium" },
];

export const HUB_PATHS = [...LEARN, ...PRACTICE].map((i) => i.href);
