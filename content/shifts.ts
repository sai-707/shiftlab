import type { Severity } from "@/lib/types";

export type Treatment = "escalate" | "handle" | "close";

export type ShiftAlert = {
  id: string;
  title: string;
  severity: Severity;
  source: string;
  /** What an analyst would see in five seconds. */
  signal: string;
  age: string;
  /** True while the harm is still growing. */
  live: boolean;
};

export type Shift = {
  id: string;
  name: string;
  level: "Easy" | "Medium" | "Hard";
  intro: string;
  alerts: ShiftAlert[];
};

export const TREATMENTS: { id: Treatment; label: string; hint: string }[] = [
  { id: "escalate", label: "Escalate now", hint: "Real, serious or beyond your level. Hand it to Level 2 straight away." },
  { id: "handle", label: "Handle myself", hint: "Real or unclear, but you can deal with it: check, block, ask the user." },
  { id: "close", label: "Close fast", hint: "Expected or harmless. Note why and move on." },
];

// Six alerts per shift. The scoring keys live on the server in shift-keys.ts.
export const SHIFTS: Shift[] = [
  {
    id: "morning-rush",
    name: "Morning rush",
    level: "Easy",
    intro: "It is 09:10. Six alerts arrived while you were getting your first coffee. The severity label helps, but it is not the whole story.",
    alerts: [
      { id: "r1", title: "Test file quarantined on lab-pc-04", severity: "low", source: "Antivirus", signal: "It is the EICAR test file. The security trainer is running the scheduled awareness demo today.", age: "20 min ago", live: false },
      { id: "r2", title: "Same email sent to 14 staff, 3 clicked", severity: "critical", source: "Mail gateway", signal: "The link goes to a look-alike login page. Three people have clicked and more may.", age: "8 min ago", live: true },
      { id: "r3", title: "New member added to Domain Admins", severity: "critical", source: "Directory", signal: "Added by helpdesk-tmp at 09:02. There is no change ticket.", age: "4 min ago", live: true },
      { id: "r4", title: "First login from Portugal for d.rossi", severity: "medium", source: "VPN", signal: "Their calendar shows a holiday this week. MFA passed.", age: "15 min ago", live: false },
      { id: "r5", title: "Three blocked connections from a known scanner", severity: "low", source: "Firewall", signal: "All were blocked at the edge. The address is on the scanner list.", age: "30 min ago", live: false },
      { id: "r6", title: "40 MB sent to an unknown file-sharing site", severity: "high", source: "Firewall", signal: "Sent at 23:50 from ws-fin-07. The user is on leave this week.", age: "9 hours ago", live: false },
    ],
  },
  {
    id: "night-shift",
    name: "Night shift",
    level: "Medium",
    intro: "It is 02:40 and the office is empty. Six alerts arrived in twelve minutes and you are the only analyst on.",
    alerts: [
      { id: "n4", title: "User reported a fake sign-in link", severity: "medium", source: "Mail gateway", signal: "The proxy blocked the page and no form data was sent. Nine people got the email.", age: "12 min ago", live: false },
      { id: "n2", title: "Deploy key used to start eight servers in a new region", severity: "high", source: "Cloud audit", signal: "A new admin user was created. The servers are running and costing money.", age: "5 min ago", live: true },
      { id: "n6", title: "Same user in Pune and Frankfurt four minutes apart", severity: "low", source: "Identity", signal: "Same managed laptop and browser. A network change started this morning.", age: "11 min ago", live: false },
      { id: "n1", title: "Shadow copies deleted and files renamed on FS-02", severity: "critical", source: "EDR", signal: "About 15 files a second are being renamed by an unsigned program. It is still running.", age: "2 min ago", live: true },
      { id: "n5", title: "Log4Shell strings from one scanner", severity: "medium", source: "WAF", signal: "The Java servers are patched and nothing called back out.", age: "12 min ago", live: false },
      { id: "n3", title: "New MFA device right after a help desk reset", severity: "high", source: "Identity", signal: "The owner is on leave. A supplier bank change is waiting for a second approver.", age: "9 min ago", live: true },
    ],
  },
  {
    id: "patch-week",
    name: "Patch week",
    level: "Hard",
    intro: "Friday afternoon before a long weekend. Labels and reality do not always match here, so decide what is really urgent.",
    alerts: [
      { id: "p5", title: "14 failed sign-ins, then a lockout", severity: "low", source: "Identity", signal: "All from one phone on the staff Wi-Fi, the day after a password change.", age: "25 min ago", live: false },
      { id: "p3", title: "Admin session used from a second address", severity: "high", source: "Identity", signal: "There was no sign-in or MFA from the new address. A Super Admin account was created a few minutes ago.", age: "7 min ago", live: true },
      { id: "p1", title: "120 critical findings on dev-sandbox-02", severity: "critical", source: "Vulnerability scanner", signal: "The host is in an isolated lab network with no internet access and no company data.", age: "1 hour ago", live: false },
      { id: "p6", title: "Customer records uploaded to an AI workspace", severity: "high", source: "Data loss prevention", signal: "The destination is the company's approved enterprise AI workspace. It is under contract and stays in our own tenant.", age: "30 min ago", live: false },
      { id: "p2", title: "New script in the picture upload folder, called from outside", severity: "medium", source: "File monitoring", signal: "The same outside address then ran commands through it 40 times in 6 minutes. It is still going.", age: "6 min ago", live: true },
      { id: "p4", title: "User sent their password to a look-alike site", severity: "medium", source: "Web proxy", signal: "A form was submitted to a newly registered site. The account has not signed in from anywhere new yet.", age: "10 min ago", live: true },
    ],
  },
];
