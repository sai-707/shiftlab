import type { Topic } from "@/lib/types";

export type Playbook = {
  slug: string;
  topic: Topic;
  title: string;
  goal: string;
  whenToUse: string;
  steps: { title: string; detail: string }[];
  signsReal: string[];
  signsBenign: string[];
  escalateWhen: string[];
  mistakes: string[];
  tools: string[];
};

export function topicSlug(topic: Topic): string {
  return topic.toLowerCase().replace(/\s+/g, "-");
}

// Playbooks are the checklists real SOC teams work from. These are simplified, generic versions
// for learning, not a copy of any company's runbook.
export const PLAYBOOKS: Playbook[] = [
  {
    slug: "phishing",
    topic: "Phishing",
    title: "Phishing email",
    goal: "Decide whether an email is a threat, find out whether anyone acted on it, and limit the damage.",
    whenToUse: "A mail gateway alert, a user reporting a suspicious email, or a link-reputation rule firing.",
    steps: [
      { title: "Read the email like a stranger", detail: "Check the From address, the sender's domain letter by letter, the Reply-To address, and any pressure to act fast or share money or login details." },
      { title: "Check who really sent it", detail: "Look at the SPF, DKIM and DMARC results and the sending IP. A failure on a message that claims to be from our own company is a strong warning sign." },
      { title: "Examine the link or attachment without opening it", detail: "Look at the domain's age, any redirects and its reputation. Use the Intel lookup. Never open an attachment on your own machine." },
      { title: "Find out who else received it", detail: "Check how many mailboxes got the same email. Real campaigns usually hit many people; a normal newsletter hits many too, so move on to the next step." },
      { title: "Find out who acted on it", detail: "Search the web proxy for visits to the link, especially form submissions (POST requests), and the endpoint logs for attachments that were opened." },
      { title: "Decide and act", detail: "True positive: block the domain and sender, pull the email from all mailboxes, and reset credentials for anyone who entered them. False positive: note why it is safe and close it." },
    ],
    signsReal: ["Look-alike sender domain", "SPF or DKIM fails", "Urgency plus a request for logins or bank details", "Domain registered a few days ago", "Reply-To points to a free mailbox"],
    signsBenign: ["Known, approved sender with authentication passing", "Same email sent to hundreds of staff by a normal bulk sender", "Links stay on the sender's own domain", "Nobody visited the link"],
    escalateWhen: ["Anyone entered credentials or opened an attachment", "Money or bank details are involved", "The email reached many people"],
    mistakes: ["Closing it because the user has not complained", "Judging by the display name only", "Forgetting to check who else received it"],
    tools: ["Mail gateway", "Web proxy logs", "Intel lookup"],
  },
  {
    slug: "brute-force",
    topic: "Brute force",
    title: "Brute-force login attempts",
    goal: "Work out whether someone guessed their way in, and what they did if they did.",
    whenToUse: "A rule that fires on many failed logins, or on failures followed by a success.",
    steps: [
      { title: "Count the failures and the usernames", detail: "Many failures in a short time, especially across several usernames like admin, root and test, means automated guessing." },
      { title: "Look at the source", detail: "Is the address internal or external? Do we know it? Check its reputation with the Intel lookup." },
      { title: "Was there a success?", detail: "Look for an Accepted or success line from the same address. A success after a burst of failures means the attacker may be in." },
      { title: "See what the account did next", detail: "Check commands, downloads and new connections right after the login. Hands-on activity such as running curl with elevated rights is a major red flag." },
      { title: "Rule out an ordinary mistake", detail: "A real user who forgot a password makes a few attempts for one account from a known address, not dozens across many names." },
      { title: "Contain", detail: "Block the source address, disable or reset the account, and check whether the same address touched other hosts." },
    ],
    signsReal: ["Dozens of failures in minutes", "Several different usernames", "External source address", "A success right after the failures", "Odd commands after login"],
    signsBenign: ["A few failures for one user from a known address", "A service account using an old password after a change", "An approved security test"],
    escalateWhen: ["Any success after a burst of failures", "Commands or downloads after the login", "A privileged or shared admin account"],
    mistakes: ["Treating failed-only attempts and a successful login the same way", "Not checking what happened after the login"],
    tools: ["Authentication logs", "SIEM search", "Intel lookup"],
  },
  {
    slug: "network",
    topic: "Network",
    title: "Suspicious network activity",
    goal: "Tell harmless scans and blocked connections apart from a machine that is under someone else's control.",
    whenToUse: "A firewall or IDS alert: port scans, threat-feed matches, odd outbound connections.",
    steps: [
      { title: "Name the source and destination", detail: "Is the source one of our machines? Who owns it? Is the destination internal or on the internet?" },
      { title: "Check for an approved reason", detail: "Look at the change calendar and the asset record. Scheduled scans and known scanners are expected." },
      { title: "Study the pattern and timing", detail: "One connection is an event. The same connection every 60 seconds for hours is beaconing: a program checking in with its controller." },
      { title: "Find the process behind it", detail: "On the endpoint, which program made the connection? New, unsigned programs started from Downloads are a warning sign." },
      { title: "Check the destination", detail: "Is it on a threat feed? How old is it? Has any other machine of ours contacted it?" },
      { title: "Decide and act", detail: "Expected activity: close with the change number. Suspicious: escalate so the machine can be isolated, even if the firewall blocked the traffic." },
    ],
    signsReal: ["Regular, repeating intervals", "Destination on a threat feed", "A new or unsigned program started just before", "Scanning with no change record"],
    signsBenign: ["Matches an approved change window", "Source is a known scanner owned by Security", "The owner confirms the activity"],
    escalateWhen: ["Beaconing or command-and-control traffic", "An internal machine scanning without approval", "Large amounts of data leaving"],
    mistakes: ["Assuming a block means the machine is safe", "Never asking why the machine tried to connect", "Ignoring the change calendar"],
    tools: ["Firewall logs", "Endpoint process data", "Change calendar", "Intel lookup"],
  },
  {
    slug: "malware",
    topic: "Malware",
    title: "Malware detection",
    goal: "Find out whether harmful code actually ran, and how far it got.",
    whenToUse: "An antivirus or EDR alert, a suspicious file hash, or an Office program starting a script.",
    steps: [
      { title: "Read the detection name", detail: "Is it a real malware family, a generic heuristic, or a harmless test file such as EICAR?" },
      { title: "Find out how the file arrived", detail: "Email attachment, download, USB drive, or created by a user? The first appearance tells you where to look next." },
      { title: "Did it run?", detail: "Look at the process tree. A document starting PowerShell, or an unsigned program running from Downloads, means it executed." },
      { title: "Check the network afterwards", detail: "New outbound connections right after execution often mean it is downloading more malware or contacting its controller." },
      { title: "Check the hash and spread", detail: "Look the hash up, and search for the same file or detection on other machines." },
      { title: "Contain", detail: "If it ran, isolate the machine, then collect details for the next team. If it was quarantined and never ran, note the evidence and close." },
    ],
    signsReal: ["Office app starts PowerShell", "Hidden or encoded command lines", "Unsigned program from Downloads", "Connection to a new address seconds after start"],
    signsBenign: ["Detection is a test file (EICAR)", "A training or test record explains it", "Quarantined with no execution and no network activity"],
    escalateWhen: ["It executed and reached the network", "The EDR only detected and did not block", "More than one machine is affected"],
    mistakes: ["Trusting 'quarantined' without checking whether it ran first", "Not checking the file hash", "Not asking how the file got there"],
    tools: ["EDR / antivirus console", "Process tree", "Intel lookup"],
  },
  {
    slug: "web-attack",
    topic: "Web attack",
    title: "Web application attack",
    goal: "Decide whether an attack on a website succeeded, was blocked, or was just a scan.",
    whenToUse: "A web application firewall alert such as SQL injection, scripting or path traversal.",
    steps: [
      { title: "Read the request", detail: "Look at the URL and parameters. Does it contain code such as ' OR 1=1-- or <script>? Is the User-Agent an attack tool such as sqlmap?" },
      { title: "Was it blocked?", detail: "A BLOCK action and a 403 response mean the firewall stopped it. That does not make the alert a false positive. It is a real attack that failed." },
      { title: "Did anything reach the application?", detail: "Check the application's access log for the same requests, and the response codes and sizes. A 200 with a large response is a warning." },
      { title: "Check for damage", detail: "Look in the database and application error logs for errors or unusual queries around the same time." },
      { title: "Judge the source and scope", detail: "One address or many? Seen before? Does a penetration test explain it?" },
      { title: "Decide and recommend", detail: "Blocked and nothing got through: record it, block or rate-limit the source and keep watching. Got through: escalate immediately." },
    ],
    signsReal: ["Attack code in parameters", "Automated tool User-Agent", "Many requests in seconds", "No approved test"],
    signsBenign: ["An approved scanner or penetration test", "A customer typing odd search words"],
    escalateWhen: ["Any request got a 200 and returned unusual data", "Database errors appear", "Many sources attack at once"],
    mistakes: ["Calling a blocked attack a false positive", "Not checking whether requests reached the application"],
    tools: ["WAF logs", "Application access log", "Intel lookup"],
  },
  {
    slug: "cloud",
    topic: "Cloud",
    title: "Cloud and identity alerts",
    goal: "Decide whether an account or a cloud setting has been taken over or misused.",
    whenToUse: "Impossible travel, repeated MFA prompts, new devices, or permission changes on cloud storage.",
    steps: [
      { title: "Identify who or what acted", detail: "A person, a service account, or an address? Look at the device, location and time." },
      { title: "Is it normal for them?", detail: "Compare with their usual place, device and working hours. Remember a VPN can make a user appear to be in another country." },
      { title: "How did they authenticate?", detail: "Was MFA asked for and passed? A flood of prompts, or old protocols such as IMAP that skip MFA, are warning signs." },
      { title: "See what happened next", detail: "New MFA devices, inbox rules that forward or hide mail, large downloads, new permissions. Attackers do these to stay in." },
      { title: "Look for an explanation", detail: "An approved change, a VPN log, a ticket. Always check before assuming the worst." },
      { title: "Contain", detail: "Revoke sessions, reset the password and MFA methods, remove new rules, and undo risky changes such as a public storage bucket." },
    ],
    signsReal: ["New device, new country and an odd hour together", "Burst of MFA prompts then an approval", "Forwarding or hiding rules created", "Public access added with no ticket"],
    signsBenign: ["Same device and the company VPN exit address", "Approved change record", "Normal activity afterwards"],
    escalateWhen: ["Signs of account takeover", "Personal or customer data exposed", "Admin permissions changed"],
    mistakes: ["Deciding from location alone", "Forgetting to check what happened after the sign-in", "Not asking whether a VPN explains it"],
    tools: ["Identity provider logs", "VPN logs", "Cloud audit log", "Change calendar"],
  },
  {
    slug: "insider",
    topic: "Insider",
    title: "Insider and data-loss alerts",
    goal: "Describe unusual activity by a trusted person accurately and fairly, and hand it to the right team.",
    whenToUse: "A DLP alert, large uploads to personal storage, or out-of-hours access to sensitive systems.",
    steps: [
      { title: "State what the logs show", detail: "How much data, to where, what labels, when. Stick to facts, not guesses about intent." },
      { title: "Look for a business reason", detail: "An incident ticket, an on-call rota, an approved transfer or a project record often explains activity." },
      { title: "Add context carefully", detail: "Facts such as a resignation or a role change raise risk, but they are context, not proof of wrongdoing." },
      { title: "Compare with normal behaviour", detail: "Has this user done this before? Is the volume or time unusual for them?" },
      { title: "Preserve the evidence", detail: "Keep the proxy, DLP and access logs. Do not delete or change anything." },
      { title: "Escalate to the right team", detail: "Insider cases usually go to HR and an insider-risk or security lead. Do not confront the user yourself or discuss it with colleagues." },
    ],
    signsReal: ["Large upload of Confidential files to a personal site", "After notice of leaving", "Outside normal hours", "No approval on record"],
    signsBenign: ["An on-call engineer working an open incident", "An approved migration with a ticket", "Normal work for that role"],
    escalateWhen: ["Sensitive data and no approval", "A pattern rather than one event", "A clear policy breach"],
    mistakes: ["Assuming intent", "Skipping the HR or ticket context", "Talking to the user or colleagues about it"],
    tools: ["DLP console", "Web proxy logs", "Ticketing and on-call records"],
  },
  {
    slug: "ai",
    topic: "AI",
    title: "AI-era threats",
    goal: "Spot attacks that use AI, or that target a company's AI tools, and judge them by the evidence like any other alert.",
    whenToUse: "A chatbot or AI assistant doing something it should not, a voice or video request for money, a flawless phishing email, an unapproved AI tool, or a stolen AI key.",
    steps: [
      { title: "Say what the AI was or did", detail: "Was AI the attacker's tool (a fake voice, a well-written email) or the target (a chatbot, an assistant, an API key)? The answer decides what you check." },
      { title: "Find what it could reach", detail: "For a company AI tool, list the data and actions it is allowed to use: mailboxes, files, customer records, payments. The risk is whatever it can touch." },
      { title: "Look for instructions hidden in data", detail: "Prompt injection means text in a message, web page or document that tells the AI to do something. Read the input the AI saw, not only what it did." },
      { title: "Verify the person or the request outside the channel", detail: "For voice, video or urgent money requests, confirm through a known phone number or a second approver. A convincing voice is not proof." },
      { title: "Follow the usage and the money", detail: "For stolen AI keys, check usage by region, time and volume against normal, and look at billing." },
      { title: "Contain and hand over", detail: "Disable the key or the tool's permissions, stop the payment, remove the email, and give Level 2 the sources that show it." },
    ],
    signsReal: ["An AI tool took an action nobody asked for", "Instructions hidden in a document or message", "An urgent payment request by voice or video with no second check", "Key use from a new place or at a new scale"],
    signsBenign: ["An approved AI tool inside the company's own tenant", "Matching change or contract record", "Normal volume and users for that tool"],
    escalateWhen: ["Data or money has left", "An AI tool is acting with real permissions on attacker text", "Credentials or keys are exposed", "Many users received the same attack"],
    mistakes: ["Trusting a request because it sounds and looks right", "Assuming a polished email is safe", "Checking only the AI's output and not the input it read", "Treating every AI-tool alert as an attack"],
    tools: ["AI tool admin and audit logs", "Cloud billing and API usage", "Mail gateway", "Second-channel call-back"],
  },
];
