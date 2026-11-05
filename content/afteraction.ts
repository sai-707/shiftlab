export const TACTICS = [
  "Initial Access",
  "Execution",
  "Persistence",
  "Credential Access",
  "Discovery",
  "Lateral Movement",
  "Collection",
  "Command and Control",
  "Exfiltration",
  "Impact",
] as const;

/** Rule tuning questions for false-positive alerts. The right option is stored on the server. */
export const TUNING: Record<string, { question: string; options: string[] }> = {
  "SL-1002": {
    question: "This newsletter keeps triggering the tracking-link rule. What is the best tuning?",
    options: [
      "Turn the rule off for all email",
      "Allow-list this vendor's tracking domain for this known sender only",
      "Close every redirect alert without reading it",
      "Raise the severity so someone checks each one",
    ],
  },
  "SL-1004": {
    question: "The approved scanner will trigger this again next week. What is the best tuning?",
    options: [
      "Delete the port-scan rule",
      "Ignore all alerts from the 10.20 network",
      "Exclude the approved scanner's address from the rule, keep it for every other host",
      "Ask the scanner team to stop scanning",
    ],
  },
  "SL-1018": {
    question: "Phones with an old saved password lock accounts a few times a month. What is the best tuning?",
    options: [
      "Turn the failed sign-in rule off",
      "Raise the threshold to 100 failures",
      "Lower the severity when every failure comes from one internal device of the same user, and keep it high for outside addresses",
      "Ignore every lockout alert",
    ],
  },
  "SL-1030": {
    question: "The agent will do this at every weekly scan. What is the best tuning?",
    options: [
      "Switch the DNS rule off",
      "Exclude the ShieldSense agent and its documented lookup domain, and keep the rule on for everything else",
      "Raise the threshold to 50,000 queries for all laptops",
      "Ignore alerts on Fridays",
    ],
  },
  "SL-1034": {
    question: "The 14 licensed users will upload files to the approved workspace every week. What is the best tuning?",
    options: [
      "Switch the AI upload rule off",
      "Ignore every alert from the Customer Success team",
      "Allow uploads to the approved company tenant (and keep logging them), and keep alerting on every other AI service",
      "Raise the file-size limit so small files never alert",
    ],
  },
  "SL-1016": {
    question: "Infrastructure patches servers this way every month. What is the best tuning?",
    options: [
      "Disable the PsExec rule",
      "Exclude svc-patch on JUMP-ADM-01 during approved change windows, and keep the rule for everything else",
      "Block PsExec on every server without telling anyone",
      "Lower every EDR alert to low severity",
    ],
  },
  "SL-1007": {
    question: "Antivirus quarantined the EICAR test file again. What should happen to the rule?",
    options: [
      "Keep the rule as it is: EICAR alerts prove the antivirus works and are cheap to close",
      "Disable the malware signature rule",
      "Add every file ending in .txt to an exception list",
      "Raise EICAR to critical",
    ],
  },
  "SL-1009": {
    question: "The 'two countries' sign-in was our own VPN. What is the best tuning?",
    options: [
      "Treat sign-ins from the company VPN exit addresses as one location",
      "Turn off impossible-travel detection",
      "Only alert if the distance is over 20,000 km",
      "Ignore all sign-ins from Germany",
    ],
  },
  "SL-1013": {
    question: "The on-call admin triggered the after-hours alert legitimately. What is the best tuning?",
    options: [
      "Disable out-of-hours alerts for admins",
      "Delete the alert and say nothing",
      "Give every admin a permanent exception",
      "Check the on-call rota or ticket automatically and lower the severity when it matches",
    ],
  },
  "SL-1039": {
    question: "Administrators will keep running encoded commands for scripted work. What is the best tuning?",
    options: [
      "Turn the encoded command rule off",
      "Exclude everything done by administrator accounts",
      "Lower the severity when an administrator starts it through remoting from the jump server, and keep it high for every other parent process and host",
      "Block encoded commands for everyone",
    ],
  },
  "SL-1040": {
    question: "The backup agent will remove old snapshots every night. What is the best tuning?",
    options: [
      "Disable the shadow copy rule",
      "Exclude only 'delete shadows /oldest' started by NVAgent.exe under svc-backup on the backup-managed servers, and keep the rule for '/all' and every other parent process",
      "Exclude vssadmin on every server",
      "Ask the backup team to stop deleting snapshots",
    ],
  },
  "SL-1041": {
    question: "Every approved NorthPDF install will create this task. What is the best tuning?",
    options: [
      "Exclude tasks created by the signed NorthPDF installer from Software Center, and keep the rule for unsigned or unknown programs",
      "Turn the scheduled task rule off for all installers",
      "Ignore every task created by msiexec.exe",
      "Raise the severity of every new task",
    ],
  },
  "SL-1042": {
    question: "Customers will keep typing apostrophes and dashes into the shop search. What is the best tuning?",
    options: [
      "Switch the WAF off for the search page",
      "Block every request that contains an apostrophe",
      "Stop logging rule 942100",
      "Keep the rule on for the whole site, but alert on the search page only when one address triggers it repeatedly or the shop returns errors or unusually large answers",
    ],
  },
  "SL-1043": {
    question: "The printers will keep signing in this way until they are replaced. What is the best tuning?",
    options: [
      "Exclude svc-mfp-mail from 10.20.60.0/24 only, and alert on any other address, protocol or failed sign-in for this account",
      "Remove the MFA requirement for all service accounts",
      "Close every legacy sign-in alert",
      "Raise the threshold so fewer alerts fire",
    ],
  },
  "SL-1044": {
    question: "Marketing launches new campaign sites often. What is the best tuning?",
    options: [
      "Turn off the new-domain rule",
      "Lower the severity for new domains that belong to vendors in the vendor register, and keep it for every other domain",
      "Exclude every domain registered behind a privacy service",
      "Block all domains younger than 90 days",
    ],
  },
  "SL-1045": {
    question: "The SOC will see this again at every penetration test. What is the best tuning?",
    options: [
      "Disable the WAF threshold rule",
      "Ignore any request that carries an X-Pentest-Id header",
      "Raise the threshold to 5,000 blocked requests",
      "Let the engagement record tag the approved test addresses for the approved window and scope, lower the severity there, and keep alerting outside it or on other targets",
    ],
  },
  "SL-1046": {
    question: "The clerk did the right thing and the callback settled it. What would improve the process?",
    options: [
      "Stop clerks from reporting calls from the CFO",
      "Release payments after any call that sounds like the CFO",
      "Show directory numbers as verified staff numbers on the phone display, and keep the callback and second-approval rule for every payment request made by phone",
      "Delete the report once the case is closed",
    ],
  },
  "SL-1047": {
    question: "The backup repository will send this much to the provider every month. What is the best tuning?",
    options: [
      "Turn off the large outbound transfer rule",
      "Allow any transfer to any cloud storage provider",
      "Raise the threshold only for BKP-REPO-01 to 203.0.113.171 on port 443, and keep it for every other host and destination",
      "Ask the backup team to send less data",
    ],
  },
  "SL-1048": {
    question: "Marketing will send campaigns like this every few weeks. What is the best tuning?",
    options: [
      "Raise the volume threshold for every sender to 10,000 an hour",
      "Lower the severity when the mail comes from the approved SendBridge addresses and passes DKIM, and keep it for every other source",
      "Turn off the outbound volume rule",
      "Ignore every alert for the marketing@ address",
    ],
  },
  "SL-1049": {
    question: "Teams will close more project sites like this. What is the best tuning?",
    options: [
      "Turn off the mass delete rule",
      "Raise the threshold to 5,000 files for everyone",
      "Lower the severity when the deleter owns the site, an approved change ticket covers it and a retention copy exists, and keep it for every other case",
      "Ignore every deletion made in the evening",
    ],
  },
  "SL-1050": {
    question: "The data science project will run for five days at this spend. What is the best tuning?",
    options: [
      "Turn off the daily spend alert",
      "Raise this key's threshold to match the approved $900 budget for the project's dates, and keep the alert for every other key",
      "Delete the key after each project",
      "Raise every key's threshold to $1,000",
    ],
  },
  "SL-1051": {
    question: "The assistant will send files to approved partners all the time. What is the best tuning?",
    options: [
      "Stop the assistant from sending any email",
      "Alert only when the assistant sends to a domain that is not on the partner list",
      "Lower the severity when the assistant's policy allows the send (approved partner, Internal file, user confirmed), and keep it high for any other outside send",
      "Close every assistant alert without reading it",
    ],
  },
};
