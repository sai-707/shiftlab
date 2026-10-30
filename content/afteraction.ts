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
  "SL-1025": {
    question: "More pilot users will move to the gateway over the next weeks. What is the best tuning?",
    options: [
      "Turn the impossible travel rule off",
      "Add the gateway's Frankfurt egress range as a known location in the rule",
      "Ignore every sign-in from managed devices",
      "Raise the rule's threshold to 24 hours",
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
};
