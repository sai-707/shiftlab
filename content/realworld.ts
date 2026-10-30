// Real public incidents that inspired ShiftLab alerts. Short summaries in our own words; every entry links to its source.
// All ShiftLab data is fictional. Only add an entry once the source has been read.
export type RealWorld = {
  incident: string;
  year: string;
  summary: string;
  lesson: string;
  differs: string;
  sources: { title: string; url: string }[];
};

export const REAL_WORLD: Record<string, RealWorld> = {
  "SL-1003": {
    incident: "Microsoft and the Midnight Blizzard password spray",
    year: "2024",
    summary:
      "Microsoft disclosed that a state-backed group used password spraying to get into an old test account on its own network. The account had no MFA, and from there the group went on to read some corporate email.",
    lesson: "Anything reachable from the internet that accepts a password alone is a target. When you see a login succeed after many failures, check at once whether MFA protects that account.",
    differs: "Our alert is a brute force against an SSH server. The real case was a slow spray against a cloud account, which is harder to spot because each account sees only a few failures.",
    sources: [
      { title: "Microsoft Security Response Center: actions following the attack by Midnight Blizzard", url: "https://msrc.microsoft.com/blog/2024/01/microsoft-actions-following-attack-by-nation-state-actor-midnight-blizzard/" },
    ],
  },
  "SL-1006": {
    incident: "Fake job applications aimed at recruiters (more_eggs)",
    year: "2024",
    summary:
      "Security researchers described attackers who applied for real job openings and sent HR staff 'resumes' that installed the more_eggs backdoor, a tool sold to criminal groups.",
    lesson: "Recruiters have to open attachments from strangers, so attackers use that. A document that starts PowerShell is never normal, however believable the sender is.",
    differs: "Our alert uses a macro-enabled document. The real campaigns used other file types and download tricks, but the pattern of a believable job application leading to a hidden command is the same.",
    sources: [
      { title: "The Hacker News: Fake job applications deliver more_eggs malware to HR professionals", url: "https://thehackernews.com/2024/10/fake-job-applications-deliver-dangerous.html" },
      { title: "Trend Micro: preventing the more_eggs backdoor from hatching", url: "https://www.trendmicro.com/en_us/research/24/i/mdr-in-action--preventing-the-moreeggs-backdoor-from-hatching--.html" },
    ],
  },
  "SL-1010": {
    incident: "MFA fatigue in the Cisco breach",
    year: "2022",
    summary:
      "Cisco reported that an attacker obtained an employee's credentials, then phoned the employee and sent repeated MFA push requests until one was approved. The attacker then registered new devices to keep access.",
    lesson: "An approved MFA prompt is not proof that the real user approved it. Look at what happened right after: a new MFA device or a mailbox rule means the attacker is settling in.",
    differs: "Our alert has no phone call and the account belongs to a different company. The prompt flood, the late approval and the new device are the same pattern.",
    sources: [
      { title: "Help Net Security: Cisco has been hacked by a ransomware gang", url: "https://www.helpnetsecurity.com/2022/08/11/cisco-hacked/" },
    ],
  },
  "SL-1015": {
    incident: "The Snowflake customer data thefts",
    year: "2024",
    summary:
      "Mandiant described a group that logged in to many companies' cloud data warehouse accounts using usernames and passwords stolen earlier by infostealer malware. Many of those accounts had no MFA, and the group copied out large amounts of customer data.",
    lesson: "A service account with only a password is a prize. Check how an account is protected, whether its password could be exposed, and what a bulk export touched.",
    differs: "Our warehouse, account and data are fictional. The real campaign involved many different companies and the details of each account differed, but the pattern of a stolen login followed by a bulk copy is the same.",
    sources: [
      { title: "Google Cloud / Mandiant: UNC5537 targets Snowflake customer instances for data theft and extortion", url: "https://cloud.google.com/blog/topics/threat-intelligence/unc5537-snowflake-data-theft-extortion" },
    ],
  },
  "SL-1016": {
    incident: "Administrator tools used by attackers (PsExec)",
    year: "ongoing",
    summary:
      "PsExec is a genuine Microsoft admin tool. Attackers, including ransomware crews, also use it to run programs on many machines, which is why CISA's guidance tells defenders to audit and restrict it.",
    lesson: "The tool alone never settles it. Who ran it, from which computer, under which approved change and what the targets did afterwards decide whether it is an attack or maintenance.",
    differs: "In a real attack the change record would be missing, the account or host would be unusual, and the servers would show new tools, new accounts or encrypted files.",
    sources: [
      { title: "CISA: Audit and Restrict PsExec (countermeasure CM0141)", url: "https://www.cisa.gov/eviction-strategies-tool/info-countermeasures/CM0141" },
    ],
  },
  "SL-1017": {
    incident: "Fake sign-in pages that steal the session after MFA (AiTM)",
    year: "2022",
    summary:
      "Microsoft described a large phishing campaign where a fake page sat between the user and the real Microsoft sign-in page. It copied the session after the user passed MFA, and the attackers then used the mailboxes for payment fraud.",
    lesson: "MFA does not make a click harmless. After a phishing click, check for a form submission and then look at the sign-in log for a new address or device.",
    differs: "In our alert nothing was submitted and no new sign-in followed, so the harm stopped at the page view.",
    sources: [
      { title: "Microsoft Security blog: From cookie theft to BEC, attackers use AiTM phishing sites", url: "https://www.microsoft.com/en-us/security/blog/2022/07/12/from-cookie-theft-to-bec-attackers-use-aitm-phishing-sites-as-entry-point-to-further-financial-fraud/" },
    ],
  },
  "SL-1018": {
    incident: "Stale saved passwords: a common cause of lockouts",
    year: "ongoing",
    summary:
      "Help desks and identity vendors regularly report that many repeated lockouts come from phones, mapped drives or old services still using a password the user has since changed, rather than from attackers.",
    lesson: "Many failed sign-ins are not always an attack. Check the source, a recent password change and a help desk ticket before you decide.",
    differs: "In a real brute force the failures would come from outside addresses, try many usernames, and a success from a new place would follow, as in SL-1003.",
    sources: [
      { title: "ManageEngine: what causes repeated account lockouts and how to resolve them", url: "https://www.manageengine.com/products/active-directory-audit/blog/what-causes-repeated-account-lockouts-and-how-to-resolve-them.html" },
    ],
  },
  "SL-1019": {
    incident: "Counterfeit installers spread through search results",
    year: "ongoing",
    summary:
      "Security reports describe campaigns where fake installers for everyday programs, promoted through search results and look-alike download sites, carry malware such as password stealers.",
    lesson: "Software should come from the vendor's own site. When antivirus stops a download, check whether the file ever ran and whether anything else contacted the site.",
    differs: "Our alert stopped at the download. In an incident where the installer ran, you would see new processes and outbound connections and the case would be escalated.",
    sources: [
      { title: "SC Media: counterfeit installers facilitate a global campaign", url: "https://www.scworld.com/brief/counterfeit-installers-facilitate-global-tamperedchef-campaign" },
    ],
  },
  "SL-1020": {
    incident: "Web shells on public web servers",
    year: "2020",
    summary:
      "The US NSA and Australia's ASD published joint guidance on web shells, small scripts that attackers place on web servers to give themselves a back door, and how to detect them.",
    lesson: "A script in an upload folder is not a detail. Check whether it was used, what the web server ran, and which secrets it could read.",
    differs: "Our case uses a simple upload form. Real intrusions often use a software flaw to place the file, but what you look for afterwards is the same.",
    sources: [
      { title: "NSA and ASD: detect and prevent web shell malware", url: "https://media.defense.gov/2020/Jun/09/2002313081/-1/-1/0/CSI-DETECT-AND-PREVENT-WEB-SHELL-MALWARE-20200422.PDF" },
    ],
  },
  "SL-1021": {
    incident: "Okta customer support system breach",
    year: "2023",
    summary:
      "Okta reported that an attacker used credentials to reach its customer support case system, where files customers had uploaded, such as browser recordings that contain session tokens, could be used to take over those customers' sessions. Reports named 134 affected customers.",
    lesson: "A recording of a browser session is as sensitive as a password. Look for a session used from a second address without any sign-in, and treat files given to vendors as a possible source.",
    differs: "Our alert shows the replay and the new admin account. In a real case you would also work with the vendor to learn which of your files were viewed.",
    sources: [
      { title: "BleepingComputer: Okta breach, 134 customers exposed in support system hack", url: "https://www.bleepingcomputer.com/news/security/okta-breach-134-customers-exposed-in-support-system-hack/" },
      { title: "The Hacker News: Okta data breach", url: "https://thehackernews.com/2023/11/oktas-recent-customer-support-data.html" },
    ],
  },
  "SL-1022": {
    incident: "MOVEit Transfer SQL injection and web shell",
    year: "2023",
    summary:
      "CISA and the FBI described how the Cl0p group exploited a SQL injection flaw in MOVEit Transfer, installed a web shell on the file transfer servers and used it to steal data from many organisations.",
    lesson: "On a public application, a new page is the start of the story. Follow it through the web log, the database and the network to see what was taken.",
    differs: "Our case uses invented file and product names. In the real campaign the data was taken in bulk and many organisations learned of it only after the vendor warned them.",
    sources: [
      { title: "CISA: #StopRansomware CL0P exploits MOVEit vulnerability (AA23-158A)", url: "https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-158a" },
    ],
  },
  "SL-1023": {
    incident: "Apache Log4j (Log4Shell) vulnerability",
    year: "2021",
    summary:
      "CISA and partners published guidance on the Log4Shell flaw in the Apache Log4j library. It was exploited at huge scale and scanners sent the attack string to almost everything that faces the internet.",
    lesson: "The attack string in a log does not mean a server was hit. Check the Log4j version, whether anything called back out and whether anything ran.",
    differs: "Our case is the harmless end of Log4Shell. In 2021 many servers were vulnerable and callbacks and new processes were the signs that an attack worked.",
    sources: [
      { title: "CISA: Apache Log4j vulnerability guidance", url: "https://cisa.gov/uscert/apache-log4j-vulnerability-guidance" },
    ],
  },
  "SL-1024": {
    incident: "Scattered Spider help desk social engineering",
    year: "2023",
    summary:
      "The FBI and CISA described how the Scattered Spider group phoned IT help desks, posed as staff, and had passwords and MFA reset to take over accounts. They then moved on to the systems they wanted.",
    lesson: "A reset is only as safe as the check behind it. A callback and a manager approval stop most of these, and a new MFA device right after a reset should always be reviewed.",
    differs: "Our case ends at a payment fraud attempt. In real incidents the same access was used to reach cloud and virtualisation systems and deploy ransomware.",
    sources: [
      { title: "CISA and FBI: Scattered Spider (AA23-320A)", url: "https://cisa.gov/news-events/cybersecurity-advisories/aa23-320a" },
    ],
  },
  "SL-1025": {
    incident: "Impossible travel detections and their false positives",
    year: "ongoing",
    summary:
      "Microsoft's identity protection documentation describes how impossible travel and atypical travel detections work, and notes that they can fire for VPNs and proxies that make users appear in another place.",
    lesson: "A location is only where the traffic left the network. Check the device, the browser and what changed before you call it an attack.",
    differs: "In an account takeover the second sign-in usually comes from a new device and browser, followed by changes such as mailbox rules or MFA methods. None appears here.",
    sources: [
      { title: "Microsoft Learn: Risks in Microsoft Entra ID Protection", url: "https://learn.microsoft.com/en-us/entra/id-protection/concept-identity-protection-risks" },
    ],
  },
  "SL-1026": {
    incident: "3CX desktop app supply chain attack",
    year: "2023",
    summary:
      "Attackers compromised the maker of the 3CX phone application and shipped a malicious, correctly signed version of its desktop app to customers. CISA and security firms described the app loading a malicious library that contacted attacker servers.",
    lesson: "A valid signature and a trusted vendor do not prove an update is safe. Look at what the program starts, where it connects and how many computers got the same version.",
    differs: "Our case uses invented names and a smaller number of computers. In the real incident the activity reached many organisations at once and some were followed by further intrusion.",
    sources: [
      { title: "CISA: Supply chain attack against 3CXDesktopApp", url: "https://cisa.gov/news-events/alerts/2023/03/30/supply-chain-attack-against-3cxdesktopapp" },
      { title: "SentinelOne: SmoothOperator, ongoing campaign trojanizes 3CX software", url: "https://www.sentinelone.com/blog/smoothoperator-ongoing-campaign-trojanizes-3cx-software-in-software-supply-chain-attack/" },
    ],
  },
  "SL-1027": {
    incident: "LockBit 3.0 ransomware",
    year: "2023",
    summary:
      "The FBI, CISA and partners described how LockBit 3.0 affiliates gain access, move through a network with stolen administrator accounts and remote tools, delete backups and shadow copies, and then encrypt files.",
    lesson: "Recovery being switched off is the last warning before encryption. Contain first, then work out how the attacker got administrator rights.",
    differs: "Our case is a single server and the clean backup helps. In real incidents ransomware groups also copy data out and often target the backups themselves.",
    sources: [
      { title: "CISA: #StopRansomware LockBit 3.0 (AA23-075A)", url: "https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-075a" },
    ],
  },
  "SL-1028": {
    incident: "EleKtra-Leak: cloud keys found on public GitHub repositories",
    year: "2023",
    summary:
      "Palo Alto Networks' Unit 42 described a campaign that scanned public GitHub repositories for cloud access keys and used them within minutes to create servers for cryptocurrency mining.",
    lesson: "A key in a public repository should be treated as stolen. Revoke it, then check for anything it created, because attackers often add their own users.",
    differs: "Our alert also includes a new administrator user, which is a quieter and more dangerous step than the miners that make the noise.",
    sources: [
      { title: "The Hacker News: EleKtra-Leak cryptojacking attacks", url: "https://thehackernews.com/2023/10/elektra-leak-cryptojacking-attacks.html" },
      { title: "Dark Reading: Elektra-Leak attackers harvest cloud keys in GitHub campaign", url: "https://www.darkreading.com/cloud-security/elektra-leak-attackers-harvest-aws-cloud-keys-github-campaign" },
    ],
  },
  "SL-1029": {
    incident: "Illicit consent grants (consent phishing)",
    year: "ongoing",
    summary:
      "Microsoft documents how attackers trick users into approving a malicious app that gains lasting access to mail and files without a password, and how to find and remove those grants.",
    lesson: "Not all phishing steals passwords. Check the apps users have approved, and remove the consent as well as resetting the account.",
    differs: "Our case spreads from a compromised supplier mailbox. The steps to find the app, its permissions and the users who approved it are the same in real investigations.",
    sources: [
      { title: "Microsoft Learn: Detect and remediate illicit consent grants", url: "https://learn.microsoft.com/en-us/defender-office-365/detect-and-remediate-illicit-consent-grants" },
    ],
  },
  "SL-1030": {
    incident: "DNS tunnelling and its false positives",
    year: "ongoing",
    summary:
      "MITRE ATT&CK describes how attackers use DNS to carry commands and data. Detection guidance repeatedly warns that some security and cloud products also use long DNS names for their own lookups.",
    lesson: "Long DNS names alone prove nothing. Identify the process, the domain and whether other computers do the same before you call it a tunnel.",
    differs: "A real tunnel usually comes from an unexpected process to a new domain and moves data out. Here the process is the company's own signed agent and the domain is documented.",
    sources: [
      { title: "MITRE ATT&CK: Application Layer Protocol, DNS (T1071.004)", url: "https://attack.mitre.org/techniques/T1071/004/" },
    ],
  },
  "SL-1031": {
    incident: "Prompt injection in AI chatbots (OWASP LLM01)",
    year: "ongoing",
    summary:
      "OWASP lists prompt injection as the top risk for applications built on large language models. It describes direct injection, where a user's own text changes the model's behaviour, and says the main protections are least privilege, doing privileged steps in code rather than through the model, and human approval for high-risk actions.",
    lesson: "A rule written in the bot's instructions is a request, not a lock. What a bot can read or do must be limited in code, for the customer who is signed in.",
    differs: "Our bot and its records are invented. OWASP notes that prompt injection may not be fully preventable, which is why limiting what the tool can reach matters most.",
    sources: [
      { title: "OWASP GenAI: LLM01 Prompt Injection", url: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/" },
    ],
  },
  "SL-1032": {
    incident: "Arup deepfake video call fraud",
    year: "2024",
    summary:
      "CNN reported that a finance worker at Arup's Hong Kong office paid about HK$200 million (about US$25.6 million) in 15 transactions after a video call with people he believed were the company's CFO and colleagues. They were deepfake recreations. Arup confirmed that fake voices and images were used.",
    lesson: "How real someone looks or sounds is not proof. Confirm unusual or urgent payments through a second channel you already trust, and use two approvers.",
    differs: "Ours is a phone call, and the payment is still waiting for approval so the SOC can stop it. In the real case the money had already been sent.",
    sources: [
      { title: "CNN: Arup revealed as victim of $25 million deepfake scam", url: "https://edition.cnn.com/2024/05/16/tech/arup-deepfake-scam-loss-hong-kong-intl-hnk" },
    ],
  },
  "SL-1033": {
    incident: "AI-written phishing and click rates",
    year: "2025",
    summary:
      "The Register reported on Microsoft's Digital Defense Report 2025, which said AI-automated phishing emails had a 54% click-through rate against 12% for phishing that did not use AI, about 4.5 times as effective.",
    lesson: "Fluent, personalised writing and passing email checks no longer separate real email from phishing. Look at the domain's age, where the link goes and what happens after a click.",
    differs: "Ours is a small, invented case with exact numbers. The real figures come from Microsoft's own measurements across its customers.",
    sources: [
      { title: "The Register: AI-automated phishing is far more effective, says Microsoft", url: "https://www.theregister.com/2025/10/16/ai_makes_phishing_45x_more_effective" },
    ],
  },
  "SL-1034": {
    incident: "Samsung restricts staff use of generative AI",
    year: "2023",
    summary:
      "Bloomberg and CNBC reported that in May 2023 Samsung told staff to stop using ChatGPT and similar tools after employees uploaded sensitive internal code to a public service.",
    lesson: "The risk is where the data goes and whose account holds it, not that AI was used. Check whether the tool is approved, which tenant it is, and where the data is kept.",
    differs: "In the Samsung case staff used public tools. Our case is the company's own tenant of an approved enterprise tool, so it is a false positive.",
    sources: [
      { title: "CNBC: Samsung bans use of AI like ChatGPT for staff after misuse of chatbot", url: "https://www.cnbc.com/2023/05/02/samsung-bans-use-of-ai-like-chatgpt-for-staff-after-misuse-of-chatbot.html" },
      { title: "Bloomberg: Samsung bans staff's AI use after spotting ChatGPT data leak", url: "https://www.bloomberg.com/news/articles/2023-05-02/samsung-bans-chatgpt-and-other-generative-ai-use-by-staff-after-leak" },
    ],
  },
  "SL-1035": {
    incident: "LLMjacking: stolen cloud keys used for AI models",
    year: "2024",
    summary:
      "Sysdig's researchers described attackers who took cloud credentials from a vulnerable system and used them to reach cloud-hosted AI models. They checked the key's quotas, queried logging settings and then sold or used the access. Sysdig said an attack could cost the victim over $46,000 a day.",
    lesson: "A stolen AI key looks like heavy normal use until you compare it with the key's usual source and volume. Revoke it, and check what else was exposed with it.",
    differs: "Our case starts with a key leaked in a public repository. In the real reports the keys came from a vulnerable web application.",
    sources: [
      { title: "The Hacker News: Researchers uncover LLMjacking scheme", url: "https://thehackernews.com/2024/05/researchers-uncover-llmjacking-scheme.html" },
    ],
  },
  "SL-1036": {
    incident: "EchoLeak: zero-click data leak from Microsoft 365 Copilot",
    year: "2025",
    summary:
      "Aim Security found that a crafted email could make Microsoft 365 Copilot leak data from its context when the user later asked a routine question, with no click needed. It was tracked as CVE-2025-32711 and fixed by Microsoft in June 2025. The report found no sign it was used in the wild.",
    lesson: "An AI assistant treats text it reads as instructions. Hidden text in a document or email can steer it, so limit what it can send and ask the user before it sends anything out.",
    differs: "Our case uses an invented assistant and a PDF, and the assistant sends the files itself. In EchoLeak the leak went out through links and no email had to be sent.",
    sources: [
      { title: "The Hacker News: Zero-click AI vulnerability exposes Microsoft 365 Copilot data", url: "https://thehackernews.com/2025/06/zero-click-ai-vulnerability-exposes.html" },
    ],
  },
  "SL-1037": {
    incident: "Polymorphic code (MITRE ATT&CK T1027.014)",
    year: "ongoing",
    summary:
      "MITRE describes polymorphic code as malware that changes how it looks each time, so every copy is different but does the same job, and signature-based tools miss it. It advises looking at behaviour, not just hashes.",
    lesson: "A hash that nobody has seen is the normal case for new malware. Judge the file by what it starts, where it connects and what it leaves behind.",
    differs: "Our six files are only different in size and hash, and a macro is easy to spot. Real polymorphic malware can change much more, and attackers may now use AI to generate the variants.",
    sources: [
      { title: "MITRE ATT&CK: Polymorphic Code (T1027.014)", url: "https://attack.mitre.org/techniques/T1027/014/" },
    ],
  },
  "SL-1038": {
    incident: "AiFrame: fake AI assistant Chrome extensions",
    year: "2026",
    summary:
      "The Register reported that LayerX Security found more than 30 Chrome extensions posing as AI assistants, with at least 260,000 users. They read page content, including from Gmail, and sent it to a remote domain. Google removed them from the store, and some came back under new IDs.",
    lesson: "An add-on's name says nothing about what it does. Check what it can read, who owns it now and whether it is on your approved list, because add-ons change hands and update themselves.",
    differs: "In our case an add-on that began harmless is sold and updated. The real campaign was built to be malicious from the start, using a shared codebase and remote content.",
    sources: [
      { title: "The Register: Chrome extensions posing as AI assistants steal data", url: "https://www.theregister.com/2026/02/12/30_chrome_extensions_ai/" },
    ],
  },
};
