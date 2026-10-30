export type SprintItem = {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  source: string;
  text: string;
};

export type SprintChoice = "close" | "investigate" | "escalate";

export const CHOICES: { id: SprintChoice; label: string; hint: string }[] = [
  { id: "close", label: "Close as harmless", hint: "Expected or benign. Nothing else to do." },
  { id: "investigate", label: "Investigate", hint: "Could be either. Needs a closer look." },
  { id: "escalate", label: "Escalate now", hint: "Looks real and serious. Hand to Level 2." },
];

export const SPRINT: SprintItem[] = [
  { id: "t1", severity: "low", source: "Antivirus", text: "eicar.com.txt quarantined on lab-pc-04. The user is the security trainer running a scheduled awareness demo." },
  { id: "t2", severity: "medium", source: "Identity", text: "j.mehta had 3 failed sign-ins, then a success 2 minutes later from the same office address." },
  { id: "t3", severity: "high", source: "Identity", text: "Impossible travel for p.nair: Mumbai, then Frankfurt 4 minutes later. The Frankfurt address is the company VPN exit." },
  { id: "t4", severity: "high", source: "Endpoint", text: "Service account svc-backup signed in interactively on a laptop at 01:12. Service accounts normally never do this." },
  { id: "t5", severity: "critical", source: "Directory", text: "helpdesk-tmp added a new user to Domain Admins at 03:05. There is no change ticket." },
  { id: "t6", severity: "medium", source: "WAF", text: "4 requests with SQL characters to /search from 198.51.100.77. All were blocked with a 403." },
  { id: "t7", severity: "critical", source: "Mail gateway", text: "14 users received the same email linking to harborpine-verify.test. 3 of them clicked." },
  { id: "t8", severity: "low", source: "Endpoint", text: "GoogleUpdate.exe made an outbound connection on a standard laptop. File is signed by the vendor." },
  { id: "t9", severity: "high", source: "Firewall", text: "ws-fin-07 sent 40 MB to an unknown file-sharing site at 23:50. The user is on leave this week." },
  { id: "t10", severity: "medium", source: "Network", text: "10.20.9.5 touched 200 hosts between 22:00 and 22:30. This is the weekly approved scan under CHG-2231." },
  { id: "t11", severity: "medium", source: "VPN", text: "d.rossi connected from Portugal for the first time. Their calendar shows they are on holiday." },
];
