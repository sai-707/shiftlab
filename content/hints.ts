// Three free hints per alert: 1 Think (a question to ask), 2 Look (which tab to open), 3 Find (the fact to look for).
// A hint never gives the verdict. Tab names must match the evidence tab labels (checked by a test).
// shortcut: hint text ships in the page code, so a curious student could read all three at once. Hints are free, so that is fine.

export type HintSet = readonly [think: string, look: string, find: string];

export const HINT_STEPS = ["Think", "Look", "Find"] as const;

export const HINTS: Record<string, HintSet> = {
  "SL-1001": [
    "Look at the sender's address letter by letter. Is it exactly ours?",
    "Open the Email headers tab and read the SPF and DKIM results.",
    "Find out whether d.okafor only received the email or also opened the link. The Web proxy log tab shows which sites the computer visited.",
  ],
  "SL-1002": [
    "Do we normally get email from this sender? A newsletter you expect is different from one that appears out of nowhere.",
    "Open the Context from the mail gateway tab, then the Email headers tab.",
    "Find out where the link finally lands and whether anyone clicked it. The Web proxy search tab shows both.",
  ],
  "SL-1003": [
    "How many failures came before the success, and against which usernames?",
    "Open the /var/log/auth.log on web-bastion-02 tab and read the lines in time order.",
    "Find out what the account did in the minutes after the successful login, and whether this host holds anything valuable. The Host and account context tab covers the second part.",
  ],
  "SL-1004": [
    "Whose computer is 10.20.9.5? Scans can be planned work.",
    "Open the Asset record for 10.20.9.5 tab, then the Change calendar tab.",
    "Compare the time of the scan with any booking in the Change calendar tab, and see in the Firewall log tab where it scanned.",
  ],
  "SL-1005": [
    "The firewall stopped it. Is the question about this one connection, or about why the machine tried at all?",
    "Open the Firewall log tab and look at the times of the attempts.",
    "Find out which program on FIN-WS-114 started the connections. The Recent process activity on FIN-WS-114 tab shows what ran.",
  ],
  "SL-1006": [
    "Word starting PowerShell is rare. What would normally start PowerShell, and what would not?",
    "Open the Process tree on HR-WS-052 tab, then the PowerShell command line tab.",
    "Find out how the document arrived (Document and email tab) and whether the laptop then reached out to the internet (Web proxy log tab).",
  ],
  "SL-1007": [
    "Read the detection name carefully. Is it the name of a real threat?",
    "Open the Detection details tab, then the Ticket and calendar tab.",
    "Find out whether the file ran or contacted anything. The Endpoint activity on SEC-LAB-03 tab shows what happened between 11:40 and 11:50.",
  ],
  "SL-1008": [
    "Does the request really contain database code, or just odd-looking text?",
    "Open the WAF log tab and look at what each request contains and what the firewall did with it.",
    "Find out whether any request reached the server and what the server answered. The Application server access log tab shows the status codes and sizes.",
  ],
  "SL-1009": [
    "Compare the two sign-ins side by side: place, device and MFA result.",
    "Open the Sign-in log for s.menon tab and compare the two lines.",
    "Check whether the second address belongs to the company VPN (VPN gateway log tab) and what the account did afterwards (Activity after the second sign-in tab).",
  ],
  "SL-1010": [
    "Would this user normally be signing in at this hour, from this place?",
    "Open the MFA prompts for a.kapoor tab, then the Sign-in context tab.",
    "Find out what the account did right after the approval, and whether it changed anything that would let someone back in later. The Mailbox audit log tab shows it.",
  ],
  "SL-1011": [
    "Who made the change, and were they meant to?",
    "Open the Cloud audit events tab, then the Change records tab.",
    "Find out what is stored in the bucket (Bucket contents tab) and whether anyone outside has downloaded files (Bucket access log tab).",
  ],
  "SL-1012": [
    "How much was sent, and what kind of files? Both matter.",
    "Open the Files matched by DLP tab, then the HR and policy context tab.",
    "Find out whether this is a one-off or a pattern, and whether the company has an approved way to share files. The Web proxy log tab shows earlier visits.",
  ],
  "SL-1013": [
    "Is there a ticket, a page or an incident that could explain admin work at 03:19?",
    "Open the Incident and paging records tab.",
    "Compare how the person connected (VPN gateway log tab) and what they did (Windows security log on db-prod-01 tab) with what the incident needed.",
  ],
  "SL-1014": [
    "A new address can have an innocent reason. What else about the sign-in looks different?",
    "Open the Sign-in log for d.okafor tab and look at the sign-in method and whether MFA was asked for.",
    "Find out what the session did in the minutes after signing in. The Mailbox audit log tab lists it.",
  ],
  "SL-1015": [
    "This account normally runs one job. Is this where and when it usually signs in?",
    "Open the Warehouse sign-in history for svc_bi_report tab and compare it with the Query history tab.",
    "Find out how the account is protected and whether its password could have been exposed. See the Account context tab and the Credential exposure check tab.",
  ],
  "SL-1016": [
    "Who ran the tool, from which computer, and is that normal for them?",
    "Open the Authentication log for svc-patch tab, then the Change and ticket records tab.",
    "Find out what state the file servers are in afterwards. The Target servers after the run tab shows each one.",
  ],
  "SL-1017": [
    "How far above this user's usual activity is this, and was it spread out or all at once?",
    "Open the Download volume vs baseline tab and the SharePoint audit log tab and compare them.",
    "Find out where the files went (Endpoint and USB activity tab and Web proxy and cloud app log tab) and what the HR records show (HR and access context tab).",
  ],
  "SL-1018": [
    "Where did the wrong passwords come from: inside the company or outside?",
    "Open the Sign-in failures for r.dsouza tab and compare the source addresses.",
    "Find out whether anything changed on the account recently, or whether there is a help desk ticket. The Account and help desk context tab covers it.",
  ],
  "SL-1019": [
    "Where did the file come from?",
    "Open the Web proxy log tab and find the download.",
    "Find out whether the file ever ran or contacted anything before antivirus removed it. The Endpoint context for MKT-WS-019 tab shows it.",
  ],
  "SL-1020": [
    "How did the file get into the pictures folder, and who put it there?",
    "Open the Web server access log tab and look for the request that created the file.",
    "Find out whether the file was used, and what the commands showed the attacker. The Web server access log tab and the Process events on web-app-03 tab cover both.",
  ],
  "SL-1021": [
    "Was the second use a new sign-in with MFA, or the same session used again?",
    "Open the Identity session log tab and compare the two addresses.",
    "Find out what the second address did (Admin audit log tab) and how a session could have been taken (Support ticket and vendor notice tab and Laptop and network context tab).",
  ],
  "SL-1022": [
    "How did a page nobody deployed get onto the server?",
    "Open the Web server access log tab and look at the requests around 02:14.",
    "Find out what was read from the database (Database audit tab) and whether the vendor warned about this product (Vendor advisory and patch status tab).",
  ],
  "SL-1023": [
    "Scanners send this text to everything. What would show that a server was really affected?",
    "Open the Asset and patch inventory tab and see which servers run a vulnerable version.",
    "Find out whether any server called back out to the address in the string (Egress firewall and DNS logs tab) or ran anything unusual (Application and process log tab).",
  ],
  "SL-1024": [
    "How did the help desk check who was calling?",
    "Open the Help desk ticket INC-5588 tab and read how the caller was verified.",
    "Find out who registered the new device (Identity audit log tab), whether a.menon is really in the office (Leave calendar tab) and what the account did (Finance portal activity tab).",
  ],
  "SL-1025": [
    "Spraying tries a few passwords on many accounts. How can you tell this is not one person mistyping?",
    "Open the Sign-in log summary tab and compare how many accounts were tried with how many attempts each.",
    "Find out whether the one success was protected by MFA (Account context tab) and what it did next (Successful sign-in and mailbox activity tab).",
  ],
  "SL-1026": [
    "What did the program start after it updated?",
    "Open the EDR process events on SALES-WS-027 tab.",
    "Find out whether the domain it contacted is the supplier's real one (Supplier release page and file check tab) and how many other computers got the same update (Software inventory and update status tab).",
  ],
  "SL-1027": [
    "Is it still going, and has it spread? Time matters here.",
    "Open the EDR process events on FS-02 tab and read what ran, in order.",
    "Find out how the account got administrator rights (Authentication log tab) and whether other servers and backups are safe (Backup and spread check tab).",
  ],
  "SL-1028": [
    "Is the pipeline using this key, or someone else?",
    "Open the Key owner and normal use tab and compare it with the Cloud audit log tab.",
    "Find out how the key could have been found (Code repository check tab) and what is running now (Instances and cost tab).",
  ],
  "SL-1029": [
    "Who published the app, and what is it allowed to do?",
    "Open the App consent audit tab and read the permissions the app was given.",
    "Find out how the user was led to approve it (Email and click record tab), what the app has done (App activity log tab) and who else approved it (Other users and app status tab).",
  ],
  "SL-1030": [
    "Which program on the laptop is making the lookups?",
    "Open the Process behind the queries tab.",
    "Find out whether the domain belongs to software that is known here (Agent deployment and scan schedule tab) and whether other laptops do the same (Fleet comparison tab).",
  ],
  "SL-1031": [
    "What did the visitor type, and what did the bot do next?",
    "Open the Chatbot transcript tab and read it from the top.",
    "Find out what the bot's tool can read and who decides which customer it may see (Bot setup and permissions tab), and how many accounts came back (Backend API log tab).",
  ],
  "SL-1032": [
    "Can the payment still be stopped, and by when?",
    "Open the Payment system tab.",
    "Find out where the call really came from (Call and email record tab), whether the CFO can confirm through a number you already trust (Where the CFO really is tab) and whether the supplier is known (Domain and supplier check tab).",
  ],
  "SL-1033": [
    "The writing and the email checks look fine. What else could you check about the email?",
    "Open The email tab and look at the domain and the link.",
    "Find out who clicked and who typed anything (Web proxy log tab), and whether anyone signed in as the user afterwards (Identity sign-in log tab).",
  ],
  "SL-1034": [
    "Is the destination an approved tool, and whose account is it?",
    "Open the Approved tools register tab and compare it with the DLP and proxy record tab.",
    "Find out whether there is a work reason for the file (Role and usual use tab and Ticket and manager note tab).",
  ],
  "SL-1035": [
    "Is the traffic coming from the app that owns the key?",
    "Open the Key owner and normal use tab and compare it with the Usage and billing tab.",
    "Find out what the requests are asking for (API request log tab) and how the key could have got out (Key exposure check tab).",
  ],
  "SL-1036": [
    "What did the assistant read, and what did it do next?",
    "Open the Assistant action log tab and read the steps in order.",
    "Look inside The PDF tab for anything unusual, and check the Other assistant users tab for who else used the same document.",
  ],
  "SL-1037": [
    "How far did each attempt get before it was blocked?",
    "Open the Process tree tab.",
    "Find out why no lookup knows these files (Hash lookups and the six files tab) and whether the email is still in anyone's mailbox (Containment and wider check tab).",
  ],
  "SL-1038": [
    "What exactly is the add-on sending, and to where?",
    "Open the Proxy log tab.",
    "Find out what changed in the add-on (Extension details tab), who has it (Affected users and pages tab) and whether anything users type is visible (Bank portal and sign-in check tab).",
  ],
  "SL-1039": [
    "A command hidden in Base64 is only a problem if it says something harmful. Where could you read what it says once decoded?",
    "Open the PowerShell script block log tab.",
    "Compare what the script did with the ticket (Change and ticket records tab) and where the session started (Authentication log for v.joshi tab).",
  ],
  "SL-1040": [
    "Ransomware deletes shadow copies, but backup tools clean them up too. Which program started the command, and with which options?",
    "Open the EDR process events on FS-02 tab.",
    "See whether the command appears on other nights and servers (Same command on other servers tab) and what the server looked like afterwards (FS-02 after the run tab).",
  ],
  "SL-1041": [
    "Many programs create scheduled tasks. What created this one, and what does it run?",
    "Open the Windows event log on HR-WS-019 tab.",
    "Check who signed the program (Software and signature record tab) and whether other computers have the same task (Other computers with the same task tab).",
  ],
  "SL-1042": [
    "Read the exact text that matched the rule. Would an ordinary customer ever type it?",
    "Open the WAF log tab.",
    "Look at what the visitor did before and after (Web server log for 198.51.100.206 tab) and whether the rule fires for other visitors (Same rule in the last 7 days tab).",
  ],
  "SL-1043": [
    "Some devices cannot do MFA at all. Where is this account supposed to sign in from, and is that where this one came from?",
    "Open the Sign-in log for svc-mfp-mail tab.",
    "Find out whether a recorded decision covers this sign-in (Conditional access exception record tab) and what the account did afterwards (Mailbox activity tab).",
  ],
  "SL-1044": [
    "A young domain is a reason to look closer, not an answer. How did these people end up on the site?",
    "Open the Email that carried the link tab.",
    "Check whether the sender and the site fit a business relationship (Vendor and campaign records tab) and what the visitors sent to the site (Web proxy log tab).",
  ],
  "SL-1045": [
    "A burst of blocked attack patterns is what scanning looks like. Who might be allowed to scan the portal?",
    "Open the Pentest engagement record tab.",
    "Check that the address, time and target all fall inside what was approved, then see whether anything got through (WAF log summary tab and Portal health during the window tab).",
  ],
  "SL-1046": [
    "A voice can be copied, so judge the facts around the call, not how it sounded. What can you check without trusting the caller?",
    "Open the Call record tab.",
    "Find out whether the number belongs to the CFO and whether he confirmed on a number we already trust (Callback and confirmation tab), and whether the payment itself looks normal (Payment and supplier record tab).",
  ],
  "SL-1047": [
    "Which system sent the data, and is it supposed to talk to that destination?",
    "Open the Destination details tab.",
    "Compare the size and time with earlier months (Backup schedule and transfer history tab) and look for an agreement that covers it (Contract and change record tab).",
  ],
  "SL-1048": [
    "Did these messages leave from the mailbox itself, or did another service send them as this address?",
    "Open the Sending platform and authentication tab.",
    "Check whether a campaign was planned (Campaign record tab) and what the messages contain (Message content and links tab).",
  ],
  "SL-1049": [
    "Is a burst of deletions always destruction? Look at what was deleted and who has the right to do it.",
    "Open the Ticket and approval tab and compare its scope with the SharePoint audit log tab.",
    "Find out whether anything is lost (Recycle bin and retention tab) and what the user's situation is (User and role context tab).",
  ],
  "SL-1050": [
    "Spend that jumps can mean someone else has the key or that the company's own work grew. Where are the requests coming from?",
    "Open the Usage and billing tab.",
    "Check what was being called (API request log tab) and whether a project explains it (Project and approval record tab).",
  ],
  "SL-1051": [
    "Assistants can be told to send files by text they read. Who told this one to send it?",
    "Open the Conversation and confirmation tab.",
    "Check whether the recipient is someone we share files with (Partner and document record tab) and what the assistant's rules allow (Assistant policy settings tab).",
  ],
};
