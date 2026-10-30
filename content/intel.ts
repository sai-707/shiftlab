import type { IntelResult } from "@/lib/types";

// SERVER ONLY. Fictional threat intelligence used by the lookup tool (app/actions.ts).
type IntelEntry = Omit<IntelResult, "query">;

export const INTEL: Record<string, IntelEntry> = {
  "harborpine-hr.test": {
    verdict: "malicious",
    kind: "Domain",
    note: "Registered 3 days ago. Imitates the company domain harborpine.test and hosts a page that asks for logins and bank details.",
  },
  "harborpine.test": {
    verdict: "internal",
    kind: "Domain",
    note: "Harbor & Pine Logistics' own domain.",
  },
  "freightline-news.test": {
    verdict: "clean",
    kind: "Domain",
    note: "Approved vendor (Procurement). Long-standing domain that passes email authentication.",
  },
  "click.freightline-news.test": {
    verdict: "clean",
    kind: "Domain",
    note: "Link-tracking subdomain of the approved vendor's newsletter.",
  },
  "203.0.113.58": {
    verdict: "malicious",
    kind: "IP address",
    note: "Reported by many networks for SSH brute-force attempts.",
  },
  "198.51.100.77": {
    verdict: "malicious",
    kind: "IP address",
    note: "Serves shell scripts that are downloaded after break-ins.",
  },
  "10.20.9.5": {
    verdict: "internal",
    kind: "IP address",
    note: "scanner-01: the Security Engineering vulnerability scanner.",
  },
  "10.20.4.37": {
    verdict: "internal",
    kind: "IP address",
    note: "Workstation assigned to d.okafor.",
  },
  "198.51.100.200": {
    verdict: "malicious",
    kind: "IP address",
    note: "On the botnet-c2 threat feed: used to control infected machines.",
  },
  "9f2c4a7d1b8e3f60a5d2c7b94e18f3a0": {
    verdict: "malicious",
    kind: "File hash",
    note: "Known malware loader disguised as an invoice viewer.",
  },
  "192.0.2.88": {
    verdict: "malicious",
    kind: "IP address",
    note: "Hosts second-stage malware downloads. Seen serving files to machines infected through macro documents.",
  },
  "jobseek-mail.test": {
    verdict: "suspicious",
    kind: "Domain",
    note: "Registered 9 days ago. Sends CV-themed emails with macro-enabled attachments. Not a known job board.",
  },
  "3be7a05c91d4f2e8b60c1a7d95f4e283": {
    verdict: "malicious",
    kind: "File hash",
    note: "Macro-enabled Word document that starts PowerShell and downloads a second-stage payload.",
  },
  "203.0.113.91": {
    verdict: "suspicious",
    kind: "IP address",
    note: "Seen running automated web-attack tools (sqlmap) against many sites. No relationship with Harbor & Pine.",
  },
  "192.0.2.150": {
    verdict: "internal",
    kind: "IP address",
    note: "vpn-eu-01: exit address of the company VPN gateway in Frankfurt.",
  },
  "198.51.100.34": {
    verdict: "clean",
    kind: "IP address",
    note: "Consumer broadband provider in Pune. No bad reputation.",
  },
  "203.0.113.210": {
    verdict: "suspicious",
    kind: "IP address",
    note: "Rented hosting-provider address used by anonymising VPN services. Frequently seen in account takeover attempts.",
  },
  "198.51.100.155": {
    verdict: "suspicious",
    kind: "IP address",
    note: "Residential broadband address. Not part of any Harbor & Pine office or VPN range.",
  },
  "203.0.113.77": {
    verdict: "suspicious",
    kind: "IP address",
    note: "Scans the internet for publicly readable storage buckets and downloads what it finds.",
  },
  "filedrop-personal.test": {
    verdict: "suspicious",
    kind: "Domain",
    note: "Consumer file-sharing service. Not approved for company data. Often used to move files out of a company.",
  },
  "203.0.113.140": {
    verdict: "malicious",
    kind: "IP address",
    note: "Mail server used to send look-alike payroll phishing emails. Also seen signing in to mailboxes with stolen passwords.",
  },
  "oceanlink-freight.test": {
    verdict: "clean",
    kind: "Domain",
    note: "Approved supplier (Procurement). Receives payment instructions from Accounts Payable.",
  },
  "203.0.113.166": {
    verdict: "suspicious",
    kind: "IP address",
    note: "Exit address of a commercial VPN service. Often used to sign in with stolen credentials.",
  },
  "files-transit.test": {
    verdict: "malicious",
    kind: "Domain",
    note: "Anonymous storage endpoint registered 5 days ago. Seen receiving data copied out of cloud platforms.",
  },
  "7a1c9e04b52f8d3366e0a9c14d7b2f58": {
    verdict: "clean",
    kind: "File hash",
    note: "Sysinternals PsExec64.exe, signed by Microsoft. A genuine admin tool, but attackers use it too, so the context matters.",
  },
  "10.20.9.20": {
    verdict: "internal",
    kind: "IP address",
    note: "JUMP-ADM-01: admin jump server owned by Infrastructure.",
  },
  "10.20.3.40": {
    verdict: "internal",
    kind: "IP address",
    note: "Reporting server owned by Data Engineering. Runs the nightly warehouse job.",
  },
  "harborpine-sso.test": {
    verdict: "malicious",
    kind: "Domain",
    note: "Registered 2 days ago. Shows a copy of a Microsoft 365 sign-in page that relays logins to the real service and keeps the session (adversary-in-the-middle phishing kit). Categorised as phishing.",
  },
  "10.20.30.115": {
    verdict: "internal",
    kind: "IP address",
    note: "Staff phone Wi-Fi range. Phones registered to employees connect from here.",
  },
  "zoom-installer-download.test": {
    verdict: "malicious",
    kind: "Domain",
    note: "Registered 4 days ago. Look-alike download site that serves a password-stealing trojan as a video meeting installer. Promoted through sponsored search results.",
  },
  "c41d8a07f3b95e26d0a47e19b8c53f72": {
    verdict: "malicious",
    kind: "File hash",
    note: "Password-stealing trojan packaged as a video meeting installer.",
  },
  "198.51.100.141": {
    verdict: "malicious",
    kind: "IP address",
    note: "Seen uploading web shells to websites and then using them to read configuration files.",
  },
  "203.0.113.178": {
    verdict: "malicious",
    kind: "IP address",
    note: "Cloud hosting provider address. Seen replaying stolen admin sessions against identity providers.",
  },
  "10.20.4.22": {
    verdict: "internal",
    kind: "IP address",
    note: "Pune office network. Managed laptop assigned to t.venkat.",
  },
  "203.0.113.87": {
    verdict: "malicious",
    kind: "IP address",
    note: "Seen exploiting file transfer software and downloading data in bulk.",
  },
  "198.51.100.208": {
    verdict: "suspicious",
    kind: "IP address",
    note: "Internet-wide scanner. Sends exploit strings to many addresses and rarely follows up.",
  },
  "203.0.113.45": {
    verdict: "malicious",
    kind: "IP address",
    note: "Address used as the callback in Log4Shell scanning. Runs a listener on port 1389.",
  },
  "192.0.2.64": {
    verdict: "suspicious",
    kind: "IP address",
    note: "Cloud hosting provider address often used as a VPN or rented server. Not a normal location for any Harbor & Pine staff.",
  },
  "192.0.2.140": {
    verdict: "clean",
    kind: "IP address",
    note: "Inside 192.0.2.128/26, the EdgeShield secure web gateway Frankfurt egress range. Matches change CHG-2291.",
  },
  "10.20.9.40": {
    verdict: "internal",
    kind: "IP address",
    note: "Pune office Wi-Fi.",
  },
  "api-voxline-cdn.test": {
    verdict: "malicious",
    kind: "Domain",
    note: "Registered 9 days ago. Imitates the softphone supplier's real domain voxline.test and receives small, regular check-ins from infected computers.",
  },
  "5e8f2a1c9d0b47e3a6c8f10d2b7e9a43": {
    verdict: "malicious",
    kind: "File hash",
    note: "Loader library that runs system commands and calls a command-and-control server. Not part of any published supplier release.",
  },
  "203.0.113.12": {
    verdict: "malicious",
    kind: "IP address",
    note: "Residential proxy and VPN exit used to sign in with stolen administrator credentials shortly before ransomware activity.",
  },
  "10.20.7.88": {
    verdict: "internal",
    kind: "IP address",
    note: "HR-WS-088, an HR workstation. Normally no administrative activity.",
  },
  "203.0.113.99": {
    verdict: "malicious",
    kind: "IP address",
    note: "Seen using leaked cloud access keys to start cryptocurrency mining servers.",
  },
  "198.51.100.230": {
    verdict: "malicious",
    kind: "IP address",
    note: "Hosts a cryptocurrency mining program downloaded by newly created servers.",
  },
  "198.51.100.188": {
    verdict: "malicious",
    kind: "IP address",
    note: "Address used by a malicious mail-reading app registered in pixelgrove.test.",
  },
  "pixelgrove.test": {
    verdict: "malicious",
    kind: "Domain",
    note: "Registered 3 days ago. Tenant that publishes unverified apps asking for mail and file permissions.",
  },
  "shieldsense-cloud.test": {
    verdict: "clean",
    kind: "Domain",
    note: "Registered 6 years ago. The endpoint security vendor's documented reputation lookup domain. Long DNS names under lookup. are normal for it.",
  },
  "198.51.100.231": {
    verdict: "malicious",
    kind: "IP address",
    note: "Hosting-provider address seen this week asking public chatbots to reveal their instructions and tools.",
  },
  "harborpine-pay.test": {
    verdict: "malicious",
    kind: "Domain",
    note: "Registered 5 days ago. Imitates the company domain harborpine.test and was used to send payment requests with new bank details.",
  },
  "203.0.113.141": {
    verdict: "malicious",
    kind: "IP address",
    note: "Sends mail for the look-alike payment domain. Hosting provider with no business link to the company.",
  },
  "brightwell-ledger.test": {
    verdict: "malicious",
    kind: "Domain",
    note: "Registered 6 days ago. Sends personalised invoice emails that pass email checks and link to a fake sign-in page.",
  },
  "docs-brightwell-ledger.test": {
    verdict: "malicious",
    kind: "Domain",
    note: "Hosts a fake Microsoft 365 sign-in page that captures passwords and session tokens.",
  },
  "203.0.113.118": {
    verdict: "malicious",
    kind: "IP address",
    note: "Hosting-provider address that signs in to stolen accounts using captured session tokens.",
  },
  "lumen-workspace.test": {
    verdict: "clean",
    kind: "Domain",
    note: "Approved vendor (AI-APP-006). Enterprise AI workspace under contract.",
  },
  "harborpine.lumen-workspace.test": {
    verdict: "internal",
    kind: "Domain",
    note: "Harbor & Pine Logistics' own tenant of the approved AI workspace.",
  },
  "203.0.113.250": {
    verdict: "malicious",
    kind: "IP address",
    note: "Hosting-provider address seen this week testing stolen AI service keys against several companies.",
  },
  "198.51.100.17": {
    verdict: "malicious",
    kind: "IP address",
    note: "Hosting-provider address that sends large volumes of requests to AI services with stolen keys.",
  },
  "docsync-archive.test": {
    verdict: "malicious",
    kind: "Domain",
    note: "Registered 4 days ago. Receives documents sent by AI assistants that read poisoned files.",
  },
  "eastgate-freight.test": {
    verdict: "clean",
    kind: "Domain",
    note: "Approved supplier (Procurement). Long-standing domain that passes email authentication. A document it sent carried hidden text, so ask the supplier how it was made.",
  },
  "freightdocs-portal.test": {
    verdict: "malicious",
    kind: "Domain",
    note: "Registered 4 days ago. Sends macro documents that start scripts, with a different file for each recipient.",
  },
  "api.sumly-ai.test": {
    verdict: "malicious",
    kind: "Domain",
    note: "Registered 3 weeks ago. Receives page text uploaded by a browser add-on that changed owner and widened its access.",
  },
};
