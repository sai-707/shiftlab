export type Evidence = { label: string; text: string };

export type AiDrill = {
  id: string;
  title: string;
  /** The alert the AI assistant was asked to summarise. */
  alert: string;
  evidence: Evidence[];
  /** The AI assistant's draft, one sentence per item. */
  draft: string[];
};

// Answers live on the server in aicheck-keys.ts. One drill has no mistakes on purpose.
export const AI_DRILLS: AiDrill[] = [
  {
    id: "log4shell",
    title: "Exploit strings at two web servers",
    alert: "WAF: Log4Shell exploit strings from one address",
    evidence: [
      { label: "WAF log", text: "14 requests in 2 minutes from 198.51.100.208 to web-app-01 and web-app-02. Each held a ${jndi:ldap:// string in the User-Agent and a query parameter. All were blocked by the WAF with HTTP 403." },
      { label: "Asset list", text: "web-app-01 and web-app-02 run Log4j 2.17.1. They were patched on 4 November." },
      { label: "Firewall log", text: "No outbound connections from web-app-01 or web-app-02 to 198.51.100.208, and none on LDAP ports 389 or 1389, in the 24 hours around the alert." },
      { label: "Intel", text: "198.51.100.208 is a known internet-wide scanner, seen against thousands of sites this week." },
    ],
    draft: [
      "One external address sent 14 requests with Log4Shell exploit strings to two web servers.",
      "The servers run Log4j 2.14.1, which is vulnerable to this attack.",
      "The WAF blocked every request with HTTP 403.",
      "Neither server made an outbound LDAP connection, so no callback happened.",
      "Because the servers are vulnerable and exploit strings arrived, treat this as a successful compromise and escalate.",
    ],
  },
  {
    id: "gateway-travel",
    title: "Two cities, four minutes apart",
    alert: "Identity: impossible travel for s.kapoor",
    evidence: [
      { label: "Sign-in log", text: "s.kapoor signed in from Pune (192.0.2.60) at 10:02 and from Frankfurt (192.0.2.140) at 10:06. MFA was requested and passed both times." },
      { label: "Device record", text: "Both sign-ins came from the managed laptop LT-4471 with the same browser session." },
      { label: "Change record", text: "CHG-2291: from Monday 09:00, staff web traffic goes through the EdgeShield cloud gateway. Exit nodes are in Frankfurt and Dublin. 192.0.2.140 is the Frankfurt exit." },
      { label: "Account activity", text: "No new mailbox rules, no new MFA devices and no downloads outside the user's usual folders since 10:00." },
    ],
    draft: [
      "The user signed in from Pune at 10:02 and Frankfurt at 10:06, which is too fast to travel.",
      "The Frankfurt sign-in used a different laptop from the one used in Pune.",
      "The Frankfurt address is the EdgeShield gateway introduced by CHG-2291.",
      "MFA was not requested for the Frankfurt sign-in.",
      "No suspicious follow-up activity was found, so this is most likely a false positive.",
    ],
  },
  {
    id: "voicemail-phish",
    title: "A fake voicemail email",
    alert: "Mail gateway: reported phishing email, two clicks",
    evidence: [
      { label: "Mail gateway", text: "A 'voicemail' email from vm-notify@voicemail-delivery.test went to 9 staff. SPF failed. The link points to https://login-docshare.test/open." },
      { label: "Proxy log", text: "a.menon opened the link at 08:15 and r.das at 08:22. Both were blocked by the 'newly registered domain' category before the page loaded. There were no POST requests." },
      { label: "Sign-in log", text: "Neither user has signed in from a new location, and neither has changed a password, since 08:00." },
      { label: "Mailboxes", text: "The email is still unopened in the other 7 mailboxes." },
    ],
    draft: [
      "The email came from a sender that failed SPF checks.",
      "Two people clicked the link and both entered their passwords.",
      "Both clicks were blocked before the page loaded.",
      "The email is still in seven mailboxes and should be removed.",
      "Both passwords were stolen, so escalate this as an active account compromise.",
    ],
  },
  {
    id: "phone-lockout",
    title: "A locked account on the staff Wi-Fi",
    alert: "Identity: account lockout for j.thomas",
    evidence: [
      { label: "Sign-in log", text: "j.thomas was locked out at 14:12 after 14 failed sign-ins in 9 minutes. All came from 10.20.4.91 on the staff Wi-Fi, from one device using Outlook mobile." },
      { label: "Directory", text: "The user changed their own password through self-service yesterday at 16:40." },
      { label: "Help desk", text: "Ticket HD-8841 from j.thomas at 14:20: the phone keeps asking for a password and email will not load." },
      { label: "Other activity", text: "No successful sign-in from any other address. 10.20.4.91 has not tried any other account." },
    ],
    draft: [
      "All 14 failed sign-ins came from one internal address, 10.20.4.91.",
      "The user changed their password the day before, and a ticket says their phone cannot sign in.",
      "No other accounts or addresses are involved.",
      "This looks like an old password saved on a phone, not a guessing attack, so close it and ask the user to update the phone.",
    ],
  },
  {
    id: "ransomware-backup",
    title: "Files being renamed overnight",
    alert: "EDR: mass file rename on FS-02",
    evidence: [
      { label: "EDR", text: "At 02:31 an unsigned program, svc-update.exe, started renaming files on FS-02 to .locked. 3,100 files were renamed in 4 minutes and shadow copies were deleted with vssadmin. The process was still running at 02:36." },
      { label: "Ransom note", text: "A file called README_RESTORE.txt was created in 12 folders on FS-02." },
      { label: "Shares", text: "FS-02 holds the Finance and HR shares. Workstation ws-fin-02 still has an open connection to it." },
      { label: "Backups", text: "The nightly backup to immutable storage finished at 01:30. A restore test last Friday passed." },
    ],
    draft: [
      "An unsigned program began renaming files on FS-02 at 02:31 and was still running at 02:36.",
      "Shadow copies were deleted, which is a common ransomware step.",
      "About 3,100 files have been renamed to .locked so far.",
      "Because the backups are immutable and tested, this is low risk and can wait until morning.",
      "The 01:30 backup finished, so files can be restored from it once the host is contained.",
    ],
  },
  {
    id: "deploy-key",
    title: "A leaked key starts new servers",
    alert: "Cloud audit: deploy key used from a new address",
    evidence: [
      { label: "Cloud audit", text: "At 01:48 the deploy key dk-ci-prod, normally used from the CI server 203.0.113.20 in eu-west, was used from 203.0.113.99. It created an admin user, svc-backup2, and started 8 GPU servers in ap-south." },
      { label: "Code host", text: "The key was committed to a public repository at 00:55. The repository was made private again at 01:20." },
      { label: "Billing", text: "The new servers cost an estimated $1,900 a day." },
      { label: "Access log", text: "The key has not read any storage bucket or database so far." },
    ],
    draft: [
      "The key was used from 203.0.113.99, an address it does not normally use.",
      "The key was exposed in a public repository at 00:55.",
      "The attacker started 8 GPU servers in the same region the CI server normally uses.",
      "The attacker also copied data from the company's storage buckets.",
      "The key must be disabled, the new admin user and servers removed, and Level 2 told right away.",
    ],
  },
];
