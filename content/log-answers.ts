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
};
