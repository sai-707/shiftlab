// Job market, free certificates, tools and projects for the roadmap pages. Every figure and price was read from the page named beside it on CHECKED (see content/roadmap.ts).

export type Who = "Both" | "SOC" | "Engineer";
export type Source = { n: string; u: string };

export const MARKET = {
  "stats": [
    {
      "big": "27% vs 12%",
      "label": "Security Engineer plus Cloud Security Engineer postings, against SOC Analyst postings",
      "src": "Cisco AI Workforce Consortium, G7 postings, Oct 2025 to Mar 2026"
    },
    {
      "big": "28.5%",
      "label": "of cybersecurity postings asked for AI skills, up from 14.2% a year earlier. Python is a recurring one.",
      "src": "Same study, reported by Help Net Security, 24 Aug 2026"
    },
    {
      "big": "0.7%",
      "label": "of postings carried a junior title, against 6.7% with a senior title",
      "src": "Same study"
    },
    {
      "big": "-45.9%",
      "label": "Penetration tester postings in the US, Jan to Sep 2026 against 2025. AI Security Engineer rose 268%.",
      "src": "CyberSN, reported by SecurityWeek"
    }
  ],
  "steps": [
    {
      "t": "Start on the SOC track if you are new",
      "d": "Alert triage is the most common first job, and ShiftLab trains it directly. SOC Analyst was 12% of postings, and junior roles are rare, so show real practice, not just courses."
    },
    {
      "t": "Learn Python in your first months",
      "d": "Python was named as a recurring skill in postings that ask for AI skills, and it is how engineers automate the work a SOC does by hand."
    },
    {
      "t": "Move to the engineer track within a year",
      "d": "Detection engineering, cloud security and pipeline security are where the larger share of postings is. Phase 6 gives you that path with free resources."
    },
    {
      "t": "Do not aim at pentesting first",
      "d": "Pentester postings fell by almost half. Keep it as an optional topic that makes you a better defender."
    }
  ],
  "tracks": [
    {
      "n": "SOC analyst",
      "tag": "FASTEST WAY IN",
      "c": "#22d3ee",
      "roles": "SOC analyst (L1, then L2), incident responder",
      "phases": "Phases 1 to 5",
      "tools": "Splunk, Wazuh, Wireshark, VirusTotal",
      "shiftlab": "ShiftLab trains this track directly: alerts, logs, mailbox, handover.",
      "pick": "You want a first job soon and like investigating."
    },
    {
      "n": "Security engineer",
      "tag": "BIGGEST SHARE OF POSTINGS",
      "c": "#a78bfa",
      "roles": "Security engineer, detection engineer, cloud security engineer, AppSec or DevSecOps, AI security",
      "phases": "Phases 1 to 4, then 6, then 5",
      "tools": "Python, Git, Sigma, Terraform, Semgrep",
      "shiftlab": "ShiftLab covers the foundations. Phase 6 links to free outside labs.",
      "pick": "You like building and automating, or you already code."
    }
  ],
  "caveats": [
    "These are counts of job postings, not jobs filled, and they cover the US or the G7, not every country.",
    "Posting data does not show pay or how hard a role is to get. Treat it as a guide to where to look, not a promise.",
    "I did not find current data on how often postings ask for each certification. The figures I found were from 2019 to 2021, so I left them out.",
    "One claim is not independently checked: TryHackMe says Splunk is the SIEM named most often in postings."
  ],
  "sources": [
    {
      "n": "SecurityWeek: US cybersecurity job postings fall 26%, AI Security Engineer demand soars",
      "u": "https://www.securityweek.com/us-cybersecurity-job-postings-fall-26-as-ai-security-engineer-demand-soars-/"
    },
    {
      "n": "Help Net Security: Cybersecurity job ads demanding AI skills double in a year",
      "u": "https://www.helpnetsecurity.com/2026/08/24/cybersecurity-job-ads-ai-skills-research/"
    },
    {
      "n": "TryHackMe: Best SIEM training platforms for beginners",
      "u": "https://tryhackme.com/resources/blog/best-siem-training-platforms-for-beginners-splunk-elk-azure-2026"
    },
    {
      "n": "TryHackMe: Am I ready for a SOC Level 1 role? A skills checklist",
      "u": "https://tryhackme.com/resources/blog/am-i-ready-for-a-soc-level-1-role-a-hands-on-skills-checklist"
    }
  ]
} as const;

