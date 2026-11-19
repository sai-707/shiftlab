// SERVER ONLY. Imported by app/actions.ts and nowhere else, so answers are never sent to the browser.
export const LOG_ANSWERS: Record<string, { accept: string[]; explain: string }> = {
  q1: { accept: ["25"], explain: "25 failed logins from 203.0.113.58, across the usernames admin, root, test and ubuntu, before the success." },
  q2: { accept: ["admin"], explain: "admin logged in at 02:43:58 after the failures, then ran curl with sudo." },
  q3: { accept: ["13:05:41", "13.05.41"], explain: "The first blocked request was at 13:05:41: a classic ' OR 1=1-- test." },
  q4: { accept: ["fin-ws-114", "10.20.6.114"], explain: "FIN-WS-114 (10.20.6.114) was denied every 60 seconds, which is beaconing." },
  q5: { accept: ["9", "nine"], explain: "Nine prompts between 22:41 and 22:48. The last one was approved." },
  q6: { accept: ["harborpine-hr.test"], explain: "d.okafor posted to harborpine-hr.test, the look-alike credential page." },
  q7: { accept: ["198.51.100.88"], explain: "d.rossi connected from 198.51.100.88 and was assigned 10.20.50.14 on the VPN." },
  q8: { accept: ["203.0.113.140"], explain: "203.0.113.140 sent the phishing email and later signed in to d.okafor's mailbox over IMAP: the stolen password was used." },
  q9: { accept: ["svc-backup2"], explain: "useradd created svc-backup2 at 03:15:45, right after deploy ran it with sudo. A new account made at 03 AM that then joined the sudo group is worth escalating." },
  q10: { accept: ["/tmp/.x/sync.sh", "sync.sh"], explain: "The cron job runs /tmp/.x/sync.sh every minute. A hidden folder under /tmp is a classic place to keep a persistence script." },
  q11: { accept: ["7", "seven"], explain: "Seven failed logons (event 4625) from 10.20.7.60, followed by a success (event 4624) at 04:05:42. Failures then a success looks like guessing a password." },
  q12: { accept: ["helpdesk2"], explain: "Event 4732: helpdesk2 was added to the local Administrators group by svc-print, minutes after that account logged on." },
  q13: { accept: ["04:12:55", "04.12.55", "4:12:55"], explain: "Event 1102 at 04:12:55: someone cleared the Security log. Clearing logs after changing admin rights is an attacker covering their tracks." },
  q14: { accept: ["3389", "rdp"], explain: "Eleven ports were denied, then 3389 (remote desktop) was allowed. After a scan, the open port is the one to check first." },
  q15: { accept: ["203.0.113.200"], explain: "mail.harborpine-login.test points to 203.0.113.200, a domain registered 3 days ago. The real mail server is mail.harborpine.test at 10.20.1.8." },
};
