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
    escalate: false,
    evidence: [
      { label: "p.sharma opened a link to the fake page harborpine-sso.test", matches: ["sharma", "harborpine-sso"] },
      { label: "no form was submitted (no POST) and no new sign-in followed", matches: ["no post", "no sign-in", "nothing was entered"] },
      { label: "other recipients and the blocked click by f.reyes", matches: ["reyes", "recipients", "blocked"] },
    ],
    explanation:
      "This is a real phishing email with an adversary-in-the-middle page, so it is a true positive. But it is contained: the proxy shows p.sharma only loaded the page and sent no form data, the identity log shows no sign-in from a new address and no MFA or mailbox changes, and f.reyes's click was blocked. Handle it yourself: block the domain, remove the email from the other mailboxes and tell both users. It would become an escalation if a POST or a new sign-in appeared.",
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
    verdict: "fp",
    escalate: false,
    evidence: [
      { label: "both sign-ins came from the same managed, compliant device (dev-7731) and the same browser", matches: ["dev-7731", "same device", "managed", "compliant", "ops-lt-044"] },
      { label: "change CHG-2291 started the gateway pilot at 09:00 and routes pilot laptops through Frankfurt (192.0.2.128/26)", matches: ["chg-2291", "edgeshield", "gateway", "pilot", "192.0.2.128"] },
      { label: "other Operations pilot users show the same pattern and nobody outside the group does", matches: ["k.thomas", "a.bhatt", "d.menon", "other users", "operations", "pilot group"] },
    ],
    explanation:
      "The laptop never moved. Its web traffic started leaving through the new gateway's Frankfurt data centre when the pilot began at 09:00, and the same managed device, same browser and normal activity follow. Other Operations users show the same pattern and nobody outside the pilot does. Close it as a false positive and ask for the gateway range to be treated as a known location.",
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
};