export type Cert = { n: string; by: string; u: string; get: string; when: string; who: Who; note: string };
export type LearnFree = { n: string; by: string; u: string; get: string; who: Who };
export type Paid = { n: string; why: string; u: string };

export const CERTS: { free: Cert[]; learnFree: LearnFree[]; notFree: { n: string; u: string; get: string }; paid: Paid[]; honest: string } = {
  "free": [
    {
      "n": "Introduction to Cybersecurity",
      "by": "Cisco Networking Academy",
      "u": "https://www.netacad.com/courses/introduction-to-cybersecurity",
      "get": "Free course. Cisco issues a verifiable badge or certificate when you finish.",
      "when": "Week 1 to 2",
      "who": "Both",
      "note": "Best first one. Short and plain."
    },
    {
      "n": "Networking Basics",
      "by": "Cisco Networking Academy",
      "u": "https://www.netacad.com/courses/networking-basics",
      "get": "Free course with labs, and a completion recognition.",
      "when": "Week 3 to 6",
      "who": "Both",
      "note": "Matches Foundation topic 1.3."
    },
    {
      "n": "Cybersecurity Fundamentals",
      "by": "IBM SkillsBuild",
      "u": "https://skillsbuild.org/digital-credentials",
      "get": "Free to learners. A digital credential on Credly, about 7.5 hours of learning.",
      "when": "Week 4 to 6",
      "who": "Both",
      "note": "Covers threats, social engineering, crypto and risk."
    },
    {
      "n": "Fortinet Certified Fundamentals in Cybersecurity",
      "by": "Fortinet Training Institute",
      "u": "https://training.fortinet.com/local/staticpage/view.php?page=fcf_cybersecurity",
      "get": "Fortinet made its self-paced courses free in 2020. You get an exam badge, then a certification badge.",
      "when": "Week 6 to 8",
      "who": "Both",
      "note": "Check the exam is still free on the page before you start."
    },
    {
      "n": "Mastercard Cybersecurity job simulation",
      "by": "Forage",
      "u": "https://www.theforage.com/simulations/mastercard/cybersecurity-t8ye",
      "get": "Free. A certificate of completion after 1 to 2 hours.",
      "when": "Any weekend",
      "who": "SOC",
      "note": "A small phishing task. Shows initiative, not a qualification."
    },
    {
      "n": "Free AWS digital badges",
      "by": "AWS Skill Builder",
      "u": "https://aws.amazon.com/training/badges/",
      "get": "Most badges are free to earn through Skill Builder. Pass the assessment and claim it on Credly.",
      "when": "Month 3 to 4",
      "who": "Engineer",
      "note": "Not all are free. The Security Champion path needs a paid subscription."
    },
    {
      "n": "API security courses",
      "by": "APIsec University",
      "u": "https://www.apisecuniversity.com/",
      "get": "Free API security training for AppSec and DevSecOps people. Check the site for the certificate details.",
      "when": "Month 4 to 6",
      "who": "Engineer",
      "note": "Good fit for the AppSec part of Phase 6."
    }
  ],
  "learnFree": [
    {
      "n": "Security, Compliance and Identity Fundamentals (SC-900)",
      "by": "Microsoft Learn",
      "u": "https://learn.microsoft.com/en-us/training/paths/describe-concepts-of-security-compliance-identity/",
      "get": "The learning path is free. The exam has a fee.",
      "who": "Both"
    },
    {
      "n": "Security Operations Analyst (SC-200) learning paths",
      "by": "Microsoft Learn",
      "u": "https://learn.microsoft.com/en-us/training/paths/sc-200-configure-azure-sentinel-environment/",
      "get": "Free Sentinel and Defender training. The exam has a fee.",
      "who": "SOC"
    },
    {
      "n": "Splunk free eLearning",
      "by": "Splunk Education",
      "u": "https://education.splunk.com/course/intro-to-splunk-elearning",
      "get": "Free intro course. Splunk's certification exams have a fee.",
      "who": "SOC"
    }
  ],
  "notFree": {
    "n": "ISC2 Certified in Cybersecurity (CC)",
    "u": "https://www.isc2.org/Insights/2026/04/one-million-certified-cyber-conclusion",
    "get": "ISC2's free training and exam offer ended with the One Million Certified in Cybersecurity programme (announced 22 April 2026). Check isc2.org for what it costs now."
  },
  "paid": [
    {
      "n": "CompTIA Security+",
      "why": "The best-known entry certification. Professor Messer's course covers the whole exam for free.",
      "u": "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/"
    },
    {
      "n": "Security Blue Team BTL1",
      "why": "A hands-on exam for the SOC track. Worth saving for after Security+.",
      "u": "https://securityblue.team/"
    },
    {
      "n": "Microsoft SC-200",
      "why": "Good if your target employers run Microsoft. The learning is free.",
      "u": "https://learn.microsoft.com/en-us/training/paths/sc-200-configure-azure-sentinel-environment/"
    }
  ],
  "honest": "Free certificates show you started and finished. They do not prove skill the way a hands-on lab or a project does. With junior postings so rare, spend most of your time on projects and use certificates to fill gaps."
};

