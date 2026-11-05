import type { AnswerKey } from "@/lib/types";

// SERVER ONLY. Imported by app/actions.ts and nowhere else. Never import this from a
// client component or the correct answers would be sent to every student's browser.
export const ANSWER_KEYS: Record<string, AnswerKey> = {
  "SL-1001": {
    verdict: "tp",
    escalate: true,
    evidence: [
      {
        label: "the sender domain is a look-alike of the company domain",
        matches: ["harborpine-hr", "look-alike", "lookalike", "look alike", "spoof", "impersonat"],
      },
      { label: "email authentication (SPF) failed", matches: ["spf"] },
      {
        label: "the user opened the link and submitted a form",
        matches: ["post", "submitted", "clicked", "entered", "opened the link"],
      },
      { label: "the affected user, d.okafor", matches: ["okafor"] },
      { label: "the Reply-To points to a free mailbox, not the company", matches: ["reply-to", "reply to", "freemail"] },
    ],
    explanation:
      "The sender used harborpine-hr.test, a look-alike of the real harborpine.test. SPF failed, the message pushed urgency, and the proxy log shows d.okafor opened the page and then submitted a form to it. Treat the details as stolen: escalate so the account can be secured, the domain blocked and other recipients checked.",
  },
  "SL-1002": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "SPF and DKIM both passed", matches: ["spf", "dkim"] },
      {
        label: "the sender is an approved vendor sending a normal newsletter",
        matches: ["vendor", "newsletter", "approved", "known sender", "legitimate", "legit"],
      },
      {
        label: "nobody clicked the tracking link",
        matches: ["no click", "not click", "no proxy", "no one", "nobody", "no users", "no entries", "no matching", "no hits"],
      },
    ],
    explanation:
      "This is a normal vendor newsletter. The sender passes SPF and DKIM, freightline-news.test is on the approved vendor list, the tracking link is the vendor's own subdomain, 212 colleagues got the same email, and nobody visited the link. Close it as a false positive with a note saying why.",
  },
  "SL-1003": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "many failed logins from one external IP (203.0.113.58)", matches: ["203.0.113.58"] },
      { label: "a successful login right after the failures", matches: ["accepted", "success", "succeeded", "logged in"] },
      {
        label: "the follow-up command that downloaded a script from 198.51.100.77",
        matches: ["198.51.100.77", "curl", "download", "update.sh", "script"],
      },
      { label: "the admin account on web-bastion-02", matches: ["admin", "web-bastion-02", "bastion"] },
    ],
    explanation:
      "Repeated failures from 203.0.113.58 across several usernames, then an accepted password for admin, is a successful brute-force attack. The session immediately ran curl with elevated rights to fetch a script from 198.51.100.77, which suggests hands-on-keyboard activity. Escalate now: the host needs isolating, the admin password resetting and the downloaded script analysing.",
  },
  "SL-1004": {
    verdict: "fp",
    escalate: false,
    evidence: [
      {
        label: "the scan matches an approved change (CHG-2291) and its time window",
        matches: ["chg-2291", "approved", "scheduled", "change", "authorised", "authorized", "maintenance"],
      },
      { label: "the source is the scanner host scanner-01 (10.20.9.5)", matches: ["scanner-01", "10.20.9.5", "scanner"] },
    ],
    explanation:
      "The source is scanner-01, the security team's vulnerability scanner, and the activity sits inside the approved window for CHG-2291. The detection rule is working as designed; the behaviour is expected. Close it as a false positive and note the change number.",
  },
  "SL-1005": {
    verdict: "tp",
    escalate: true,
    evidence: [
      {
        label: "repeated blocked connections at regular 60-second intervals (beaconing)",
        matches: ["60 second", "every 60", "beacon", "interval", "periodic", "repeated", "regular", "131"],
      },
      {
        label: "the suspicious process invoice_viewer.exe that started before the connections",
        matches: ["invoice_viewer", "process", "executable", "unsigned", "not signed", "downloads"],
      },
      {
        label: "the destination 198.51.100.200 is on a botnet command-and-control threat feed",
        matches: ["198.51.100.200", "threat feed", "threat-feed", "c2", "botnet", "command-and-control", "command and control"],
      },
      { label: "the affected host FIN-WS-114 and user r.nair", matches: ["fin-ws-114", "r.nair", "nair"] },
    ],
    explanation:
      "The firewall blocked each connection, but a connection attempt every 60 seconds for over two hours is beaconing. It started minutes after an unsigned program, invoice_viewer.exe, ran from the Downloads folder, and the destination is on a botnet command-and-control feed. The workstation is almost certainly infected. Escalate so it can be isolated and investigated, and check whether other hosts contacted the same address.",
  },

  "SL-1006": {
    verdict: "tp",
    escalate: true,
    evidence: [
      {
        label: "Word started PowerShell a few seconds after the macro document opened",
        matches: ["winword", "word", "macro", ".docm", "office", "parent"],
      },
      {
        label: "the hidden, encoded PowerShell command (-w hidden, -enc)",
        matches: ["-enc", "encoded", "base64", "hidden", "obfuscat", "-nop"],
      },
      {
        label: "the follow-up connection to 192.0.2.88 that downloaded stage2.bin",
        matches: ["192.0.2.88", "stage2", "download", "outbound", "connect"],
      },
      { label: "the affected host HR-WS-052 and user l.fernandes", matches: ["hr-ws-052", "fernandes"] },
    ],
    explanation:
      "A macro-enabled document from a first-time sender made Word start a hidden PowerShell with an encoded command, and seconds later the machine downloaded a file from 192.0.2.88. That is a classic malicious-macro infection chain. The EDR only detected it, it did not block it, so escalate now: isolate HR-WS-052, find out what stage2.bin did, reset l.fernandes' credentials and check who else received the email.",
  },
  "SL-1007": {
    verdict: "fp",
    escalate: false,
    evidence: [
      {
        label: "the detection is EICAR-Test-File, a harmless industry test string",
        matches: ["eicar", "test file", "test string", "not a virus", "harmless"],
      },
      {
        label: "the training workshop TRN-118 explains why the file was created",
        matches: ["trn-118", "training", "workshop", "awareness", "demo"],
      },
      {
        label: "the file was quarantined and never ran or touched the network",
        matches: ["quarantin", "no process", "did not run", "never ran", "no network", "no new network"],
      },
    ],
    explanation:
      "EICAR is a standard 68-byte test file that every antivirus is meant to flag, and it is not malware. It was created in a Training folder during workshop TRN-118, the same detection fired on five other lab laptops, nothing ran, and there was no network activity. Close it as a false positive and note the ticket.",
  },
  "SL-1008": {
    verdict: "tp",
    escalate: false,
    evidence: [
      {
        label: "the requests contain real SQL injection payloads from 203.0.113.91 (sqlmap)",
        matches: ["sql injection", "sqli", "sqlmap", "union select", "or 1=1", "203.0.113.91", "payload"],
      },
      {
        label: "the WAF blocked every request (403)",
        matches: ["blocked", "block", "403", "waf stopped", "did not reach"],
      },
      {
        label: "nothing reached the application and the database logged no errors",
        matches: ["not reach", "no sql error", "no database error", "no errors", "no successful", "no 200", "unsuccessful"],
      },
    ],
    explanation:
      "This is real hostile activity, so it is a true positive, but the protection worked: all 14 requests from the sqlmap scanner were blocked with a 403, none reached the application and there are no database errors. No escalation is needed. Record it, block or rate-limit 203.0.113.91, and keep an eye out for the same address or tool returning. If a request had come back 200 with a large response, that would change the answer.",
  },
  "SL-1009": {
    verdict: "fp",
    escalate: false,
    evidence: [
      {
        label: "both sign-ins came from the same device, LAP-PUN-208",
        matches: ["same device", "lap-pun-208", "same laptop", "same user agent", "same browser"],
      },
      {
        label: "the second address 192.0.2.150 is the company VPN exit (vpn-eu-01)",
        matches: ["vpn", "vpn-eu-01", "192.0.2.150", "exit node", "exit"],
      },
      {
        label: "MFA passed and nothing suspicious happened afterwards",
        matches: ["mfa", "no new device", "no mailbox rule", "normal activity", "nothing unusual", "no changes"],
      },
    ],
    explanation:
      "The 'travel' is the VPN. The VPN gateway log shows s.menon connected at 14:12 and was assigned the Frankfurt exit address 192.0.2.150. Both sign-ins used the same laptop and browser, MFA passed both times, and nothing odd followed. Close it as a false positive. A real impossible-travel case would show a different device and unusual activity afterwards.",
  },
  "SL-1010": {
    verdict: "tp",
    escalate: true,
    evidence: [
      {
        label: "many MFA prompts in a few minutes from 203.0.113.210, then one approved (MFA fatigue)",
        matches: ["mfa", "prompt", "fatigue", "push", "approved", "203.0.113.210", "nine", "9 "],
      },
      {
        label: "the sign-in came from a new location and device at night, outside working hours",
        matches: ["amsterdam", "netherlands", "unknown device", "new device", "night", "22:", "hosting", "never signed"],
      },
      {
        label: "the attacker's follow-up: a new MFA device and a mail-forwarding rule",
        matches: ["forward", "inbox rule", "mailbox rule", "ak.backup", "device registered", "pixel", "persistence", "new mfa"],
      },
      { label: "the affected user a.kapoor", matches: ["kapoor"] },
    ],
    explanation:
      "Someone with a.kapoor's password triggered nine MFA prompts from a hosting-provider address in the Netherlands until one was approved at 22:48. Within minutes the attacker added their own MFA device, created a rule that forwards and deletes mail, and opened the Contracts folder. The account is compromised. Escalate now: revoke sessions, reset the password and MFA methods, remove the forwarding rule and assess what was read.",
  },
  "SL-1011": {
    verdict: "tp",
    escalate: true,
    evidence: [
      {
        label: "the bucket policy was changed to allow everyone (public read)",
        matches: ["public", "everyone", "principal *", "putbucketpolicy", "anonymous", "publicly"],
      },
      {
        label: "files with personal customer data were downloaded by outside addresses (203.0.113.77)",
        matches: ["downloaded", "203.0.113.77", "customer", "personal data", "pii", "get ", "exfil"],
      },
      {
        label: "no approved change, and the change came from a new temporary service account",
        matches: ["no approved", "no change", "svc-reporting-tmp", "service account", "contractor", "unauthori"],
      },
    ],
    explanation:
      "A temporary service account made a bucket holding monthly customer exports public with no approved change. Within three minutes an anonymous outside address downloaded two files containing names, emails and addresses. This is a live data exposure, not a misconfiguration to note down. Escalate immediately: make the bucket private again, preserve the logs, find out who created and used svc-reporting-tmp, and start the data-breach process.",
  },
  "SL-1012": {
    verdict: "tp",
    escalate: true,
    evidence: [
      {
        label: "1.8 GB of Confidential files uploaded to a personal site, filedrop-personal.test",
        matches: ["1.8", "filedrop-personal", "personal", "upload", "confidential", "pricing", "contracts"],
      },
      {
        label: "the user resigned on Oct 20 and the upload was after hours",
        matches: ["resign", "notice", "leaving", "nov 6", "last working day", "after hours", "after-hours", "18:"],
      },
      {
        label: "no approved exception and the site is not allowed by policy",
        matches: ["no approval", "no exception", "policy", "not approved", "unapproved", "no request"],
      },
      { label: "the user j.mercer on SALES-WS-031", matches: ["mercer", "sales-ws-031"] },
    ],
    explanation:
      "A leaving employee uploaded 1.8 GB, mostly files labelled Confidential (pricing and key-account contracts), to a personal file-sharing site after hours, with no approval on record. That is a likely data-theft risk. Escalate to the insider-risk process: involve HR and the manager, preserve the proxy and DLP logs, and decide on account restrictions. Stay neutral in your report: describe what the logs show, not what you think the person intended.",
  },
  "SL-1013": {
    verdict: "fp",
    escalate: false,
    evidence: [
      {
        label: "incident INC-5521 explains the work and d.rossi was paged and acknowledged",
        matches: ["inc-5521", "incident", "paged", "page", "acknowledg", "ticket"],
      },
      {
        label: "d.rossi is the on-call engineer this week",
        matches: ["on-call", "on call", "rota", "oncall"],
      },
      {
        label: "the login came through the company VPN with MFA, and the commands match the fix",
        matches: ["vpn", "mfa", "restart", "net stop", "net start", "mssqlserver", "service"],
      },
    ],
    explanation:
      "d.rossi is the primary on-call engineer, was paged for INC-5521 at 03:12 and acknowledged it, connected through the company VPN with MFA approved, and ran exactly the commands needed to restart the stalled database service. The rule did its job, but this is expected activity. Close it as a false positive and note the incident number.",
  },

  "SL-1014": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "the sign-in came from a new address, 203.0.113.140", matches: ["203.0.113.140"] },
      {
        label: "legacy IMAP access let the sign-in skip MFA",
        matches: ["imap", "legacy", "mfa", "not required", "multi-factor", "multifactor"],
      },
      {
        label: "the inbox rule that hides messages about banks and invoices",
        matches: ["inbox rule", "rule", "hide", "hidden", "rss", "move"],
      },
      {
        label: "the email to a supplier asking to change bank details (payment fraud)",
        matches: ["oceanlink", "bank details", "supplier", "fraud", "bec", "payment"],
      },
      { label: "the affected account, d.okafor", matches: ["okafor"] },
    ],
    explanation:
      "The same address, 203.0.113.140, sent the look-alike payroll email in SL-1001, so d.okafor's password was almost certainly stolen there. The attacker used legacy IMAP, which skips MFA, hid replies with an inbox rule and emailed a supplier asking to change bank details. That is business email compromise. Escalate now: reset the password, end the session, turn off legacy protocols, contact the supplier and stop any payment change.",
  },
  "SL-1015": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "svc_bi_report signed in from the new address 203.0.113.166", matches: ["203.0.113.166", "svc_bi_report"] },
      { label: "the whole CUSTOMER_ORDERS table was copied to an outside stage", matches: ["copy into", "export", "customer_orders", "stage"] },
      { label: "the account is password only and its credentials were in an infostealer listing", matches: ["infostealer", "password only", "no mfa"] },
      { label: "files-transit.test received the data", matches: ["files-transit"] },
    ],
    explanation:
      "A service account that only ever signs in at 02:00 from the reporting server signed in at 18:51 from a VPN address and copied the whole CUSTOMER_ORDERS table (about 2.4 million rows with names and addresses) to anonymous storage. The account is protected by a password alone, and the threat feed shows that password in an infostealer log. Escalate now: disable and rotate the account, block the address and destination, and assess the data that left.",
  },
  "SL-1016": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "PsExec was run by svc-patch from JUMP-ADM-01", matches: ["psexec", "svc-patch", "jump-adm-01"] },
      { label: "approved change CHG-2310 covers these servers and this window", matches: ["chg-2310", "approved"] },
      { label: "the program is the genuine signed Microsoft tool", matches: ["signed", "microsoft", "hash"] },
      { label: "the servers show patches installed and nothing destructive", matches: ["installed", "kb5044", "no new", "encrypt"] },
    ],
    explanation:
      "PsExec is used by both attackers and administrators, so the surrounding facts decide. The change record CHG-2310 approves patching these 12 servers between 01:00 and 03:00. svc-patch ran it from the jump server it always uses, the binary is the genuine signed tool, and the servers afterwards show the patch installed, the PsExec service removed, no new connections and no file damage. Close as a false positive and suggest tuning for approved patch windows.",
  },
  "SL-1017": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "1,940 files (6.8 GB) in 28 minutes against a usual 38 files a day", matches: ["1,940", "6.8", "38"] },
      { label: "6.1 GB copied to an unapproved USB drive, and three uploads to personal cloud storage blocked", matches: ["usb", "6.1", "sandisk", "cloudbox", "blocked"] },
      { label: "resigned on 20 October, last day 6 November, and no handover or ticket explains the download", matches: ["resignation", "last working day", "2026-11-06", "handover"] },
    ],
    explanation:
      "A download this size could be a migration or a handover, but nothing supports that here. r.pillai resigned on 20 October, pulled 61 customer and pricing folders as ZIP files in 28 minutes (only 4 are their own accounts), copied 6.1 GB to a USB drive that is not approved and tried three uploads to personal cloud storage, which DLP blocked. Escalate to the insider-risk process: preserve the logs, ask HR and the manager to recover the drive, restrict access and look back over the last 30 days. This is an HR and legal matter, so contact with the user goes through them.",
  },
  "SL-1018": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "all failures came from r.dsouza's own registered iPhone on the staff Wi-Fi", matches: ["10.20.30.115", "iphone", "phone"] },
      { label: "the password was changed yesterday, so the phone is using the old one", matches: ["changed", "old password", "expired"] },
      { label: "help desk ticket INC-5540 and a normal sign-in afterwards", matches: ["inc-5540", "help desk", "09:03"] },
    ],
    explanation:
      "The failures came every 30 seconds from one registered phone on the staff Wi-Fi, the day after r.dsouza changed the password. The phone's mail app kept trying the old password until the account locked. There was a help desk ticket, and a normal sign-in from the usual laptop with MFA followed. Close as a false positive and ask r.dsouza to update the password on the phone.",
  },
  "SL-1019": {
    verdict: "tp",
    escalate: false,
    evidence: [
      { label: "a password-stealing trojan was downloaded from a look-alike site reached through a sponsored search result", matches: ["trojan", "zoom-installer", "sponsored", "look-alike"] },
      { label: "antivirus quarantined and deleted it", matches: ["quarantin", "deleted", "removed"] },
      { label: "the file never ran and nothing else contacted the site", matches: ["never ran", "not executed", "no new process", "no other"] },
    ],
    explanation:
      "The file really was malware, so this is a true positive, but it stopped at the download. Antivirus removed it within seconds, no process started from it, and no new connections or other computers are involved. Handle it yourself: block the website, remind m.pillai to download software only from the official site and close the case. If the file had run, this would need escalation.",
  },
  "SL-1020": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "a PHP file (avatar.php) was uploaded through the picture form and saved in the uploads folder", matches: ["avatar.php", "9f3a", "php", "web shell", "webshell", "upload"] },
      { label: "198.51.100.141 then ran commands through it, including reading .env", matches: ["198.51.100.141", ".env", "cat", "commands"] },
      { label: "the web server ran the commands (php-fpm started sh)", matches: ["php-fpm", "www-data", "sh -c", "shell"] },
    ],
    explanation:
      "An outside address uploaded a PHP file disguised as a picture, then used it to run commands on web-app-03, including reading the .env file that holds the database password. That is a web shell and the server is compromised. Escalate now: isolate the server, keep a copy of the file, rotate the database password and API key, and review database access.",
  },
  "SL-1021": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "session s-8841 was reused from 203.0.113.178 with no password or MFA prompt, so the session itself was taken", matches: ["s-8841", "203.0.113.178", "no mfa", "replay", "hijack", "stolen session"] },
      { label: "the HAR file uploaded to vendor ticket VND-77120 could hold session cookies", matches: ["har", "vnd-77120", "cookie", "vendor"] },
      { label: "the second address created svc-sso-sync, made it Super Admin and created an API token", matches: ["svc-sso-sync", "super admin", "api token", "1,214"] },
    ],
    explanation:
      "The same session was used from a hosting-provider address with no sign-in or MFA, while the real administrator stayed in the office on a normal laptop. That is a stolen session, not a login. The likely source is the HAR file uploaded to the vendor at 09:12, and the vendor was already reporting unusual access to support attachments. The attacker exported every user, created a Super Admin account and a non-expiring API token, so this is critical and must be escalated now.",
  },
  "SL-1022": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "guest2.aspx appeared after a large request to guestaccess.aspx succeeded, and only 203.0.113.87 used it", matches: ["guest2.aspx", "guestaccess", "203.0.113.87", "web shell", "webshell"] },
      { label: "the database audit shows 41,220 rows read from FileBlob, far above normal", matches: ["41,220", "fileblob", "database", "6.4 gb"] },
      { label: "xfer-01 was not patched for the vendor's SQL injection flaw", matches: ["2024.1.3", "2024.1.4", "sql injection", "not patched", "unpatched", "advisory"] },
    ],
    explanation:
      "An outside address exploited the guest access page, a web shell was created, and the shell was used to list the database and read about 41,000 file records, 6.4 GB, out through the firewall. The server was running a version the vendor then warned about. Data has left, so escalate immediately: isolate xfer-01, keep the file and logs, patch, and start work on what customer data was taken.",
  },
  "SL-1023": {
    verdict: "tp",
    escalate: false,
    evidence: [
      { label: "the string was blocked on three targets and allowed only on api-gw-02 in monitor-only mode", matches: ["blocked", "monitor-only", "monitor only", "api-gw-02"] },
      { label: "api-gw-02 and hr-app-01 run Log4j 2.17.1, the other two do not use Log4j", matches: ["2.17.1", "patched", "not used", "inventory"] },
      { label: "no outbound connection or DNS query to 203.0.113.45 and no child process on api-gw-02", matches: ["203.0.113.45", "no outbound", "no dns", "no child", "egress"] },
    ],
    explanation:
      "This is a real exploit attempt, so it is a true positive, but it failed. The vulnerable behaviour needs an unpatched Log4j that calls back out. Both Java servers run the fixed 2.17.1, the others do not use Log4j, egress is denied by default, no server tried to reach 203.0.113.45 and nothing ran on api-gw-02. Handle it yourself: block the scanner, switch the api-gw-02 WAF from monitor-only to blocking, and close the case.",
  },
  "SL-1024": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "the caller was verified only with an employee ID and date of birth, with no callback or manager approval", matches: ["inc-5588", "date of birth", "callback", "verification", "no callback", "employee id"] },
      { label: "a new MFA method was registered from 192.0.2.64, a hosting-provider address, on an unmanaged device", matches: ["192.0.2.64", "new mfa", "authenticator", "unmanaged", "hosting"] },
      { label: "a.menon is on leave and the account then exported the payee list and requested a bank detail change", matches: ["leave", "payee", "northwind", "bank detail", "exported"] },
    ],
    explanation:
      "The reset was done on a weak check by phone, the next sign-in came from a rented server on an unknown computer, and the attacker registered their own MFA device. Meanwhile a.menon is on leave. Within 20 minutes the account exported the supplier list and asked to change Northwind Freight's bank details, a payment fraud pattern. Escalate now so the account is locked, the bank change is stopped and Finance is warned.",
  },
  "SL-1025": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "one outside address (198.51.100.219) tried 207 accounts, about two attempts each, in alphabetical order", matches: ["198.51.100.219", "207", "alphabetical", "spray"] },
      { label: "e.mathew signed in once with a password only, no MFA, over legacy IMAP", matches: ["e.mathew", "no mfa", "imap", "legacy", "exception"] },
      { label: "the account then read 340 messages including the Invoices mailbox, and later attempts on other apps were blocked", matches: ["340", "invoices", "blocked", "conditional access"] },
    ],
    explanation:
      "Many accounts with one or two failures each, in alphabetical order, from a hosting-provider address is password spraying. It stays under the lockout limit of 10, so no account locked. One of the 207 worked. e.mathew has no MFA because the legacy-authentication exception from INC-4710 expired on 30 June and was never removed, so a password alone was enough over IMAP, and 340 messages were read including the Invoices mailbox. Conditional access blocked the later attempts on SharePoint and Outlook on the web. Escalate now: reset the password, revoke sessions, remove the exception and check the Invoices mailbox for supplier or bank detail changes.",
  },
  "SL-1026": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "a signed CallBridge update dropped vxcore2.dll, which started rundll32 and a command prompt", matches: ["vxcore2", "rundll32", "cmd.exe", "systeminfo", "18.12.4"] },
      { label: "beacons every 300 seconds to api-voxline-cdn.test, not the supplier's real domain", matches: ["api-voxline-cdn", "300", "beacon", "voxline.test"] },
      { label: "five computers show the same behaviour and the supplier lists no 18.12.4", matches: ["five", "5 computers", "5 hosts", "sales-ws-031", "18.12.3", "no release"] },
    ],
    explanation:
      "A valid signature does not prove an update is safe. The new DLL was not in the supplier's package, it started rundll32 and system information commands, and the computers contact a look-alike domain every five minutes. Five computers have the same behaviour and the supplier shows no such version, which points to a compromised update. Escalate now: isolate the five hosts, block the domain and hold the update.",
  },
  "SL-1027": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "shadow copies and recovery were deleted and lk.exe is renaming files on FS-02", matches: ["vssadmin", "shadow", "lk.exe", "renamed", "3,812", "h9p2k", "wbadmin", "bcdedit"] },
      { label: "adm.rkulkarni logged in over the VPN from an unknown address without MFA, then used HR-WS-088 and PsExec", matches: ["adm.rkulkarni", "203.0.113.12", "no mfa", "hr-ws-088", "10.20.7.88", "psexec", "vpn"] },
      { label: "FS-03 was attacked and blocked, and the 01:00 backup is intact on an immutable store", matches: ["fs-03", "blocked", "01:00", "backup", "immutable"] },
    ],
    explanation:
      "Shadow copies, boot recovery and the backup catalog were removed and an unsigned program began renaming files, which is ransomware in progress. It came in through an administrator account used over a VPN with no MFA, then a workstation and PsExec. FS-03 was already targeted. There was no planned work. The clean 01:00 backup helps recovery, but the first job is to stop the spread, so escalate immediately and isolate FS-02, HR-WS-088 and the account.",
  },
  "SL-1028": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "the key ending 7Q3M was used from 203.0.113.99 in eu-north-1, where it has never been used", matches: ["7q3m", "203.0.113.99", "eu-north-1", "new region", "new address"] },
      { label: "the key was committed in a repository made public at 09:40", matches: ["public", "repository", "deploy-scripts", "7c1d2e", "d.mehra", "secret scanning"] },
      { label: "eight GPU servers were started with a miner and a new admin user backup-ops2 was created", matches: ["backup-ops2", "8", "eight", "gpu", "miner", "mining", "g5.12xlarge"] },
    ],
    explanation:
      "The pipeline's key was used from an unknown address in a region the company never uses. It had been committed to a repository that was made public at 09:40, and an unread secret scanning alert sat there from 09:43. The attacker started eight GPU servers that run a miner and created a new administrator user with its own key, so they can return even after the first key is revoked. Escalate now to revoke both keys, remove the new user and instances, and check for anything else created.",
  },
  "SL-1029": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "p.rao approved DocuViewer Pro, an unverified three-day-old app, with mail, file and offline access", matches: ["docuviewer", "unverified", "not verified", "consent", "offline access", "pixelgrove"] },
      { label: "the app read about 2,140 emails, searched for invoice, wire and bank details, and sent 12 emails with the same link", matches: ["2,140", "invoice", "wire", "bank details", "12 messages", "12 emails", "sent"] },
      { label: "k.bhat and m.das also approved the app and p.rao's sign-ins are normal", matches: ["k.bhat", "m.das", "no password", "normal sign-in", "mfa passed", "198.51.100.188"] },
    ],
    explanation:
      "Nobody's password or MFA was stolen: p.rao's sign-ins are normal. The attacker tricked users into approving a malicious app, which now holds a long-lived token to read and send mail without signing in. It has read about 2,100 emails, searched for payment words and spread itself with 12 more emails. Two more users approved it. Escalate now to remove the app's consent for all users, revoke its tokens, and review mail it sent.",
  },
  "SL-1030": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "all queries came from ShieldSenseSvc.exe, signed by ShieldSense Inc., the company's endpoint security agent", matches: ["shieldsensesvc", "shieldsense", "signed", "agent"] },
      { label: "the domain is the one in the vendor's release note and v7.4 is in the approved software list under CHG-2287", matches: ["chg-2287", "release note", "approved", "documented", "lookup.shieldsense-cloud.test"] },
      { label: "the queries match the 13:00 full-disk scan and 38 other laptops show the same pattern", matches: ["13:00", "scan", "38 other", "fleet", "other laptops"] },
    ],
    explanation:
      "The lookups came from the company's own signed security agent talking to its documented domain, during the scheduled full-disk scan. The queries started at 13:02 and stopped when the scan ended, and 38 other laptops show the same pattern in proportion to files scanned. No other program, new domain or large upload is involved. Close it as a false positive and tune the rule for this agent and domain.",
  },
  "SL-1031": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "the visitor told the bot to ignore its rules and enter 'maintenance mode', then asked for other customers' accounts", matches: ["ignore", "maintenance mode", "prompt injection", "instructions", "88213", "override"] },
      { label: "the bot looked up and printed records for 41 other accounts (112 shipments) with names and addresses", matches: ["41", "112", "lookup_shipments", "other customers", "other accounts", "printed", "returned"] },
      { label: "the bot's tool can read every account and the only limit was a written rule", matches: ["every account", "every customer", "all accounts", "written rule", "no check", "service account", "permission", "over-permission", "does not check"] },
    ],
    explanation:
      "The visitor typed instructions that talked the bot out of its rules, and the bot then looked up 41 accounts that were not theirs and printed names, addresses and shipment details. The rule 'only answer about the signed-in customer' exists only as text in the bot's instructions. The lookup tool can read every account and the API never checks who is signed in. The visitor's own account is two days old and the same address probed the bot yesterday. Escalate now so the tool can be limited or switched off, the customers can be identified, and the privacy team can decide what to report.",
  },
  "SL-1032": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "the call came on an external line with the CFO's name on the caller ID, while the CFO was in a board meeting and asked for no payment", matches: ["external", "caller id", "board meeting", "no payment", "asked for no payment", "4107", "c.rivera", "assistant"] },
      { label: "the email came from harborpine-pay.test, a look-alike domain registered five days ago, with new bank details", matches: ["harborpine-pay", "look-alike", "lookalike", "five days", "5 days", "new bank", "bank details"] },
      { label: "payment PR-30417 for $186,400 to a new beneficiary is still waiting for second approval and can be stopped", matches: ["pr-30417", "186,400", "second approval", "not yet released", "stop", "hold", "eastbridge", "m.iyer"] },
    ],
    explanation:
      "The caller used the CFO's name and a very convincing voice, but the call came from an outside number while the real CFO was in a board meeting, and the CFO's assistant confirms no payment was asked for. The email came from a five-day-old look-alike domain with new bank details, the supplier is not on the approved list, and the same number rang two other finance staff this week. How real a voice sounds proves nothing. The payment has not been released, so escalate now and have it stopped before the 16:00 bank release.",
  },
  "SL-1033": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "the email passed SPF, DKIM and DMARC and was personalised, but the domain brightwell-ledger.test was registered 6 days ago", matches: ["spf", "dkim", "dmarc", "6 days", "six days", "brightwell-ledger", "registered", "personalised", "personalized"] },
      { label: "d.kamath submitted a password on the fake sign-in page at 11:09, and n.dsouza and t.pillai only clicked", matches: ["d.kamath", "11:09", "post", "submitted", "typed", "n.dsouza", "t.pillai", "docs-brightwell"] },
      { label: "someone signed in as d.kamath from 203.0.113.118 using the stolen session, created a hiding rule and sent 6 emails to vendors", matches: ["203.0.113.118", "11:24", "session", "token", "mailbox rule", "rule", "6 emails", "six emails", "vendors", "bank details"] },
    ],
    explanation:
      "Good writing and passing email checks mean nothing here: anyone can register a domain, set it up correctly and have an AI write fluent, personalised messages. What gives it away is a six-day-old domain and a fake Microsoft sign-in page. d.kamath typed a password at 11:09, the page passed on the sign-in session, and at 11:24 someone signed in from a hosting provider, hid invoice emails with a mailbox rule and emailed six vendors asking for new bank details. Escalate now to reset the account and sessions, remove the rule, warn the vendors and clear the other 37 mailboxes.",
  },
  "SL-1034": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "the upload went to the company's own tenant of Lumen Workspace Enterprise, an approved tool (AI-APP-006) allowed up to Confidential", matches: ["approved", "ai-app-006", "company tenant", "own tenant", "lumen", "up to confidential", "enterprise"] },
      { label: "s.rajan signed in with company single sign-on and MFA from a managed laptop and has not visited personal AI sites", matches: ["single sign-on", "sso", "mfa", "managed", "cs-lt-019", "personal ai", "no visits"] },
      { label: "there is a business reason: ticket CS-2210, the user's role, and 17 similar uploads by the 14 licensed users", matches: ["cs-2210", "ticket", "churn", "14", "17", "role", "manager", "licensed"] },
    ],
    explanation:
      "The rule fires on any website in the AI category, but this upload went to the company's own tenant of an approved enterprise tool that is allowed to hold Confidential data, under contract, with no training on our data. s.rajan used company sign-on with MFA from a managed laptop, the work is covered by ticket CS-2210 and the manager confirms it, and the 14 licensed users have done the same 17 times this week. Close it as a false positive and ask for the rule to allow the approved tenant while still alerting on personal and unapproved AI sites.",
  },
  "SL-1035": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "the key was used from seven hosting-provider addresses in three countries, including 203.0.113.250 and 198.51.100.17, and none came from the app server since 10:10", matches: ["203.0.113.250", "198.51.100.17", "seven", "7 addresses", "three countries", "hosting", "new address", "app server"] },
      { label: "usage is 190 million tokens against a normal 1.2 million, on the three largest models, costing about $4,800 so far", matches: ["190 million", "1.2 million", "4,800", "19,000", "largest models", "cost", "bill", "spike", "volume"] },
      { label: "the first calls listed the models and checked whether prompts were logged, and the key sat in a public repository for nine days", matches: ["listmodels", "list models", "logging", "prompts", "public repository", "ds-notebooks", "nine days", "9 days", "secret scanning", "exposed"] },
    ],
    explanation:
      "The key belongs to one app server and one small model, yet it is now used from seven hosting-provider addresses in three countries, on the three largest models, at about 30 times the normal request volume and 150 times the normal tokens. The first calls listed the models and checked whether prompts were being logged, which is what someone testing a stolen key does. The key was in a public repository for nine days with an unread secret scanning alert, and the same file also exposed a read key for the training data bucket. Escalate now to revoke and replace both keys, review the bucket's access log, and set spending limits.",
  },
  "SL-1036": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "the supplier PDF held hidden white text telling the assistant to send three contracts to reports@docsync-archive.test and not tell the user", matches: ["hidden", "white text", "white on white", "pdf", "prompt injection", "instruction", "do not tell", "rate card"] },
      { label: "the assistant sent three Confidential contracts to docsync-archive.test, a domain registered four days ago, without asking the user", matches: ["three", "3 attachments", "contracts", "docsync", "confidential", "09:41", "four days", "4 days", "without asking", "not asked", "no approval"] },
      { label: "k.rana's assistant also sent mail outside at 09:58 after reading the same PDF", matches: ["k.rana", "09:58", "second user", "another user", "other users", "two users", "same pdf"] },
    ],
    explanation:
      "Nobody typed a malicious request. The supplier's PDF carried hidden white text that told the assistant to find three recent contracts, send them to an outside address and not tell the user. The assistant treated that text as an instruction, used m.sharma's own permissions to email three Confidential files to a domain registered four days ago, and gave her a normal-looking summary. It was allowed to send to any address without asking. A second user's assistant did the same at 09:58. Escalate now as critical to stop the assistant sending mail, purge the PDF from every mailbox, and tell the contract owners.",
  },
  "SL-1037": {
    verdict: "tp",
    escalate: false,
    evidence: [
      { label: "on all six computers Word started wscript and then PowerShell with a hidden window and encoded command, and EDR ended the chain each time", matches: ["wscript", "powershell", "encoded", "hidden window", "word", "macro", "edr", "blocked", "ended", "six"] },
      { label: "every file has a different hash, so the lookups return no record, which does not mean the files are safe", matches: ["different hash", "no record", "every file", "each file", "polymorphic", "unique", "not safe", "does not mean", "unknown", "hash"] },
      { label: "nothing was left behind and no computer connected out, and the sender domain freightdocs-portal.test is four days old", matches: ["no connection", "no network", "nothing left", "full scan", "no persistence", "no startup", "freightdocs-portal", "four days", "4 days", "contained"] },
    ],
    explanation:
      "This is a real attack: a macro document starts a script engine and then a hidden, encoded PowerShell, from a sender domain registered four days ago. The hash lookups return nothing because every copy of the file is different, so they say nothing about safety. The behaviour is what matters. Prevention mode ended the chain within seconds on all six computers, nothing connected out, and the scans found nothing left behind. Handle it at Level 1: block the sender domain, remove the emails and tell the six users. Escalation is not needed because it was contained at the first step.",
  },
  "SL-1038": {
    verdict: "tp",
    escalate: true,
    evidence: [
      { label: "the add-on sends the text of every page, including ERP payment batches with supplier bank details, to api.sumly-ai.test", matches: ["api.sumly-ai", "page text", "erp", "payment batch", "bank", "uploads", "collect", "supplier"] },
      { label: "version 2.1.0, three days ago, widened its access to all websites, and the publisher changed two weeks ago", matches: ["2.1.0", "three days", "3 days", "all websites", "every website", "permission", "publisher", "sumly labs", "changed", "update"] },
      { label: "14 computers have it, six in Finance, and it is not on the approved add-on list", matches: ["14", "six", "finance", "not approved", "not on the approved", "approved list", "unapproved"] },
    ],
    explanation:
      "The add-on started as a harmless page summariser, then changed owner and, three days ago, updated itself to read every website. It now uploads the full text of each page to api.sumly-ai.test, including payment batches, supplier bank details and bank portal pages from six Finance users. It is not on the approved list and browser policy lets users install add-ons. Typed passwords were not seen, but the access would allow it. Escalate now to remove the add-on by policy, block the domain, work out what was sent and warn Finance.",
  },
  "SL-1039": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "the encoded text decodes to a log-archiving command (Get-ChildItem, Compress-Archive), shown in the script block log", matches: ["decod", "get-childitem", "compress-archive", "archiv", "script block", "4104"] },
      { label: "v.joshi started it by PowerShell remoting from JUMP-ADM-01, as on 41 earlier days", matches: ["jump-adm-01", "remoting", "wsmprovhost", "41", "usual", "normal"] },
      { label: "incident INC-5604 (disk nearly full) and the ticket note describe this exact work", matches: ["inc-5604", "ticket", "disk", "d: drive", "space", "full"] },
      { label: "no network connections were opened and no files were deleted", matches: ["no network", "no connection", "not deleted", "nothing deleted", "no files deleted", "none"] },
    ],
    explanation:
      "An encoded command is a reason to look, not a verdict. The script block log shows the decoded text: it zips application logs older than 30 days on SRV-FS-03. v.joshi ran it by PowerShell remoting from JUMP-ADM-01, which is how this account works on 41 of the last 90 days, and incident INC-5604 (D: drive nearly full) and the ticket note describe the same job. The script opened no connections and deleted nothing. Close it as a false positive and suggest tuning the rule for administrators on the jump server.",
  },
  "SL-1040": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "the command was started by the NorthVault backup agent (NVAgent.exe) as part of backup job 4471", matches: ["nvagent", "northvault", "backup agent", "backup job", "job 4471", "svc-backup"] },
      { label: "it deleted only the oldest snapshot (/oldest) because the policy keeps two, not all of them", matches: ["oldest", "/oldest", "keeps 2", "keep 2", "retention", "policy", "not all"] },
      { label: "the same command runs every night on FS-01, FS-02 and FS-03, 14 nights in a row", matches: ["14", "every night", "nightly", "fs-01", "fs-03", "same command"] },
      { label: "nothing else happened on the server: no file changes, no new services, and the backup succeeded", matches: ["no file", "no rename", "encrypt", "succeeded", "success", "verification", "restore", "nothing else"] },
    ],
    explanation:
      "Deleting shadow copies is what ransomware does first, but so does backup software cleaning up. Here the parent process is the NorthVault agent, the command is 'delete shadows /oldest' (one snapshot, not all), the backup job log says the policy keeps two snapshots, and the same command ran on 14 nights on three servers. Afterwards there are no file renames, no new services and no outside connections, and the backup finished with a successful test restore. Close it as a false positive and suggest excluding exactly this command from this agent.",
  },
  "SL-1041": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "the task was created by msiexec during an installation that g.thomas started from Software Center", matches: ["msiexec", "software center", "installer", "install", "catalogue", "catalog"] },
      { label: "NorthPDF Reader 12 is approved software and updater.exe is signed by NorthPDF Ltd", matches: ["northpdf", "approved", "signed", "signer", "sr-2207"] },
      { label: "14 other computers have the same task, all installed from Software Center", matches: ["14", "other computers", "same task", "known hash", "0 detections"] },
    ],
    explanation:
      "A new scheduled task can be how malware survives a restart, but this one was created by the installer of an approved program that g.thomas installed from Software Center two minutes earlier. The task runs a file signed by NorthPDF Ltd with a known clean hash, and 14 other computers have the same task from the same installer. The only connection so far is a version check to the vendor's update site. Close it as a false positive and suggest excluding this signed installer.",
  },
  "SL-1042": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "the matched text is an apostrophe and a double dash in a product search: Rock'n'Roll tee -- size M", matches: ["rock", "apostrophe", "--", "search", "tee", "'"] },
      { label: "the shop answered normally: 200, no results, no errors, no database problems", matches: ["200", "0 results", "no results", "no error", "no 500", "parameteris", "no database"] },
      { label: "the visitor searched again, then paid for an order, and the same rule fires for other ordinary customers", matches: ["checkout", "order", "cart", "paid", "bought", "other customers", "o'brien", "7 days", "different addresses"] },
    ],
    explanation:
      "The rule matched an apostrophe and '--' in a customer's search for a band T-shirt. The shop returned a normal 8 KB page with no results, with no server or database errors and nothing unusually large. The same visitor rephrased the search, added the shirt to the cart and paid, and the same rule fired for 19 other ordinary customers this week with the same harmless answers. Close it as a false positive and suggest scoring a single match on /search lower.",
  },
  "SL-1043": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "the sign-in came from the printer MFP-FLR3-03 (10.20.60.23), inside the printer network the exception allows", matches: ["10.20.60.23", "mfp", "printer", "10.20.60.0/24"] },
      { label: "conditional access exception CHG-2188 approves SMTP AUTH without MFA for this account from the printer network only, with a review date", matches: ["chg-2188", "exception", "approved", "smtp", "review"] },
      { label: "it matches 30 nights of identical 02:00 sign-ins and the scheduled counter report to finance-ops", matches: ["02:00", "30", "every night", "counter report", "scheduled", "finance-ops", "same pattern"] },
      { label: "the mailbox shows one internal email, no forwarding, no rules and no outside recipients", matches: ["one email", "1 message", "internal", "no forwarding", "no rules", "no outside", "finance-ops"] },
    ],
    explanation:
      "A password-only sign-in with a legacy protocol at 02:00 is exactly what a stolen service password would look like, so the answer is in the details. The sign-in came from the printer's own address, which is the only network CHG-2188 allows, and it repeats 30 nights in a row at 02:00 to send the scheduled counter report. The mailbox shows one internal message and no rules or forwarding, and the account has never signed in from anywhere else. Close it as a false positive, and keep the review date of the exception in mind.",
  },
  "SL-1044": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "the users were sent the link by an email from Brightlane Creative, a known vendor, passing SPF, DKIM and DMARC", matches: ["brightlane", "maya", "email", "spf", "dkim", "vendor", "agency", "sender"] },
      { label: "the vendor register and campaign plan show the agency building the Winter Sale microsite for launch on 2026-11-03", matches: ["winter sale", "campaign", "contract", "vendor register", "launch", "microsite", "approved"] },
      { label: "the visitors only viewed pages and posted one feedback comment: no downloads, no sign-in form, no password", matches: ["no download", "no sign-in", "no password", "feedback", "comment", "post", "only viewed"] },
      { label: "the domain is six days old with a privacy service and shared hosting, but has no detections", matches: ["6 days", "six days", "privacy", "shared", "0 detections", "no detections", "registered"] },
    ],
    explanation:
      "A six-day-old domain with hidden registrant details is what a phishing site often looks like, but every other fact points to a business reason. The four users received an email from the agency Brightlane Creative, a vendor with a contract and 14 earlier emails, passing all email checks and asking for feedback on the Winter Sale preview. The page has no sign-in form or download, the only data sent was a comment, and Marketing confirmed the agency promised the preview. Close it as a false positive and suggest lowering severity for domains of vendors in the register.",
  },
  "SL-1045": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "203.0.113.55 is one of the two addresses Redwater Security gave for pentest SEC-PT-77", matches: ["203.0.113.55", "redwater", "sec-pt-77", "pentest", "penetration"] },
      { label: "the traffic is inside the approved window and scope: the portal only, today, with the X-Pentest-Id header RW-0077", matches: ["window", "scope", "x-pentest-id", "rw-0077", "portal", "in scope", "within"] },
      { label: "nothing got through: the attack patterns were blocked, with no 500 errors and no new accounts", matches: ["blocked", "0 allowed", "no 500", "no new account", "403", "401", "nothing got through", "did not get through"] },
      { label: "IT Security asked the SOC not to block or escalate these addresses during the window", matches: ["notice", "email from it security", "not block", "not escalate", "do not block", "it security"] },
    ],
    explanation:
      "1,840 blocked attack patterns from one address looks like an attack, and a real one would be treated as one. This address, the day, the time, the single target and the X-Pentest-Id header all match engagement SEC-PT-77, signed by the CISO, and IT Security told the SOC not to block or escalate these addresses. The WAF blocked every attack pattern, the portal had no errors or new accounts, and nothing else was touched. Close it as a false positive, keep logging, and suggest tagging approved test windows in the rule.",
  },
  "SL-1046": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "the call came from +1 555 0142, the CFO's company mobile listed in the staff directory", matches: ["0142", "company mobile", "directory", "caller id", "registered", "staff directory"] },
      { label: "the SOC called the CFO back on the directory number and he, then his assistant, confirmed the request", matches: ["callback", "called back", "call back", "confirmed", "c.rivera", "assistant"] },
      { label: "PR-30502 is a normal payment: approved supplier, same bank account, matching purchase order and invoice, already approved by the CFO", matches: ["pr-30502", "po-88213", "marlowe", "same bank", "approved supplier", "invoice", "first approval", "already approved"] },
      { label: "the payment still needs the Controller's second approval and has not been released", matches: ["second approval", "m.iyer", "controller", "not released", "17:00"] },
    ],
    explanation:
      "A voice that sounds like the CFO proves nothing, and n.fernandes was right to report it. What settles it is everything that does not depend on the voice: the call came from the CFO's company mobile in the staff directory, and a callback to that directory number was answered by the CFO and confirmed by his assistant. The payment is also normal: a supplier on the approved list since 2025 with an unchanged bank account, a matching purchase order and invoice, and the CFO's approval already in the system. It still needs the Controller's approval before release. Close it as a false positive and thank the clerk for following the procedure.",
  },
  "SL-1047": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "the destination 203.0.113.171 belongs to CloudVault Offsite Ltd, the company's offsite backup provider (contract CNT-0412)", matches: ["cloudvault", "offsite", "backup provider", "cnt-0412", "vendor"] },
      { label: "the firewall rule OFFSITE-BACKUP (CHG-2044) allows exactly this host to this address on port 443", matches: ["chg-2044", "offsite-backup", "firewall rule", "allowed", "443"] },
      { label: "38 GB matches the monthly full copy: 35 to 38 GB on the last three months, plus nightly incrementals", matches: ["monthly full", "36.9", "37.7", "35.2", "monthly", "history", "previous", "last three"] },
      { label: "the host sent nothing anywhere else and no incidents involve it", matches: ["nothing else", "no other", "no incident", "only", "internal"] },
    ],
    explanation:
      "38 GB leaving at night to an outside address is what data theft looks like, but every fact here points to the backup job. The address belongs to CloudVault Offsite, the company's backup provider under contract CNT-0412, and a firewall rule approved in CHG-2044 allows exactly this host to reach it on 443. The size matches the monthly full copy on the last three months (35 to 38 GB), the time matches the 01:30 schedule, and the host contacted nothing else. Close it as a false positive and suggest raising the threshold for this approved route.",
  },
  "SL-1048": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "the mail came from the SendBridge marketing platform (198.51.100.150 to .152), not from the marketing@ mailbox itself", matches: ["sendbridge", "platform", "198.51.100.150", "not from the mailbox", "0 messages", "marketing platform"] },
      { label: "SPF, DKIM and DMARC all pass, and the platform is on the approved marketing tools list", matches: ["spf", "dkim", "dmarc", "pass", "approved", "authenticat"] },
      { label: "campaign MKT-311 was approved and scheduled for 10:00, and the recipients are opted-in customers from the CRM", matches: ["mkt-311", "campaign", "approved", "scheduled", "opted", "crm", "10:00"] },
      { label: "the messages contain only company and tracking links, an unsubscribe link and no request for logins or payment", matches: ["unsubscribe", "links", "tracking", "no request", "no attachment", "harborpine.test/winter"] },
    ],
    explanation:
      "A burst from one sender is what a hijacked mailbox sending spam looks like, but here the mail came from SendBridge, the approved marketing platform, not from the mailbox itself, and every message passes SPF, DKIM and DMARC. The campaign record shows MKT-311, approved on 2026-10-22 and scheduled for 10:00, going to opted-in customers, and the previous campaign was almost the same size at the same time. The links are the company's own pages and the platform's tracking domain, with an unsubscribe link and no request for a login or payment. Close it as a false positive and suggest tuning for the approved platform.",
  },
  "SL-1049": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "the deleted folders match the scope of approved ticket CHG-2418, and Final and Contracts were not touched", matches: ["chg-2418", "working", "final", "contracts"] },
      { label: "p.dutta owns the site, is active and is moving to another project, and signed in normally with MFA", matches: ["owner", "active", "borealis", "mfa", "pmo-lt-009"] },
      { label: "all 1,206 items are in the recycle bin and a protected retention copy exists", matches: ["recycle bin", "retention", "1,206"] },
    ],
    explanation:
      "1,206 deletions in 14 minutes in the evening looks like destruction, but the details do not fit. p.dutta owns the site, the eight folders deleted are exactly the working folders listed in the approved ticket CHG-2418, and Final and Contracts were not touched. p.dutta is active and moving to another project rather than leaving, and signed in with MFA from the usual laptop. Nothing is lost: the items are in the recycle bin and a protected retention copy exists. Close as a false positive and suggest tuning for approved site closures.",
  },
  "SL-1050": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "all requests came from the machine learning cluster 10.20.12.31 to .38, the network this key has always used", matches: ["10.20.12", "ml cluster", "cluster", "same network", "usual", "only", "internal"] },
      { label: "only the embedding model text-embedding-large was called, no chat or text-generation and no key management calls", matches: ["text-embedding-large", "embedding", "no chat", "no text-generation", "only", "listmodels", "no key"] },
      { label: "project AIP-0091 (480,000 contract pages) is approved with a $900 per day budget, and the job started at 13:00", matches: ["aip-0091", "contract search", "approved", "$900", "480,000", "13:00", "batch"] },
      { label: "the $300 threshold was set before the project and the key shows no sign of exposure", matches: ["threshold", "out of date", "not raised", "no exposure", "not found", "exposure scan"] },
    ],
    explanation:
      "Six times the usual spend is what a leaked key being used by someone else looks like, but the pattern is the opposite. All 1.3 million requests came from the eight nodes of the ML cluster the key has always used, they call only the embedding model, and no one probed the key's settings. Data governance approved project AIP-0091 (480,000 contract pages, up to $900 a day), the batch job started at 13:00 and the $300 alert threshold was simply never raised. The key is not in any public repository. Close it as a false positive and suggest raising the threshold with the project.",
  },
  "SL-1051": {
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "n.kulkarni asked for the send in her own words and clicked Send after the assistant asked to confirm", matches: ["asked", "typed", "user message", "confirmed", "clicked send", "confirm"] },
      { label: "the assistant read only the NDA, which has no instructions in it, and sent nothing else", matches: ["only the nda", "no instructions", "read only", "nothing else", "only one", "no other"] },
      { label: "partner-ardent.test is an approved partner under a signed mutual NDA, and the partner had asked for the signed copy", matches: ["approved", "partner", "ardent", "mutual nda", "asked for", "2026-10-22"] },
      { label: "the assistant's policy allows sending to approved partner domains after confirmation, and the file is classed Internal", matches: ["policy", "allowed", "internal", "approved partner", "confirmation", "not confidential"] },
    ],
    explanation:
      "An AI assistant emailing a file outside is exactly what injected instructions cause, so the check is where the instruction came from. Here n.kulkarni typed the request, the assistant showed the recipient and file and waited for her to click Send, and the only file it read was the NDA, which holds no instructions. Ardent Logistics is an approved partner with a signed mutual NDA who had asked for the copy, and the assistant's policy allows sending Internal files to approved partners after confirmation. Close it as a false positive and suggest lowering severity for policy-approved sends.",
  },
};