export type Tool = { n: string; who: "S" | "E" | "B"; why: string; lu: string; ln: string; pu: string; pn: string; time: string };
export type ToolStage = { stage: string; title: string; sub: string; tools: Tool[] };

export const TOOLS: ToolStage[] = [
  {
    "stage": "1",
    "title": "Build your lab",
    "sub": "Week 1. Somewhere safe to break things.",
    "tools": [
      {
        "n": "VirtualBox",
        "who": "B",
        "why": "Free, runs on any laptop, and lets you attack and defend inside VMs without risk.",
        "lu": "https://www.virtualbox.org/manual/",
        "ln": "VirtualBox manual",
        "pu": "https://ubuntu.com/download/desktop",
        "pn": "Install an Ubuntu VM",
        "time": "1 to 2 days"
      },
      {
        "n": "Linux shell (Bash)",
        "who": "B",
        "why": "Every security tool you will use runs on Linux first. Learn it before any single tool.",
        "lu": "https://linuxjourney.com/",
        "ln": "Linux Journey",
        "pu": "https://overthewire.org/wargames/bandit/",
        "pn": "OverTheWire: Bandit",
        "time": "2 to 3 weeks"
      },
      {
        "n": "Git and GitHub",
        "who": "B",
        "why": "Your portfolio lives here. Hiring managers read your repos.",
        "lu": "https://git-scm.com/book/en/v2",
        "ln": "Pro Git (free)",
        "pu": "https://skills.github.com/",
        "pn": "GitHub Skills",
        "time": "1 week"
      }
    ]
  },
  {
    "stage": "2",
    "title": "See network traffic",
    "sub": "Week 4 to 8. What really crosses the wire.",
    "tools": [
      {
        "n": "Wireshark",
        "who": "B",
        "why": "The standard packet reader. Everything on the network can be shown in it.",
        "lu": "https://www.wireshark.org/docs/wsug_html_chunked/",
        "ln": "Wireshark User's Guide",
        "pu": "https://www.malware-traffic-analysis.net/",
        "pn": "Malware Traffic Analysis captures",
        "time": "2 weeks"
      },
      {
        "n": "Nmap",
        "who": "B",
        "why": "Shows what is open on a machine. Used by attackers and defenders alike.",
        "lu": "https://nmap.org/book/",
        "ln": "Nmap book (free)",
        "pu": "https://scanme.nmap.org/",
        "pn": "scanme.nmap.org (allowed target)",
        "time": "1 week"
      },
      {
        "n": "Suricata",
        "who": "S",
        "why": "A free IDS with a big free rule set. Picked over Snort for new labs because it is actively developed and widely deployed.",
        "lu": "https://docs.suricata.io/",
        "ln": "Suricata docs",
        "pu": "https://rules.emergingthreats.net/",
        "pn": "Emerging Threats Open rules",
        "time": "1 to 2 weeks"
      }
    ]
  },
  {
    "stage": "3",
    "title": "See what hosts and apps log",
    "sub": "Week 8 to 16. Pick one SIEM first, then compare.",
    "tools": [
      {
        "n": "Sysmon",
        "who": "B",
        "why": "Logs every process start on Windows. It is the data most Windows detections rely on.",
        "lu": "https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon",
        "ln": "Sysmon docs",
        "pu": "https://github.com/SwiftOnSecurity/sysmon-config",
        "pn": "A trusted Sysmon config",
        "time": "3 to 5 days"
      },
      {
        "n": "Wazuh",
        "who": "B",
        "why": "Free, open-source SIEM plus endpoint agent. The best home-lab choice because you own the whole stack.",
        "lu": "https://documentation.wazuh.com/current/quickstart.html",
        "ln": "Wazuh quickstart",
        "pu": "https://documentation.wazuh.com/current/getting-started/index.html",
        "pn": "Add an agent and read alerts",
        "time": "1 to 2 weeks"
      },
      {
        "n": "Splunk",
        "who": "S",
        "why": "Learn this first for jobs: TryHackMe says it is the SIEM named most in postings (their claim, not independently checked).",
        "lu": "https://education.splunk.com/course/intro-to-splunk-elearning",
        "ln": "Intro to Splunk (free)",
        "pu": "https://github.com/splunk/botsv3",
        "pn": "Boss of the SOC v3 data",
        "time": "2 to 3 weeks"
      },
      {
        "n": "Elastic Security",
        "who": "E",
        "why": "Open core and common in smaller firms. Good if you plan to build a pipeline.",
        "lu": "https://www.elastic.co/training/getting-started-intro-to-elastic-security",
        "ln": "Intro to Elastic Security (free)",
        "pu": "https://www.elastic.co/docs/solutions/security/get-started",
        "pn": "Elastic Security get started",
        "time": "1 to 2 weeks"
      },
      {
        "n": "Microsoft Sentinel (KQL)",
        "who": "B",
        "why": "Learn it third, or first if your target employers run Azure. KQL is worth knowing either way.",
        "lu": "https://learn.microsoft.com/en-us/training/paths/sc-200-utilize-kql-for-azure-sentinel/",
        "ln": "KQL learning path (free)",
        "pu": "https://learn.microsoft.com/en-us/azure/sentinel/skill-up-resources",
        "pn": "Sentinel skill-up training",
        "time": "2 weeks"
      }
    ]
  },
  {
    "stage": "4",
    "title": "Investigate and enrich",
    "sub": "Week 12 to 20. Turn an alert into an answer.",
    "tools": [
      {
        "n": "VirusTotal",
        "who": "B",
        "why": "The quickest check on a hash, domain or URL. Also has a free API to automate later.",
        "lu": "https://docs.virustotal.com/reference/overview",
        "ln": "VirusTotal API docs",
        "pu": "https://www.eicar.org/download-anti-malware-testfile/",
        "pn": "Check the harmless EICAR test file",
        "time": "1 day"
      },
      {
        "n": "MITRE ATT&CK and Navigator",
        "who": "B",
        "why": "The shared language for attacker behaviour. Every SOC and detection team uses it.",
        "lu": "https://attack.mitre.org/resources/learn-more-about-attack/training/attack-fundamentals/",
        "ln": "ATT&CK Fundamentals (free)",
        "pu": "https://mitre-attack.github.io/attack-navigator/",
        "pn": "ATT&CK Navigator",
        "time": "1 week"
      },
      {
        "n": "TheHive",
        "who": "S",
        "why": "Free case management. Shows how a team tracks an incident from alert to close.",
        "lu": "https://docs.strangebee.com/",
        "ln": "TheHive docs",
        "pu": "https://github.com/uruc/SOC-Automation-Lab",
        "pn": "SOC Automation Lab (Wazuh, Shuffle, TheHive)",
        "time": "1 week"
      },
      {
        "n": "Autopsy and Volatility",
        "who": "S",
        "why": "Free disk and memory forensics. Learn after you can triage alerts well.",
        "lu": "https://www.youtube.com/@13Cubed/playlists",
        "ln": "13Cubed videos",
        "pu": "https://cyberdefenders.org/",
        "pn": "CyberDefenders labs",
        "time": "2 to 3 weeks"
      }
    ]
  },
  {
    "stage": "5",
    "title": "Build and automate",
    "sub": "Month 5 onwards. The engineer track.",
    "tools": [
      {
        "n": "Python",
        "who": "E",
        "why": "The one language to learn. Used for log parsing, APIs and glue between tools.",
        "lu": "https://cs50.harvard.edu/python/",
        "ln": "CS50P (free)",
        "pu": "https://docs.abuseipdb.com/",
        "pn": "Script an IP check with AbuseIPDB",
        "time": "4 to 6 weeks"
      },
      {
        "n": "GitHub Actions",
        "who": "E",
        "why": "Runs your checks on every change. It is the base of most DevSecOps pipelines.",
        "lu": "https://docs.github.com/en/actions",
        "ln": "GitHub Actions docs",
        "pu": "https://github.com/gitleaks/gitleaks",
        "pn": "Add gitleaks to a repo",
        "time": "1 week"
      },
      {
        "n": "Sigma and Atomic Red Team",
        "who": "E",
        "why": "Sigma is a portable rule format. Atomic Red Team proves each rule really fires.",
        "lu": "https://sigmahq.io/docs/guide/getting-started.html",
        "ln": "Sigma getting started",
        "pu": "https://atomicredteam.io/",
        "pn": "Atomic Red Team",
        "time": "2 to 4 weeks"
      },
      {
        "n": "Terraform and Checkov",
        "who": "E",
        "why": "Defines cloud setups as code, then scans them for risky settings before they deploy.",
        "lu": "https://developer.hashicorp.com/terraform/tutorials",
        "ln": "Terraform tutorials (free)",
        "pu": "https://www.checkov.io/",
        "pn": "Checkov",
        "time": "2 to 3 weeks"
      },
      {
        "n": "Semgrep",
        "who": "E",
        "why": "Fast, free code scanner with readable rules. Easy to start and easy to add to a pipeline.",
        "lu": "https://semgrep.dev/docs/",
        "ln": "Semgrep docs",
        "pu": "https://semgrep.dev/playground",
        "pn": "Semgrep playground",
        "time": "1 week"
      },
      {
        "n": "Docker and Trivy",
        "who": "E",
        "why": "Containers are everywhere. Trivy scans images and config for known flaws.",
        "lu": "https://docs.docker.com/get-started/",
        "ln": "Docker get started",
        "pu": "https://aquasecurity.github.io/trivy/latest/",
        "pn": "Trivy docs",
        "time": "1 to 2 weeks"
      },
      {
        "n": "Shuffle",
        "who": "E",
        "why": "Free SOAR. Turn a repeated manual check into a playbook that runs by itself.",
        "lu": "https://github.com/shuffle/shuffle-docs/blob/master/docs/getting_started.md",
        "ln": "Shuffle getting started",
        "pu": "https://github.com/uruc/SOC-Automation-Lab",
        "pn": "SOC Automation Lab",
        "time": "2 weeks"
      }
    ]
  }
];

export type Project = { n: string; lvl: "Starter" | "Core" | "Stretch"; who: Who; hrs: string; build: string; tools: string; ship: string; u: string; un: string };

export const PROJECTS: Project[] = [
  {
    "n": "Publish 10 ShiftLab case reports",
    "lvl": "Starter",
    "who": "SOC",
    "hrs": "8 to 10 hours",
    "build": "Work ten alerts in the queue and publish each write-up: verdict, evidence and what you would do next.",
    "tools": "ShiftLab, Markdown",
    "ship": "A GitHub page or LinkedIn post per report",
    "u": "https://shiftlab.blueteam-labs.workers.dev/",
    "un": "Open ShiftLab"
  },
  {
    "n": "Rebuild a real incident from a public write-up",
    "lvl": "Starter",
    "who": "SOC",
    "hrs": "8 to 10 hours",
    "build": "Take one case from The DFIR Report and write a two-page incident report with a timeline and ATT&CK techniques.",
    "tools": "The DFIR Report, ATT&CK Navigator",
    "ship": "A two-page PDF and the Navigator layer",
    "u": "https://thedfirreport.com/",
    "un": "The DFIR Report"
  },
  {
    "n": "Home SOC lab with Wazuh and Sysmon",
    "lvl": "Core",
    "who": "Both",
    "hrs": "20 to 30 hours",
    "build": "Install Wazuh, add a Windows VM with Sysmon, run five Atomic Red Team tests and show the alert for each.",
    "tools": "Wazuh, Sysmon, Atomic Red Team, VirtualBox",
    "ship": "A README with a diagram and one screenshot per alert",
    "u": "https://documentation.wazuh.com/current/quickstart.html",
    "un": "Wazuh quickstart"
  },
  {
    "n": "Investigate Splunk Boss of the SOC v3",
    "lvl": "Core",
    "who": "SOC",
    "hrs": "15 hours",
    "build": "Answer 20 questions from the free dataset and keep every search you wrote.",
    "tools": "Splunk Free, BOTS v3",
    "ship": "A write-up with your searches and answers",
    "u": "https://github.com/splunk/botsv3",
    "un": "BOTS v3 dataset"
  },
  {
    "n": "Phishing triage script",
    "lvl": "Core",
    "who": "Both",
    "hrs": "10 to 15 hours",
    "build": "Python reads an .eml file, checks the sender, links and attachment hashes with VirusTotal, and prints a verdict.",
    "tools": "Python, VirusTotal API",
    "ship": "A repo with tests and a sample email",
    "u": "https://docs.virustotal.com/reference/overview",
    "un": "VirusTotal API docs"
  },
  {
    "n": "Threat model for a small app",
    "lvl": "Core",
    "who": "Engineer",
    "hrs": "10 hours",
    "build": "Draw a data flow diagram, list ten STRIDE threats with a control each, and check the design against ASVS.",
    "tools": "OWASP Threat Dragon, ASVS",
    "ship": "A diagram and a one-page risk list",
    "u": "https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html",
    "un": "Threat modeling cheat sheet"
  },
  {
    "n": "Secure pipeline with four scanners",
    "lvl": "Core",
    "who": "Engineer",
    "hrs": "15 to 20 hours",
    "build": "A GitHub Actions workflow runs Semgrep, gitleaks, Trivy and Checkov, and fails the build on high findings.",
    "tools": "GitHub Actions, Semgrep, gitleaks, Trivy, Checkov",
    "ship": "A repo with a passing and a failing run",
    "u": "https://docs.github.com/en/actions",
    "un": "GitHub Actions docs"
  },
  {
    "n": "Detection-as-code repository",
    "lvl": "Stretch",
    "who": "Engineer",
    "hrs": "25 to 35 hours",
    "build": "Ten Sigma rules mapped to ATT&CK, each tested with Atomic Red Team and converted for Splunk or Elastic.",
    "tools": "Sigma, Atomic Red Team, Wazuh or Splunk, GitHub Actions",
    "ship": "A repo with rules, tests and a coverage map",
    "u": "https://sigmahq.io/docs/guide/getting-started.html",
    "un": "Sigma getting started"
  },
  {
    "n": "Alert-to-ticket automation",
    "lvl": "Stretch",
    "who": "Both",
    "hrs": "20 to 30 hours",
    "build": "A Wazuh alert triggers Shuffle, which checks the IP on VirusTotal and opens a case in TheHive.",
    "tools": "Wazuh, Shuffle, TheHive",
    "ship": "A diagram, a short video and the workflow export",
    "u": "https://github.com/uruc/SOC-Automation-Lab",
    "un": "SOC Automation Lab"
  },
  {
    "n": "Cloud misconfiguration hunt",
    "lvl": "Stretch",
    "who": "Engineer",
    "hrs": "25 hours",
    "build": "Deploy a vulnerable AWS scenario, turn on CloudTrail, run Prowler, then fix each finding in Terraform. Set a billing alert first.",
    "tools": "CloudGoat, CloudTrail, Prowler, Terraform",
    "ship": "Before and after findings plus the Terraform fixes",
    "u": "https://github.com/RhinoSecurityLabs/cloudgoat",
    "un": "CloudGoat"
  },
  {
    "n": "Security test of a small LLM app",
    "lvl": "Stretch",
    "who": "Engineer",
    "hrs": "15 hours",
    "build": "Build a tiny chatbot, try prompt injections against it, add logging and guardrails, and report findings against the OWASP LLM Top 10. Use a local model if you want no cost.",
    "tools": "Python, OWASP LLM Top 10, MITRE ATLAS",
    "ship": "A findings report and the hardened code",
    "u": "https://genai.owasp.org/llm-top-10/",
    "un": "OWASP LLM Top 10"
  }
];
