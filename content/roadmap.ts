// The public roadmap (/roadmap): phases, topics, free resources, practice, and a ShiftLab practice link where one fits.
// Links last checked on CHECKED; recheck them every few months.
// soc / eng: how much a topic matters for each track. E = essential, R = recommended, O = optional, - = not in that track.

export type Kind = "Video" | "Course" | "Lab" | "Docs" | "Book" | "Tool" | "Podcast";
export type Priority = "E" | "R" | "O" | "-";
export type Resource = { name: string; url: string; kind: Kind; note: string };
export type Practice = { href: string; label: string };
export type Book = { title: string; author: string; url?: string };
export type Topic = {
  slug: string;
  name: string;
  text: string;
  sub: string[];
  practice?: Practice;
  soc: Priority;
  eng: Priority;
  time: string;
  resources: Resource[]; // the first one is the "start here" link
  books: Book[];
  exercises: string[];
  milestones: string[];
  tools: string[];
};
export type Section = { name: string; topics: Topic[] };
export type Phase = { id: string; name: string; time: string; goal: string; outcome: string; engineerOnly?: boolean; sections: Section[] };

export const CHECKED = "18 Nov 2026";

export const PHASES: Phase[] = [
  {
    "id": "foundation",
    "name": "Foundation",
    "time": "4 to 8 weeks",
    "goal": "Learn how computers and networks work before you try to defend them.",
    "outcome": "use Linux, explain how traffic moves, and talk about risk in plain words.",
    "sections": [
      {
        "name": "Computer fundamentals",
        "topics": [
          {
            "slug": "operating-systems",
            "name": "Operating systems",
            "text": "How an OS runs programs, shares memory and stores files.",
            "sub": [
              "Processes and threads",
              "Memory",
              "File systems",
              "How a PC boots"
            ],
            "soc": "R",
            "eng": "R",
            "time": "2 to 3 weeks",
            "resources": [
              {
                "name": "Crash Course Computer Science",
                "url": "https://www.youtube.com/@crashcourse",
                "kind": "Video",
                "note": "Friendly free video series on how computers work. Open the Computer Science playlist."
              },
              {
                "name": "Operating Systems: Three Easy Pieces",
                "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/",
                "kind": "Book",
                "note": "Free online textbook. Read the chapters on processes, memory and files."
              },
              {
                "name": "CS50's Introduction to Computer Science",
                "url": "https://cs50.harvard.edu/x/",
                "kind": "Course",
                "note": "Free Harvard course. The first five weeks build the base."
              },
              {
                "name": "TryHackMe: Windows Fundamentals 1",
                "url": "https://tryhackme.com/room/windowsfundamentals1xbx",
                "kind": "Lab",
                "note": "Guided tour of Windows in the browser. Free room."
              },
              {
                "name": "Process Explorer",
                "url": "https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer",
                "kind": "Tool",
                "note": "Watch processes, handles and DLLs live."
              }
            ],
            "books": [
              {
                "title": "Operating Systems: Three Easy Pieces",
                "author": "Remzi and Andrea Arpaci-Dusseau",
                "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/"
              },
              {
                "title": "Operating System Concepts",
                "author": "Silberschatz, Galvin and Gagne"
              }
            ],
            "exercises": [
              "Watch running processes in Task Manager and with ps",
              "Compare how Windows and Linux store files",
              "Watch memory use change as you open apps"
            ],
            "milestones": [
              "Explain a process vs a thread",
              "Name the main parts of an OS",
              "Describe what happens when a PC boots"
            ],
            "tools": [
              "Task Manager",
              "Process Explorer",
              "htop"
            ]
          },
          {
            "slug": "linux-fundamentals",
            "name": "Linux fundamentals",
            "text": "Move around the shell, read files, and manage users and permissions.",
            "sub": [
              "File system and paths",
              "Permissions",
              "Users and groups",
              "grep, find and pipes"
            ],
            "practice": {
              "href": "/logs?q=host:app-lin-02",
              "label": "Find a new user and a cron job in a Linux server log"
            },
            "soc": "E",
            "eng": "E",
            "time": "3 to 4 weeks",
            "resources": [
              {
                "name": "Linux Journey",
                "url": "https://linuxjourney.com/",
                "kind": "Course",
                "note": "Short free lessons from zero. Do Grasshopper and Journeyman first."
              },
              {
                "name": "OverTheWire: Bandit",
                "url": "https://overthewire.org/wargames/bandit/",
                "kind": "Lab",
                "note": "Free command-line game. Finish levels 0 to 15."
              },
              {
                "name": "The Linux Command Line",
                "url": "https://linuxcommand.org/tlcl.php",
                "kind": "Book",
                "note": "Free full book by William Shotts."
              },
              {
                "name": "TryHackMe: Linux Fundamentals Part 1",
                "url": "https://tryhackme.com/room/linuxfundamentalspart1",
                "kind": "Lab",
                "note": "Guided room in the browser. Free."
              },
              {
                "name": "NetworkChuck",
                "url": "https://www.youtube.com/@NetworkChuck",
                "kind": "Video",
                "note": "Friendly free Linux and networking videos."
              }
            ],
            "books": [
              {
                "title": "The Linux Command Line",
                "author": "William Shotts",
                "url": "https://linuxcommand.org/tlcl.php"
              },
              {
                "title": "Linux Basics for Hackers",
                "author": "OccupyTheWeb"
              }
            ],
            "exercises": [
              "Finish Bandit levels 0 to 10",
              "Set file permissions with chmod and chown",
              "Search a log file with grep and pipes"
            ],
            "milestones": [
              "Move around the file system with no mouse",
              "Read and filter auth.log",
              "Create users and groups"
            ],
            "tools": [
              "Bash",
              "grep",
              "find",
              "nano"
            ]
          },
          {
            "slug": "networking-basics",
            "name": "Networking basics",
            "text": "IP addresses, ports, TCP and UDP, DNS, and how traffic finds its way.",
            "sub": [
              "OSI and TCP/IP models",
              "IP and subnetting",
              "TCP vs UDP",
              "DNS and DHCP"
            ],
            "practice": {
              "href": "/logs?q=source:dns",
              "label": "Read DNS lookups and spot a look-alike domain"
            },
            "soc": "E",
            "eng": "E",
            "time": "4 to 6 weeks",
            "resources": [
              {
                "name": "Professor Messer: Network+ N10-009 course",
                "url": "https://www.youtube.com/playlist?list=PLG49S3nxzAnl_tQe3kvnmeMid0mjF8Le8",
                "kind": "Video",
                "note": "Complete free playlist. Watch OSI, IP, ports and DNS first."
              },
              {
                "name": "Cisco Networking Academy: Networking Basics",
                "url": "https://www.netacad.com/courses/networking-basics",
                "kind": "Course",
                "note": "Free self-paced course with labs."
              },
              {
                "name": "Practical Networking",
                "url": "https://www.practicalnetworking.net/",
                "kind": "Course",
                "note": "Clear free articles and videos on subnetting, NAT and routing."
              },
              {
                "name": "Wireshark sample captures",
                "url": "https://wiki.wireshark.org/SampleCaptures",
                "kind": "Lab",
                "note": "Free practice traffic to open and read."
              },
              {
                "name": "TryHackMe: Pre Security path",
                "url": "https://tryhackme.com/path/outline/presecuritylegacy",
                "kind": "Lab",
                "note": "Beginner path with networking rooms. Free rooms are limited."
              }
            ],
            "books": [
              {
                "title": "Computer Networking: A Top-Down Approach",
                "author": "Kurose and Ross"
              }
            ],
            "exercises": [
              "Capture your own traffic in Wireshark",
              "Split a /24 network into four subnets",
              "Follow one DNS lookup step by step"
            ],
            "milestones": [
              "Explain the TCP three-way handshake",
              "Read IP, port and protocol in a packet",
              "Say what DNS and DHCP do"
            ],
            "tools": [
              "Wireshark",
              "ping",
              "traceroute",
              "nslookup"
            ]
          },
          {
            "slug": "programming-basics",
            "name": "Programming basics",
            "text": "Write small Python scripts to automate repetitive checks.",
            "sub": [
              "Python syntax",
              "Loops and files",
              "Regular expressions",
              "Small automation scripts"
            ],
            "soc": "R",
            "eng": "E",
            "time": "3 to 4 weeks",
            "resources": [
              {
                "name": "CS50's Introduction to Programming with Python",
                "url": "https://cs50.harvard.edu/python/",
                "kind": "Course",
                "note": "Free Harvard course with problem sets. The best structured start."
              },
              {
                "name": "Automate the Boring Stuff with Python",
                "url": "https://automatetheboringstuff.com/",
                "kind": "Book",
                "note": "Free online book. The files, regex and web chapters match real SOC chores."
              },
              {
                "name": "Corey Schafer: Python tutorials",
                "url": "https://www.youtube.com/@coreyms",
                "kind": "Video",
                "note": "Clear free video tutorials."
              },
              {
                "name": "regex101",
                "url": "https://regex101.com/",
                "kind": "Tool",
                "note": "Test regular expressions live."
              }
            ],
            "books": [
              {
                "title": "Automate the Boring Stuff with Python",
                "author": "Al Sweigart",
                "url": "https://automatetheboringstuff.com/"
              },
              {
                "title": "Python Crash Course",
                "author": "Eric Matthes"
              }
            ],
            "exercises": [
              "Write a script that counts failed logins in a log",
              "Read a CSV of IP addresses",
              "Use a regex to pull URLs out of text"
            ],
            "milestones": [
              "Write loops, functions and if-statements",
              "Read and write files",
              "Automate one boring task"
            ],
            "tools": [
              "Python",
              "VS Code",
              "Jupyter"
            ]
          }
        ]
      },
      {
        "name": "Security principles",
        "topics": [
          {
            "slug": "cia-triad-and-core-ideas",
            "name": "CIA triad and core ideas",
            "text": "Confidentiality, integrity and availability, plus risk, threats and controls.",
            "sub": [
              "Confidentiality",
              "Integrity",
              "Availability",
              "Risk and controls"
            ],
            "practice": {
              "href": "/glossary",
              "label": "Look up terms in the Glossary"
            },
            "soc": "E",
            "eng": "E",
            "time": "1 week",
            "resources": [
              {
                "name": "Professor Messer: Security+ SY0-701 course",
                "url": "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/",
                "kind": "Video",
                "note": "Free full video course. Section 1 covers the core ideas."
              },
              {
                "name": "CS50's Introduction to Cybersecurity",
                "url": "https://cs50.harvard.edu/cybersecurity/",
                "kind": "Course",
                "note": "Free Harvard course for beginners."
              },
              {
                "name": "NIST Cybersecurity Framework",
                "url": "https://www.nist.gov/cyberframework",
                "kind": "Docs",
                "note": "The framework most SOCs map to. Read the six functions."
              },
              {
                "name": "CIS Critical Security Controls",
                "url": "https://www.cisecurity.org/controls",
                "kind": "Docs",
                "note": "Practical controls, ordered by value."
              }
            ],
            "books": [
              {
                "title": "Security Engineering",
                "author": "Ross Anderson",
                "url": "https://www.cl.cam.ac.uk/~rja14/book.html"
              },
              {
                "title": "CompTIA Security+ Study Guide",
                "author": "Mike Chapple and David Seidl"
              }
            ],
            "exercises": [
              "Sort 10 incidents by which part of CIA they hit",
              "Write a simple risk table for a home network",
              "Match controls to threats"
            ],
            "milestones": [
              "Explain the CIA triad with an example",
              "Tell a threat from a vulnerability",
              "Name the NIST CSF functions"
            ],
            "tools": [
              "NIST CSF",
              "Risk register"
            ]
          },
          {
            "slug": "cryptography-basics",
            "name": "Cryptography basics",
            "text": "Hashing, encryption and certificates, and what each one protects.",
            "sub": [
              "Hashing",
              "Symmetric vs asymmetric",
              "Certificates and PKI",
              "TLS basics"
            ],
            "soc": "R",
            "eng": "R",
            "time": "1 to 2 weeks",
            "resources": [
              {
                "name": "Khan Academy: Cryptography",
                "url": "https://www.khanacademy.org/computing/computer-science/cryptography",
                "kind": "Course",
                "note": "Free short lessons with visuals."
              },
              {
                "name": "Computerphile",
                "url": "https://www.youtube.com/@Computerphile",
                "kind": "Video",
                "note": "Clear free explainers on hashing, TLS and keys."
              },
              {
                "name": "CyberChef",
                "url": "https://gchq.github.io/CyberChef/",
                "kind": "Tool",
                "note": "Free browser tool to encode, decode and hash."
              },
              {
                "name": "Cryptopals",
                "url": "https://cryptopals.com/",
                "kind": "Lab",
                "note": "Free practical challenges for the curious."
              },
              {
                "name": "Crypto 101",
                "url": "https://www.crypto101.io/",
                "kind": "Book",
                "note": "Free introductory book."
              }
            ],
            "books": [
              {
                "title": "Crypto 101",
                "author": "Laurens Van Houtven",
                "url": "https://www.crypto101.io/"
              },
              {
                "title": "Serious Cryptography",
                "author": "Jean-Philippe Aumasson"
              }
            ],
            "exercises": [
              "Hash a file and compare two hashes",
              "Inspect a website's TLS certificate",
              "Encode and decode Base64 in CyberChef"
            ],
            "milestones": [
              "Explain hashing vs encryption",
              "Tell symmetric from asymmetric keys",
              "Read a certificate chain"
            ],
            "tools": [
              "CyberChef",
              "OpenSSL",
              "sha256sum"
            ]
          },
          {
            "slug": "policies-and-compliance",
            "name": "Policies and compliance",
            "text": "Why companies write security rules, and how audits check them.",
            "sub": [
              "Security policies",
              "Acceptable use",
              "ISO 27001 and NIST",
              "Audits"
            ],
            "soc": "O",
            "eng": "R",
            "time": "1 week",
            "resources": [
              {
                "name": "SANS security policy templates",
                "url": "https://www.sans.org/information-security-policy/",
                "kind": "Docs",
                "note": "Free ready-made policy templates used in real companies."
              },
              {
                "name": "ISO/IEC 27001 overview",
                "url": "https://www.iso.org/standard/27001",
                "kind": "Docs",
                "note": "What the standard asks for. The overview is free."
              },
              {
                "name": "NIST SP 800-53 control catalog",
                "url": "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
                "kind": "Docs",
                "note": "Free control catalog. Skim the families."
              }
            ],
            "books": [
              {
                "title": "Information Security Policies, Procedures, and Standards",
                "author": "Thomas R. Peltier"
              }
            ],
            "exercises": [
              "Write an acceptable use policy for a small office",
              "Map one policy to an ISO 27001 control",
              "List what an auditor would ask to see"
            ],
            "milestones": [
              "Explain policy vs standard vs procedure",
              "Name common frameworks",
              "Describe what an audit checks"
            ],
            "tools": [
              "Policy templates",
              "Checklists"
            ]
          }
        ]
      },
      {
        "name": "First security tools",
        "topics": [
          {
            "slug": "security-tool-basics",
            "name": "Security tool basics",
            "text": "Try the everyday tools of the job in guided labs.",
            "sub": [
              "Nmap",
              "Wireshark",
              "Burp Suite basics",
              "CyberChef"
            ],
            "practice": {
              "href": "/tools",
              "label": "Check links and headers in Analyst tools"
            },
            "soc": "E",
            "eng": "R",
            "time": "2 to 3 weeks",
            "resources": [
              {
                "name": "TryHackMe: Complete Beginner path",
                "url": "https://tryhackme.com/beginner-path",
                "kind": "Lab",
                "note": "Guided rooms for Nmap, Wireshark and more. Free rooms are limited."
              },
              {
                "name": "Nmap Network Scanning",
                "url": "https://nmap.org/book/",
                "kind": "Book",
                "note": "The official guide, free online."
              },
              {
                "name": "Wireshark User's Guide",
                "url": "https://www.wireshark.org/docs/wsug_html_chunked/",
                "kind": "Docs",
                "note": "Official free guide to capture and filters."
              },
              {
                "name": "Chris Greer: Wireshark videos",
                "url": "https://www.youtube.com/@ChrisGreer",
                "kind": "Video",
                "note": "Free practical packet analysis."
              },
              {
                "name": "Burp Suite Community Edition",
                "url": "https://portswigger.net/burp/communitydownload",
                "kind": "Tool",
                "note": "Free web proxy."
              }
            ],
            "books": [
              {
                "title": "Nmap Network Scanning",
                "author": "Gordon Lyon",
                "url": "https://nmap.org/book/"
              },
              {
                "title": "Practical Packet Analysis",
                "author": "Chris Sanders"
              }
            ],
            "exercises": [
              "Scan your own lab VM with Nmap",
              "Follow a TCP stream in Wireshark",
              "Decode a suspicious string in CyberChef"
            ],
            "milestones": [
              "Run a basic Nmap scan and read it",
              "Filter traffic in Wireshark",
              "Build a CyberChef recipe"
            ],
            "tools": [
              "Nmap",
              "Wireshark",
              "CyberChef",
              "Burp Suite"
            ]
          },
          {
            "slug": "vulnerability-scanning",
            "name": "Vulnerability scanning",
            "text": "Scan machines you own for known weaknesses and read the report.",
            "sub": [
              "Discovery scans",
              "CVEs and CVSS",
              "Reading a scan report",
              "False positives"
            ],
            "soc": "R",
            "eng": "R",
            "time": "1 to 2 weeks",
            "resources": [
              {
                "name": "Greenbone Community Edition docs",
                "url": "https://greenbone.github.io/docs/latest/",
                "kind": "Docs",
                "note": "Free open-source scanner (OpenVAS). Follow the quick start."
              },
              {
                "name": "Nessus Essentials",
                "url": "https://www.tenable.com/products/nessus/nessus-essentials",
                "kind": "Tool",
                "note": "Free for up to 16 IP addresses."
              },
              {
                "name": "National Vulnerability Database",
                "url": "https://nvd.nist.gov/",
                "kind": "Docs",
                "note": "Look up any CVE and its CVSS score."
              },
              {
                "name": "FIRST: CVSS",
                "url": "https://www.first.org/cvss/",
                "kind": "Docs",
                "note": "How severity scores are worked out."
              },
              {
                "name": "Metasploitable 2",
                "url": "https://docs.rapid7.com/metasploit/metasploitable-2/",
                "kind": "Lab",
                "note": "A deliberately weak VM to scan safely."
              }
            ],
            "books": [
              {
                "title": "Network Security Assessment",
                "author": "Chris McNab"
              }
            ],
            "exercises": [
              "Scan a test VM and sort findings by severity",
              "Look up a CVE and its CVSS score",
              "Mark one finding as a false positive and say why"
            ],
            "milestones": [
              "Explain CVE and CVSS",
              "Read a scan report",
              "Spot a false positive"
            ],
            "tools": [
              "OpenVAS",
              "Nessus Essentials",
              "NVD"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "technical",
    "name": "Technical skills",
    "time": "8 to 16 weeks",
    "goal": "See how networks, systems and web apps are attacked, and how they are defended.",
    "outcome": "spot common network, host and web attacks, and say how each is stopped.",
    "sections": [
      {
        "name": "Network security",
        "topics": [
          {
            "slug": "protocols-and-their-weak-spots",
            "name": "Protocols and their weak spots",
            "text": "How common protocols work and where attackers abuse them.",
            "sub": [
              "HTTP and HTTPS",
              "DNS abuse",
              "SMB and RDP",
              "ARP spoofing"
            ],
            "practice": {
              "href": "/queue",
              "label": "Triage network alerts"
            },
            "soc": "E",
            "eng": "E",
            "time": "2 to 3 weeks",
            "resources": [
              {
                "name": "Malware Traffic Analysis",
                "url": "https://www.malware-traffic-analysis.net/",
                "kind": "Lab",
                "note": "Real attack captures with answers. Start with the training exercises."
              },
              {
                "name": "Zeek documentation",
                "url": "https://docs.zeek.org/",
                "kind": "Docs",
                "note": "Turn traffic into readable logs."
              },
              {
                "name": "Professor Messer: Network+ N10-009",
                "url": "https://www.youtube.com/playlist?list=PLG49S3nxzAnl_tQe3kvnmeMid0mjF8Le8",
                "kind": "Video",
                "note": "Watch the ports, protocols and attack videos."
              },
              {
                "name": "Cloudflare Learning Center",
                "url": "https://www.cloudflare.com/learning/",
                "kind": "Course",
                "note": "Free plain-English articles on DNS, DDoS and TLS."
              }
            ],
            "books": [
              {
                "title": "The Practice of Network Security Monitoring",
                "author": "Richard Bejtlich"
              },
              {
                "title": "Applied Network Security Monitoring",
                "author": "Chris Sanders and Jason Smith"
              }
            ],
            "exercises": [
              "Spot DNS tunnelling in a capture",
              "Find SMB brute force in logs",
              "Compare HTTP and HTTPS traffic"
            ],
            "milestones": [
              "Explain how ARP spoofing works",
              "Name risky open ports",
              "Tell normal DNS from abuse"
            ],
            "tools": [
              "Wireshark",
              "Zeek",
              "tcpdump"
            ]
          },
          {
            "slug": "firewalls-and-ids-ips",
            "name": "Firewalls and IDS/IPS",
            "text": "Rules that block or flag traffic, and how to read the alerts they raise.",
            "sub": [
              "Allow and deny rules",
              "Signatures vs anomalies",
              "Snort and Suricata rules",
              "Tuning out noise"
            ],
            "practice": {
              "href": "/logs?q=src:198.51.100.230",
              "label": "Spot a port scan in the firewall log"
            },
            "soc": "E",
            "eng": "R",
            "time": "2 weeks",
            "resources": [
              {
                "name": "Suricata documentation",
                "url": "https://docs.suricata.io/",
                "kind": "Docs",
                "note": "Free open-source IDS. Read the rules chapter."
              },
              {
                "name": "TryHackMe: Snort room",
                "url": "https://tryhackme.com/room/snort",
                "kind": "Lab",
                "note": "Write and test Snort rules. Free to start."
              },
              {
                "name": "Emerging Threats Open rules",
                "url": "https://rules.emergingthreats.net/",
                "kind": "Docs",
                "note": "Free rules used by real teams."
              },
              {
                "name": "pfSense documentation",
                "url": "https://docs.netgate.com/pfsense/en/latest/",
                "kind": "Docs",
                "note": "Build a firewall in a VM."
              },
              {
                "name": "Snort 3 documentation",
                "url": "https://docs.snort.org/",
                "kind": "Docs",
                "note": "The official Snort guide."
              }
            ],
            "books": [
              {
                "title": "Applied Network Security Monitoring",
                "author": "Chris Sanders and Jason Smith"
              }
            ],
            "exercises": [
              "Write a Snort rule for a port scan",
              "Read firewall deny logs for patterns",
              "Tune a noisy rule"
            ],
            "milestones": [
              "Explain IDS vs IPS",
              "Read a Snort alert",
              "Write one working rule"
            ],
            "tools": [
              "Snort",
              "Suricata",
              "pfSense"
            ]
          },
          {
            "slug": "vpns-and-secure-channels",
            "name": "VPNs and secure channels",
            "text": "How encrypted tunnels protect traffic between people and sites.",
            "sub": [
              "IPsec vs WireGuard",
              "Tunnelling",
              "Split tunnelling",
              "Remote access risks"
            ],
            "soc": "O",
            "eng": "R",
            "time": "1 week",
            "resources": [
              {
                "name": "WireGuard quick start",
                "url": "https://www.wireguard.com/quickstart/",
                "kind": "Docs",
                "note": "Set up a tunnel in minutes."
              },
              {
                "name": "Cloudflare: What is a VPN?",
                "url": "https://www.cloudflare.com/learning/access-management/what-is-a-vpn/",
                "kind": "Course",
                "note": "Plain-English explainer."
              },
              {
                "name": "How Tailscale works",
                "url": "https://tailscale.com/blog/how-tailscale-works",
                "kind": "Docs",
                "note": "A readable tour of modern VPN design."
              }
            ],
            "books": [
              {
                "title": "Network Security Essentials",
                "author": "William Stallings"
              }
            ],
            "exercises": [
              "Set up WireGuard between two VMs",
              "Capture VPN traffic and see what is hidden",
              "List the VPN logs a SOC would check"
            ],
            "milestones": [
              "Explain tunnelling",
              "Compare IPsec and WireGuard",
              "Name remote access risks"
            ],
            "tools": [
              "WireGuard",
              "OpenVPN"
            ]
          }
        ]
      },
      {
        "name": "System security",
        "topics": [
          {
            "slug": "operating-system-security",
            "name": "Operating system security",
            "text": "Harden Windows and Linux, and recognise privilege escalation.",
            "sub": [
              "Hardening baselines",
              "Windows event logs",
              "Privilege escalation",
              "Patching"
            ],
            "practice": {
              "href": "/logs?q=host:win-fs-05",
              "label": "Follow a Windows logon attack in the event logs"
            },
            "soc": "E",
            "eng": "E",
            "time": "3 weeks",
            "resources": [
              {
                "name": "Windows Security Log Encyclopedia",
                "url": "https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/",
                "kind": "Docs",
                "note": "Look up any event ID, such as 4624 or 4625."
              },
              {
                "name": "TryHackMe: Windows Fundamentals 1",
                "url": "https://tryhackme.com/room/windowsfundamentals1xbx",
                "kind": "Lab",
                "note": "Free guided room."
              },
              {
                "name": "CIS Benchmarks",
                "url": "https://www.cisecurity.org/cis-benchmarks",
                "kind": "Docs",
                "note": "Free hardening checklists for Windows and Linux."
              },
              {
                "name": "Microsoft Sysinternals",
                "url": "https://learn.microsoft.com/en-us/sysinternals/",
                "kind": "Tool",
                "note": "Free tools to see what a Windows host is doing."
              },
              {
                "name": "GTFOBins",
                "url": "https://gtfobins.github.io/",
                "kind": "Docs",
                "note": "Linux programs that help privilege escalation. Learn to spot misuse."
              },
              {
                "name": "Lynis",
                "url": "https://cisofy.com/lynis/",
                "kind": "Tool",
                "note": "Free Linux hardening audit."
              }
            ],
            "books": [
              {
                "title": "Windows Security Monitoring",
                "author": "Andrei Miroshnikov"
              }
            ],
            "exercises": [
              "Find logon events 4624 and 4625",
              "Harden a VM with a CIS checklist",
              "Spot a privilege escalation in logs"
            ],
            "milestones": [
              "Know the key Windows event IDs",
              "Explain least privilege",
              "Read sudo and auth logs"
            ],
            "tools": [
              "Event Viewer",
              "Sysinternals",
              "Lynis"
            ]
          },
          {
            "slug": "endpoint-protection",
            "name": "Endpoint protection",
            "text": "How EDR and host monitoring catch suspicious processes.",
            "sub": [
              "EDR and antivirus",
              "Process trees",
              "Sysmon",
              "Isolating a host"
            ],
            "practice": {
              "href": "/queue",
              "label": "Triage malware and EDR alerts"
            },
            "soc": "E",
            "eng": "R",
            "time": "2 to 3 weeks",
            "resources": [
              {
                "name": "Wazuh quickstart",
                "url": "https://documentation.wazuh.com/current/quickstart.html",
                "kind": "Docs",
                "note": "Free open-source SIEM and endpoint tool. Install it and add one agent."
              },
              {
                "name": "Sysmon",
                "url": "https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon",
                "kind": "Tool",
                "note": "Logs every process start. Use a trusted config."
              },
              {
                "name": "SwiftOnSecurity sysmon-config",
                "url": "https://github.com/SwiftOnSecurity/sysmon-config",
                "kind": "Docs",
                "note": "A trusted starting Sysmon config."
              },
              {
                "name": "Velociraptor documentation",
                "url": "https://docs.velociraptor.app/",
                "kind": "Docs",
                "note": "Free endpoint hunting and response."
              },
              {
                "name": "LOLBAS project",
                "url": "https://lolbas-project.github.io/",
                "kind": "Docs",
                "note": "Windows tools attackers abuse. Know what to look for."
              }
            ],
            "books": [
              {
                "title": "Evading EDR",
                "author": "Matt Hand"
              }
            ],
            "exercises": [
              "Install Wazuh and add one endpoint",
              "Read a process tree for a suspicious child process",
              "Isolate a host in a lab"
            ],
            "milestones": [
              "Explain EDR vs antivirus",
              "Read a process tree",
              "Know what Sysmon logs"
            ],
            "tools": [
              "Wazuh",
              "Sysmon",
              "Microsoft Defender"
            ]
          },
          {
            "slug": "vulnerability-management",
            "name": "Vulnerability management",
            "text": "Scan, rank by risk, patch, then confirm the fix worked.",
            "sub": [
              "Asset inventory",
              "Risk scoring",
              "Patch cycles",
              "Checking the fix"
            ],
            "soc": "R",
            "eng": "E",
            "time": "1 to 2 weeks",
            "resources": [
              {
                "name": "CISA Known Exploited Vulnerabilities",
                "url": "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
                "kind": "Docs",
                "note": "The list of bugs attackers use now. Patch these first."
              },
              {
                "name": "EPSS: Exploit Prediction Scoring",
                "url": "https://www.first.org/epss/",
                "kind": "Docs",
                "note": "A free score for how likely a bug is to be exploited."
              },
              {
                "name": "Nessus Essentials",
                "url": "https://www.tenable.com/products/nessus/nessus-essentials",
                "kind": "Tool",
                "note": "Free scanner for up to 16 IP addresses."
              },
              {
                "name": "Greenbone Community Edition docs",
                "url": "https://greenbone.github.io/docs/latest/",
                "kind": "Docs",
                "note": "Free open-source scanner."
              }
            ],
            "books": [
              {
                "title": "Practical Vulnerability Management",
                "author": "Andrew Magnusson"
              }
            ],
            "exercises": [
              "Rank 10 findings by real risk",
              "Check findings against the CISA KEV list",
              "Write a patch plan"
            ],
            "milestones": [
              "Explain the vulnerability lifecycle",
              "Prioritise by exploitability",
              "Confirm a fix with a rescan"
            ],
            "tools": [
              "Nessus Essentials",
              "OpenVAS",
              "CISA KEV"
            ]
          }
        ]
      },
      {
        "name": "Web application security",
        "topics": [
          {
            "slug": "owasp-top-10",
            "name": "OWASP Top 10",
            "text": "The most common web app weaknesses and how each is abused.",
            "sub": [
              "Injection",
              "Broken access control",
              "Cross-site scripting",
              "SSRF"
            ],
            "practice": {
              "href": "/queue",
              "label": "Triage web attack alerts"
            },
            "soc": "R",
            "eng": "E",
            "time": "3 to 4 weeks",
            "resources": [
              {
                "name": "PortSwigger Web Security Academy",
                "url": "https://portswigger.net/web-security",
                "kind": "Lab",
                "note": "The best free web security labs. Start with SQL injection and XSS."
              },
              {
                "name": "Web Security Academy: Essential skills (video)",
                "url": "https://www.youtube.com/playlist?list=PLzgroH3_jK2h4u-4efS_1xY2o2pHsMJbq",
                "kind": "Video",
                "note": "Short videos on core testing skills."
              },
              {
                "name": "OWASP Top 10",
                "url": "https://owasp.org/www-project-top-ten/",
                "kind": "Docs",
                "note": "The list itself, with examples."
              },
              {
                "name": "OWASP Juice Shop",
                "url": "https://owasp.org/projects/juice-shop",
                "kind": "Lab",
                "note": "An app built to be broken. Run it locally."
              },
              {
                "name": "OWASP Cheat Sheet Series",
                "url": "https://cheatsheetseries.owasp.org/",
                "kind": "Docs",
                "note": "Short fixes for each weakness."
              }
            ],
            "books": [
              {
                "title": "The Web Application Hacker's Handbook",
                "author": "Dafydd Stuttard and Marcus Pinto"
              }
            ],
            "exercises": [
              "Solve 5 SQL injection labs",
              "Find an XSS in a lab",
              "Read WAF logs for injection attempts"
            ],
            "milestones": [
              "Explain each Top 10 item",
              "Spot SQL injection and XSS in logs",
              "Tell a blocked attack from a successful one"
            ],
            "tools": [
              "Burp Suite",
              "OWASP ZAP",
              "Browser dev tools"
            ]
          },
          {
            "slug": "web-app-testing",
            "name": "Web app testing",
            "text": "Practise finding flaws in an app built to be broken.",
            "sub": [
              "Burp proxy",
              "Recon",
              "Login and session testing",
              "Writing findings"
            ],
            "soc": "O",
            "eng": "R",
            "time": "2 to 3 weeks",
            "resources": [
              {
                "name": "OWASP Juice Shop",
                "url": "https://owasp.org/projects/juice-shop",
                "kind": "Lab",
                "note": "Run it locally and solve the beginner challenges."
              },
              {
                "name": "OWASP Web Security Testing Guide",
                "url": "https://owasp.org/www-project-web-security-testing-guide/",
                "kind": "Docs",
                "note": "The full testing checklist, free."
              },
              {
                "name": "PortSwigger Web Security Academy",
                "url": "https://portswigger.net/web-security",
                "kind": "Lab",
                "note": "Free labs for every bug class."
              },
              {
                "name": "OWASP ZAP",
                "url": "https://www.zaproxy.org/",
                "kind": "Tool",
                "note": "Free scanner and proxy."
              },
              {
                "name": "TCM Security",
                "url": "https://www.youtube.com/@TCMSecurityAcademy",
                "kind": "Video",
                "note": "Free beginner ethical hacking videos."
              }
            ],
            "books": [
              {
                "title": "Real-World Bug Hunting",
                "author": "Peter Yaworski"
              }
            ],
            "exercises": [
              "Run Juice Shop locally",
              "Solve 10 Juice Shop challenges",
              "Write one finding like a real report"
            ],
            "milestones": [
              "Send traffic through Burp",
              "Test a login form",
              "Write a clear finding"
            ],
            "tools": [
              "OWASP Juice Shop",
              "Burp Suite",
              "OWASP ZAP"
            ]
          },
          {
            "slug": "secure-coding",
            "name": "Secure coding",
            "text": "Habits that stop common bugs before they ship.",
            "sub": [
              "Input validation",
              "Output encoding",
              "Handling secrets",
              "Code review"
            ],
            "soc": "O",
            "eng": "E",
            "time": "1 to 2 weeks",
            "resources": [
              {
                "name": "OWASP Cheat Sheet Series",
                "url": "https://cheatsheetseries.owasp.org/",
                "kind": "Docs",
                "note": "Short guides. Read Input Validation and Secrets Management first."
              },
              {
                "name": "OWASP Developer Guide",
                "url": "https://devguide.owasp.org/",
                "kind": "Docs",
                "note": "A free guide that follows the build cycle."
              },
              {
                "name": "OWASP Proactive Controls",
                "url": "https://owasp.org/www-project-proactive-controls/",
                "kind": "Docs",
                "note": "Ten habits that prevent most bugs."
              },
              {
                "name": "Semgrep documentation",
                "url": "https://semgrep.dev/docs/",
                "kind": "Tool",
                "note": "Free code scanner. Try the playground."
              }
            ],
            "books": [
              {
                "title": "Alice and Bob Learn Application Security",
                "author": "Tanya Janca"
              }
            ],
            "exercises": [
              "Find the bug in a vulnerable snippet",
              "Fix a SQL query with parameters",
              "Review code for hard-coded secrets"
            ],
            "milestones": [
              "Explain input validation",
              "Know why secrets never go in code",
              "Read a code review comment"
            ],
            "tools": [
              "Semgrep",
              "GitHub code scanning"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "specialise",
    "name": "Specialise",
    "time": "12 to 24 weeks",
    "goal": "Go deep on one side first, then learn the other. ShiftLab is built for the defensive side.",
    "outcome": "triage alerts, follow an incident from start to finish, and know which side you want.",
    "sections": [
      {
        "name": "Defensive security",
        "topics": [
          {
            "slug": "soc-operations",
            "name": "SOC operations",
            "text": "Triage alerts, investigate, decide and escalate, shift after shift.",
            "sub": [
              "Alert triage",
              "True vs false positive",
              "Escalation",
              "SIEM searches"
            ],
            "practice": {
              "href": "/queue",
              "label": "Work a shift in the Alert queue"
            },
            "soc": "E",
            "eng": "R",
            "time": "3 to 4 weeks",
            "resources": [
              {
                "name": "TryHackMe: SOC Level 1 path",
                "url": "https://tryhackme.com/resources/blog/introducing-the-revamped-soc-level-1-learning-path",
                "kind": "Lab",
                "note": "The most-used beginner SOC path. Only the first rooms are free."
              },
              {
                "name": "LetsDefend: SOC Analyst learning path",
                "url": "https://app.letsdefend.io/path/soc-analyst-learning-path",
                "kind": "Lab",
                "note": "Practise on real-style alerts. Free tier available."
              },
              {
                "name": "Splunk Boss of the SOC v3 dataset",
                "url": "https://github.com/splunk/botsv3",
                "kind": "Lab",
                "note": "Free attack data to investigate in Splunk."
              },
              {
                "name": "Hack The Box Academy: SOC Fundamentals",
                "url": "https://academy.hackthebox.com/course/preview/soc-fundamentals",
                "kind": "Course",
                "note": "Free preview of the module."
              },
              {
                "name": "Blue Team Labs Online",
                "url": "https://blueteamlabs.online/",
                "kind": "Lab",
                "note": "Free investigations to practise."
              },
              {
                "name": "CyberDefenders",
                "url": "https://cyberdefenders.org/",
                "kind": "Lab",
                "note": "Free blue team challenges."
              }
            ],
            "books": [
              {
                "title": "Blue Team Handbook: SOC, SIEM, and Threat Hunting",
                "author": "Don Murdoch"
              },
              {
                "title": "Security Operations Center",
                "author": "Joseph Muniz, Gary McIntyre and Nadhem AlFardan"
              }
            ],
            "exercises": [
              "Triage 10 alerts in the ShiftLab queue",
              "Write a ticket for one true positive",
              "Build a SIEM search for failed logins"
            ],
            "milestones": [
              "Tell true from false positives",
              "Know when to escalate",
              "Write a clear incident ticket"
            ],
            "tools": [
              "Splunk",
              "Elastic",
              "Wazuh",
              "TheHive"
            ]
          },
          {
            "slug": "incident-response",
            "name": "Incident response",
            "text": "Contain, clean up and recover, then learn from what happened.",
            "sub": [
              "Detect and analyse",
              "Contain",
              "Eradicate and recover",
              "Lessons learned"
            ],
            "practice": {
              "href": "/handover",
              "label": "Write a Shift handover"
            },
            "soc": "E",
            "eng": "R",
            "time": "2 to 3 weeks",
            "resources": [
              {
                "name": "NIST SP 800-61 Rev. 3",
                "url": "https://csrc.nist.gov/pubs/sp/800/61/r3/final",
                "kind": "Docs",
                "note": "The current guide teams follow. Read the lifecycle chapters."
              },
              {
                "name": "PagerDuty Incident Response docs",
                "url": "https://response.pagerduty.com/",
                "kind": "Docs",
                "note": "A real company's free incident process. Good model for handovers."
              },
              {
                "name": "Atlassian incident handbook",
                "url": "https://www.atlassian.com/incident-management/handbook",
                "kind": "Docs",
                "note": "Roles, severity levels and post-incident reviews."
              },
              {
                "name": "TheHive documentation",
                "url": "https://docs.strangebee.com/",
                "kind": "Docs",
                "note": "Case management used by many teams."
              },
              {
                "name": "The DFIR Report",
                "url": "https://thedfirreport.com/",
                "kind": "Docs",
                "note": "Real intrusion timelines. Read one a week."
              }
            ],
            "books": [
              {
                "title": "Incident Response & Computer Forensics",
                "author": "Luttgens, Pepe and Mandia"
              }
            ],
            "exercises": [
              "Write an incident response plan for a small company",
              "Run a tabletop exercise for a phishing breach",
              "Write a shift handover for an open case"
            ],
            "milestones": [
              "Name the incident response phases",
              "Contain a host in a lab",
              "Write a lessons-learned note"
            ],
            "tools": [
              "TheHive",
              "Velociraptor"
            ]
          },
          {
            "slug": "digital-forensics",
            "name": "Digital forensics",
            "text": "Collect and examine evidence from disks and devices.",
            "sub": [
              "Chain of custody",
              "Disk images",
              "Timelines",
              "Windows artefacts"
            ],
            "soc": "R",
            "eng": "O",
            "time": "2 to 3 weeks",
            "resources": [
              {
                "name": "13Cubed",
                "url": "https://www.youtube.com/@13Cubed/playlists",
                "kind": "Video",
                "note": "Free, high-quality forensics series. Start with the Windows endpoint series."
              },
              {
                "name": "Autopsy",
                "url": "https://www.sleuthkit.org/autopsy/",
                "kind": "Tool",
                "note": "Free forensic platform. Open a sample image."
              },
              {
                "name": "Volatility 3",
                "url": "https://github.com/volatilityfoundation/volatility3",
                "kind": "Tool",
                "note": "Free memory forensics framework."
              },
              {
                "name": "Eric Zimmerman's tools",
                "url": "https://ericzimmerman.github.io/",
                "kind": "Tool",
                "note": "Free Windows artefact parsers used by professionals."
              },
              {
                "name": "CyberDefenders",
                "url": "https://cyberdefenders.org/",
                "kind": "Lab",
                "note": "Forensics labs with solutions."
              }
            ],
            "books": [
              {
                "title": "The Art of Memory Forensics",
                "author": "Michael Hale Ligh and others"
              }
            ],
            "exercises": [
              "Open a disk image in Autopsy",
              "Build a timeline of a user's activity",
              "Find a deleted file"
            ],
            "milestones": [
              "Explain chain of custody",
              "Build a timeline",
              "Write a short forensic report"
            ],
            "tools": [
              "Autopsy",
              "FTK Imager",
              "Volatility"
            ]
          }
        ]
      },
      {
        "name": "Offensive security",
        "topics": [
          {
            "slug": "penetration-testing-method",
            "name": "Penetration testing method",
            "text": "The steps a tester follows, from recon to the final report.",
            "sub": [
              "Recon",
              "Scanning",
              "Exploitation",
              "Reporting"
            ],
            "soc": "O",
            "eng": "O",
            "time": "2 to 3 weeks",
            "resources": [
              {
                "name": "TCM Security",
                "url": "https://www.youtube.com/@TCMSecurityAcademy",
                "kind": "Video",
                "note": "Free full beginner ethical hacking video."
              },
              {
                "name": "Hack The Box Academy",
                "url": "https://academy.hackthebox.com/",
                "kind": "Course",
                "note": "Free starter modules. Start with the free tier."
              },
              {
                "name": "IppSec",
                "url": "https://www.youtube.com/@ippsec",
                "kind": "Video",
                "note": "Free walkthroughs of practice machines."
              },
              {
                "name": "OWASP Web Security Testing Guide",
                "url": "https://owasp.org/www-project-web-security-testing-guide/",
                "kind": "Docs",
                "note": "A full testing method, free."
              }
            ],
            "books": [
              {
                "title": "Penetration Testing",
                "author": "Georgia Weidman"
              }
            ],
            "exercises": [
              "Run recon on a lab machine",
              "Write a one-page test report",
              "Map your findings to ATT&CK"
            ],
            "milestones": [
              "Name the phases of a pen test",
              "Read a pen test report",
              "Know the rules of engagement"
            ],
            "tools": [
              "Nmap",
              "Metasploit",
              "Burp Suite"
            ]
          },
          {
            "slug": "exploitation",
            "name": "Exploitation",
            "text": "How known flaws become access, practised safely in a lab.",
            "sub": [
              "Metasploit basics",
              "Payloads",
              "Privilege escalation",
              "Post-exploitation"
            ],
            "soc": "O",
            "eng": "O",
            "time": "2 weeks",
            "resources": [
              {
                "name": "Metasploit Unleashed",
                "url": "https://www.offsec.com/metasploit-unleashed/",
                "kind": "Course",
                "note": "The free OffSec course on Metasploit."
              },
              {
                "name": "LiveOverflow",
                "url": "https://www.youtube.com/@LiveOverflow",
                "kind": "Video",
                "note": "Free videos that explain how exploits work."
              },
              {
                "name": "VulnHub",
                "url": "https://www.vulnhub.com/",
                "kind": "Lab",
                "note": "Free vulnerable VMs."
              },
              {
                "name": "GTFOBins",
                "url": "https://gtfobins.github.io/",
                "kind": "Docs",
                "note": "Linux programs attackers abuse."
              },
              {
                "name": "LOLBAS project",
                "url": "https://lolbas-project.github.io/",
                "kind": "Docs",
                "note": "Windows programs attackers abuse."
              }
            ],
            "books": [
              {
                "title": "Hacking: The Art of Exploitation",
                "author": "Jon Erickson"
              }
            ],
            "exercises": [
              "Exploit a vulnerable VM in a lab",
              "Find the same attack in the logs",
              "Write how a defender would catch it"
            ],
            "milestones": [
              "Explain exploit vs payload",
              "Use Metasploit in a lab",
              "Link an exploit to its log trail"
            ],
            "tools": [
              "Metasploit",
              "Kali Linux"
            ]
          },
          {
            "slug": "social-engineering",
            "name": "Social engineering",
            "text": "How attackers trick people, and the signs that give them away.",
            "sub": [
              "Phishing",
              "Pretexting",
              "Vishing",
              "Spotting red flags"
            ],
            "practice": {
              "href": "/mailbox",
              "label": "Sort emails in the Phishing mailbox"
            },
            "soc": "R",
            "eng": "O",
            "time": "1 to 2 weeks",
            "resources": [
              {
                "name": "Google Phishing Quiz",
                "url": "https://phishingquiz.withgoogle.com/",
                "kind": "Lab",
                "note": "A free short quiz to train your eye."
              },
              {
                "name": "Social-Engineer.org Framework",
                "url": "https://www.social-engineer.org/framework/",
                "kind": "Docs",
                "note": "A free guide to how attackers manipulate people."
              },
              {
                "name": "MXToolbox email header analyzer",
                "url": "https://mxtoolbox.com/EmailHeaders.aspx",
                "kind": "Tool",
                "note": "Paste a header and read SPF, DKIM and DMARC."
              },
              {
                "name": "SANS OUCH! newsletter",
                "url": "https://www.sans.org/security-awareness-training/ouch-newsletter",
                "kind": "Docs",
                "note": "Free monthly plain-English guides."
              },
              {
                "name": "Darknet Diaries",
                "url": "https://podcast.darknetdiaries.com/",
                "kind": "Podcast",
                "note": "True stories of real attacks. Good for context."
              }
            ],
            "books": [
              {
                "title": "Social Engineering: The Science of Human Hacking",
                "author": "Christopher Hadnagy"
              }
            ],
            "exercises": [
              "Sort 10 emails in the ShiftLab mailbox",
              "List the red flags in one phishing email",
              "Check an email header for spoofing"
            ],
            "milestones": [
              "Spot common phishing signs",
              "Read SPF, DKIM and DMARC results",
              "Explain vishing and pretexting"
            ],
            "tools": [
              "Email headers",
              "URL scanners"
            ]
          }
        ]
      },
      {
        "name": "Cloud security",
        "topics": [
          {
            "slug": "cloud-security-basics",
            "name": "Cloud security basics",
            "text": "Shared responsibility, identities, keys and logging in the cloud.",
            "sub": [
              "Shared responsibility",
              "Identity and access (IAM)",
              "Cloud logging",
              "Misconfigurations"
            ],
            "practice": {
              "href": "/queue",
              "label": "Triage cloud alerts"
            },
            "soc": "R",
            "eng": "E",
            "time": "2 to 3 weeks",
            "resources": [
              {
                "name": "AWS: free security training list",
                "url": "https://aws.amazon.com/blogs/apn/learn-aws-security-fundamentals-with-free-and-online-training/",
                "kind": "Course",
                "note": "AWS's own list of free security courses."
              },
              {
                "name": "flAWS.cloud",
                "url": "https://flaws.cloud/",
                "kind": "Lab",
                "note": "Free AWS misconfiguration challenges."
              },
              {
                "name": "Microsoft Sentinel skill-up training",
                "url": "https://learn.microsoft.com/en-us/azure/sentinel/skill-up-resources",
                "kind": "Course",
                "note": "Free Microsoft learning for Azure security."
              },
              {
                "name": "Awesome CloudSec Labs",
                "url": "https://github.com/iknowjason/Awesome-CloudSec-Labs",
                "kind": "Lab",
                "note": "A big free list of cloud security labs."
              },
              {
                "name": "Pwned Labs cloud security labs",
                "url": "https://github.com/pwnedlabs/cloud-security-labs",
                "kind": "Lab",
                "note": "Free hands-on AWS, Azure and GCP labs."
              }
            ],
            "books": [
              {
                "title": "AWS Security",
                "author": "Dylan Shields"
              }
            ],
            "exercises": [
              "Read a CloudTrail log",
              "Find a public storage bucket in a lab",
              "Review an IAM policy for too much access"
            ],
            "milestones": [
              "Explain shared responsibility",
              "Read cloud audit logs",
              "Spot a misconfiguration"
            ],
            "tools": [
              "AWS CloudTrail",
              "AWS IAM",
              "Prowler"
            ]
          },
          {
            "slug": "cloud-security-design",
            "name": "Cloud security design",
            "text": "Build cloud setups that are safe by default.",
            "sub": [
              "Least privilege",
              "Encryption",
              "Network segmentation",
              "Guardrails"
            ],
            "soc": "O",
            "eng": "E",
            "time": "2 weeks",
            "resources": [
              {
                "name": "AWS Well-Architected: Security Pillar",
                "url": "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html",
                "kind": "Docs",
                "note": "AWS's free design guide for safe-by-default setups."
              },
              {
                "name": "CIS Benchmarks",
                "url": "https://www.cisecurity.org/cis-benchmarks",
                "kind": "Docs",
                "note": "Free checklists for the big clouds."
              },
              {
                "name": "CloudGoat",
                "url": "https://github.com/RhinoSecurityLabs/cloudgoat",
                "kind": "Lab",
                "note": "Vulnerable-by-design AWS scenarios."
              },
              {
                "name": "Prowler",
                "url": "https://github.com/prowler-cloud/prowler",
                "kind": "Tool",
                "note": "Free cloud security checker."
              }
            ],
            "books": [
              {
                "title": "Practical Cloud Security",
                "author": "Chris Dotson"
              }
            ],
            "exercises": [
              "Draw a least-privilege design",
              "Turn on encryption by default",
              "Write three guardrails"
            ],
            "milestones": [
              "Explain least privilege",
              "Know network segmentation",
              "Name preventive guardrails"
            ],
            "tools": [
              "AWS Organizations",
              "AWS Security Hub"
            ]
          },
          {
            "slug": "container-security",
            "name": "Container security",
            "text": "Lock down images, containers and the hosts they run on.",
            "sub": [
              "Image scanning",
              "Least-privilege containers",
              "Secrets",
              "Runtime monitoring"
            ],
            "soc": "O",
            "eng": "E",
            "time": "1 to 2 weeks",
            "resources": [
              {
                "name": "Docker security docs",
                "url": "https://docs.docker.com/engine/security/",
                "kind": "Docs",
                "note": "The official guide to a safer Docker."
              },
              {
                "name": "Kubernetes security concepts",
                "url": "https://kubernetes.io/docs/concepts/security/",
                "kind": "Docs",
                "note": "The official security overview."
              },
              {
                "name": "Trivy",
                "url": "https://aquasecurity.github.io/trivy/latest/",
                "kind": "Tool",
                "note": "Free image and config scanner."
              },
              {
                "name": "Kubernetes Goat",
                "url": "https://github.com/madhuakula/kubernetes-goat",
                "kind": "Lab",
                "note": "A deliberately weak cluster to practise on."
              },
              {
                "name": "Falco",
                "url": "https://falco.org/",
                "kind": "Tool",
                "note": "Free runtime threat detection for containers."
              }
            ],
            "books": [
              {
                "title": "Container Security",
                "author": "Liz Rice"
              }
            ],
            "exercises": [
              "Scan an image with Trivy",
              "Run a container as a non-root user",
              "Find secrets baked into an image"
            ],
            "milestones": [
              "Explain image vs container",
              "Scan for vulnerabilities",
              "Know runtime risks"
            ],
            "tools": [
              "Docker",
              "Trivy",
              "Falco"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "advanced",
    "name": "Advanced",
    "time": "Ongoing",
    "goal": "Understand attackers in depth and branch into specialist areas.",
    "outcome": "read attacker behaviour, map it to ATT&CK, and look inside malware safely.",
    "sections": [
      {
        "name": "Threats in depth",
        "topics": [
          {
            "slug": "malware-analysis",
            "name": "Malware analysis",
            "text": "Run samples safely in a sandbox and read what they do.",
            "sub": [
              "Static analysis",
              "Dynamic analysis",
              "Sandboxes",
              "Indicators of compromise"
            ],
            "soc": "R",
            "eng": "O",
            "time": "4 to 6 weeks",
            "resources": [
              {
                "name": "ANY.RUN interactive sandbox",
                "url": "https://any.run/",
                "kind": "Tool",
                "note": "Free plan. Run a sample and watch what it does."
              },
              {
                "name": "OALabs",
                "url": "https://www.youtube.com/@OALABS",
                "kind": "Video",
                "note": "Free reverse engineering and malware videos."
              },
              {
                "name": "Malware Unicorn: RE101",
                "url": "https://www.malwareunicorn.org/workshops/re101.html",
                "kind": "Course",
                "note": "Free beginner reverse engineering workshop."
              },
              {
                "name": "Hack The Box Academy: Introduction to Malware Analysis",
                "url": "https://academy.hackthebox.com/course/preview/introduction-to-malware-analysis",
                "kind": "Course",
                "note": "Free preview of the module."
              },
              {
                "name": "MalwareBazaar",
                "url": "https://bazaar.abuse.ch/",
                "kind": "Tool",
                "note": "Free samples for research. Handle with care."
              },
              {
                "name": "FLARE-VM",
                "url": "https://github.com/mandiant/flare-vm",
                "kind": "Tool",
                "note": "A Windows analysis lab you install in a VM."
              }
            ],
            "books": [
              {
                "title": "Practical Malware Analysis",
                "author": "Michael Sikorski and Andrew Honig"
              }
            ],
            "exercises": [
              "Run a sample in ANY.RUN and list what it does",
              "Pull IOCs from a sandbox report",
              "Check a hash on VirusTotal"
            ],
            "milestones": [
              "Explain static vs dynamic analysis",
              "Extract IOCs",
              "Write a short malware note"
            ],
            "tools": [
              "ANY.RUN",
              "VirusTotal",
              "PEStudio"
            ]
          },
          {
            "slug": "threat-intelligence",
            "name": "Threat intelligence",
            "text": "Turn indicators and attacker behaviour into decisions.",
            "sub": [
              "IOCs",
              "Tactics and techniques (TTPs)",
              "ATT&CK mapping",
              "Intel sources"
            ],
            "practice": {
              "href": "/lookup",
              "label": "Check IPs, domains and hashes in Intel check"
            },
            "soc": "E",
            "eng": "R",
            "time": "2 to 3 weeks",
            "resources": [
              {
                "name": "MITRE ATT&CK Fundamentals training",
                "url": "https://attack.mitre.org/resources/learn-more-about-attack/training/attack-fundamentals/",
                "kind": "Course",
                "note": "Free official training. Do this first."
              },
              {
                "name": "MAD20: ATT&CK Fundamentals (video)",
                "url": "https://www.youtube.com/playlist?list=PLV8L5Bdyqd-6-4IhZJjsRWT8M1tuCpL4H",
                "kind": "Video",
                "note": "A free video course on ATT&CK."
              },
              {
                "name": "MITRE ATT&CK CTI training",
                "url": "https://attack.mitre.org/resources/learn-more-about-attack/training/cti/",
                "kind": "Course",
                "note": "Free official course on using ATT&CK for intel."
              },
              {
                "name": "ATT&CK Navigator",
                "url": "https://mitre-attack.github.io/attack-navigator/",
                "kind": "Tool",
                "note": "Colour in the techniques you cover."
              },
              {
                "name": "AlienVault OTX",
                "url": "https://otx.alienvault.com/",
                "kind": "Tool",
                "note": "Free community threat feed."
              },
              {
                "name": "The Pyramid of Pain",
                "url": "https://detect-respond.blogspot.com/2013/03/the-pyramid-of-pain.html",
                "kind": "Docs",
                "note": "A short read on which indicators matter."
              }
            ],
            "books": [
              {
                "title": "Intelligence-Driven Incident Response",
                "author": "Scott J. Roberts and Rebekah Brown"
              }
            ],
            "exercises": [
              "Map one alert to ATT&CK techniques",
              "Look up an IP in three intel sources",
              "Write a one-paragraph intel summary"
            ],
            "milestones": [
              "Tell IOCs from TTPs",
              "Use ATT&CK Navigator",
              "Judge how reliable a source is"
            ],
            "tools": [
              "ATT&CK Navigator",
              "VirusTotal",
              "AbuseIPDB"
            ]
          },
          {
            "slug": "advanced-persistent-threats",
            "name": "Advanced persistent threats",
            "text": "Study real threat groups, their tools and their targets.",
            "sub": [
              "Threat groups",
              "Campaigns",
              "Persistence",
              "Limits of attribution"
            ],
            "soc": "O",
            "eng": "O",
            "time": "2 weeks",
            "resources": [
              {
                "name": "MITRE ATT&CK: Groups",
                "url": "https://attack.mitre.org/groups/",
                "kind": "Docs",
                "note": "Free profiles of real threat groups."
              },
              {
                "name": "The DFIR Report",
                "url": "https://thedfirreport.com/",
                "kind": "Docs",
                "note": "Real intrusion timelines, step by step."
              },
              {
                "name": "Darknet Diaries",
                "url": "https://podcast.darknetdiaries.com/",
                "kind": "Podcast",
                "note": "True stories of real attacks."
              },
              {
                "name": "CISA cybersecurity advisories",
                "url": "https://www.cisa.gov/news-events/cybersecurity-advisories",
                "kind": "Docs",
                "note": "Free government write-ups of live campaigns."
              }
            ],
            "books": [
              {
                "title": "Sandworm",
                "author": "Andy Greenberg"
              }
            ],
            "exercises": [
              "Profile one threat group",
              "List its top 5 techniques",
              "Say which ShiftLab alerts would catch it"
            ],
            "milestones": [
              "Explain what makes a threat persistent",
              "Read a group profile",
              "Know why attribution is hard"
            ],
            "tools": [
              "ATT&CK Navigator"
            ]
          }
        ]
      },
      {
        "name": "Specialist areas",
        "topics": [
          {
            "slug": "iot-security",
            "name": "IoT security",
            "text": "Where smart devices are weak, from firmware to the cloud behind them.",
            "sub": [
              "Firmware",
              "Default passwords",
              "Insecure protocols",
              "Updates"
            ],
            "soc": "O",
            "eng": "O",
            "time": "1 to 2 weeks",
            "resources": [
              {
                "name": "OWASP Internet of Things project",
                "url": "https://owasp.org/www-project-internet-of-things/",
                "kind": "Docs",
                "note": "The top IoT risks, free."
              },
              {
                "name": "OWASP IoTGoat",
                "url": "https://github.com/OWASP/IoTGoat",
                "kind": "Lab",
                "note": "Deliberately weak firmware to test."
              },
              {
                "name": "binwalk",
                "url": "https://github.com/ReFirmLabs/binwalk",
                "kind": "Tool",
                "note": "Unpack firmware images."
              }
            ],
            "books": [
              {
                "title": "Practical IoT Hacking",
                "author": "Fotios Chantzis and others"
              }
            ],
            "exercises": [
              "List the services on a smart device",
              "Check a device for default passwords",
              "Read IoT traffic in Wireshark"
            ],
            "milestones": [
              "Name the top IoT risks",
              "Explain why firmware updates matter",
              "Spot an insecure protocol"
            ],
            "tools": [
              "Nmap",
              "Wireshark",
              "binwalk"
            ]
          },
          {
            "slug": "mobile-security",
            "name": "Mobile security",
            "text": "How mobile apps are tested and where they leak data.",
            "sub": [
              "App permissions",
              "Data storage",
              "Network traffic",
              "Reverse engineering"
            ],
            "soc": "O",
            "eng": "O",
            "time": "2 weeks",
            "resources": [
              {
                "name": "OWASP Mobile Application Security",
                "url": "https://mas.owasp.org/",
                "kind": "Docs",
                "note": "The free testing guide and checklist."
              },
              {
                "name": "MobSF",
                "url": "https://mobsf.github.io/docs/",
                "kind": "Tool",
                "note": "Free automatic mobile app scanner."
              },
              {
                "name": "Frida",
                "url": "https://frida.re/docs/home/",
                "kind": "Tool",
                "note": "Free tool to watch apps while they run."
              }
            ],
            "books": [
              {
                "title": "The Mobile Application Hacker's Handbook",
                "author": "Dominic Chell and others"
              }
            ],
            "exercises": [
              "Check an app's permissions",
              "Inspect an app's network traffic",
              "Find data stored in plain text"
            ],
            "milestones": [
              "Name common mobile risks",
              "Read an Android manifest",
              "Explain certificate pinning"
            ],
            "tools": [
              "MobSF",
              "Frida",
              "jadx"
            ]
          },
          {
            "slug": "industrial-control-systems",
            "name": "Industrial control systems",
            "text": "Security for the systems that run factories, power and water.",
            "sub": [
              "OT vs IT",
              "Purdue model",
              "Modbus",
              "Safety first"
            ],
            "soc": "O",
            "eng": "O",
            "time": "2 weeks",
            "resources": [
              {
                "name": "CISA: Industrial control systems",
                "url": "https://www.cisa.gov/topics/industrial-control-systems",
                "kind": "Course",
                "note": "Free training and advisories for OT security."
              },
              {
                "name": "NIST SP 800-82 Rev. 3",
                "url": "https://csrc.nist.gov/pubs/sp/800/82/r3/final",
                "kind": "Docs",
                "note": "The free guide to securing OT."
              },
              {
                "name": "Wireshark sample captures",
                "url": "https://wiki.wireshark.org/SampleCaptures",
                "kind": "Lab",
                "note": "Look for the Modbus captures."
              }
            ],
            "books": [
              {
                "title": "Industrial Network Security",
                "author": "Eric D. Knapp and Joel Thomas Langill"
              }
            ],
            "exercises": [
              "Draw the Purdue model for a factory",
              "Read Modbus traffic in Wireshark",
              "List what you must never do on OT systems"
            ],
            "milestones": [
              "Explain OT vs IT",
              "Know the Purdue levels",
              "Put safety first"
            ],
            "tools": [
              "Wireshark",
              "GRASSMARLIN"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "career",
    "name": "Career",
    "time": "Ongoing",
    "goal": "Turn your skills into a job, and keep them current.",
    "outcome": "show a plan for certifications, a network of people, and a habit of keeping up.",
    "sections": [
      {
        "name": "Grow your career",
        "topics": [
          {
            "slug": "plan-your-certifications",
            "name": "Plan your certifications",
            "text": "See which certifications fit your path and level.",
            "sub": [
              "Entry level: Security+",
              "SOC level: BTL1, CySA+",
              "Study plans",
              "Free certificates first"
            ],
            "soc": "R",
            "eng": "R",
            "time": "Ongoing",
            "resources": [
              {
                "name": "Paul Jerimy's security certification roadmap",
                "url": "https://pauljerimy.com/security-certification-roadmap/",
                "kind": "Docs",
                "note": "A free visual map of certifications by level and area."
              },
              {
                "name": "TryHackMe: certification roadmap 2026",
                "url": "https://tryhackme.com/resources/blog/cyber-security-certification-roadmap-2026",
                "kind": "Docs",
                "note": "Which certification fits which role."
              },
              {
                "name": "roadmap.sh: Cyber Security",
                "url": "https://roadmap.sh/cyber-security",
                "kind": "Docs",
                "note": "A second free map to compare with."
              },
              {
                "name": "CyberSeek career pathways",
                "url": "https://www.cyberseek.org/",
                "kind": "Docs",
                "note": "A free map of jobs and skills by region."
              }
            ],
            "books": [
              {
                "title": "Cybersecurity Career Master Plan",
                "author": "Gerald Auger and others"
              }
            ],
            "exercises": [
              "Pick one entry and one SOC certification",
              "Make a 12-week study plan",
              "Take a practice exam"
            ],
            "milestones": [
              "Choose your first certification",
              "Finish a practice test",
              "Pass your first exam"
            ],
            "tools": [
              "Anki",
              "Practice exams"
            ]
          },
          {
            "slug": "build-your-network",
            "name": "Build your network",
            "text": "Share what you learn and meet people already in the field.",
            "sub": [
              "LinkedIn posts",
              "Communities",
              "Meetups and CTFs",
              "Mentors"
            ],
            "practice": {
              "href": "/reports",
              "label": "Share what you solved from Case reports"
            },
            "soc": "E",
            "eng": "E",
            "time": "Ongoing",
            "resources": [
              {
                "name": "picoCTF",
                "url": "https://picoctf.org/",
                "kind": "Lab",
                "note": "A free beginner CTF. A good first thing to write about."
              },
              {
                "name": "CTFtime",
                "url": "https://ctftime.org/",
                "kind": "Docs",
                "note": "Find live CTFs to join with a team."
              },
              {
                "name": "OWASP chapters",
                "url": "https://owasp.org/chapters/",
                "kind": "Docs",
                "note": "Free local meetups, many online."
              },
              {
                "name": "BSides events",
                "url": "https://www.securitybsides.com/",
                "kind": "Docs",
                "note": "Low-cost community conferences."
              },
              {
                "name": "GitHub Pages",
                "url": "https://pages.github.com/",
                "kind": "Tool",
                "note": "A free place to publish your write-ups."
              }
            ],
            "books": [
              {
                "title": "Never Eat Alone",
                "author": "Keith Ferrazzi"
              }
            ],
            "exercises": [
              "Post one write-up a week",
              "Comment on 3 posts from SOC analysts",
              "Join one local meetup or CTF"
            ],
            "milestones": [
              "Your profile shows your projects",
              "10 posts shared",
              "One referral or mentor"
            ],
            "tools": [
              "LinkedIn",
              "GitHub",
              "Discord"
            ]
          },
          {
            "slug": "keep-learning",
            "name": "Keep learning",
            "text": "A few minutes a day on what changed in security.",
            "sub": [
              "Daily news",
              "Podcasts",
              "CTFs",
              "A home lab"
            ],
            "soc": "R",
            "eng": "R",
            "time": "Ongoing",
            "resources": [
              {
                "name": "SANS Internet Storm Center",
                "url": "https://isc.sans.edu/",
                "kind": "Podcast",
                "note": "The Stormcast is a 5-minute daily podcast."
              },
              {
                "name": "Darknet Diaries",
                "url": "https://podcast.darknetdiaries.com/",
                "kind": "Podcast",
                "note": "True stories of real attacks."
              },
              {
                "name": "Risky Business",
                "url": "https://risky.biz/",
                "kind": "Podcast",
                "note": "Weekly news from working journalists."
              },
              {
                "name": "Krebs on Security",
                "url": "https://krebsonsecurity.com/",
                "kind": "Docs",
                "note": "Deep reporting on cybercrime."
              },
              {
                "name": "BleepingComputer",
                "url": "https://www.bleepingcomputer.com/",
                "kind": "Docs",
                "note": "Fast daily security news."
              }
            ],
            "books": [
              {
                "title": "Cybersecurity and Cyberwar",
                "author": "P. W. Singer and Allan Friedman"
              }
            ],
            "exercises": [
              "Listen to Stormcast five days a week",
              "Do one CTF a month",
              "Add one new tool to your home lab"
            ],
            "milestones": [
              "A daily news habit",
              "A home lab running",
              "One CTF finished"
            ],
            "tools": [
              "Feedly",
              "CTFtime",
              "Home lab"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "engineer",
    "name": "Engineer track",
    "time": "12 to 24 weeks",
    "goal": "Build what a SOC runs on: detections written as code, secure cloud accounts and pipelines, and safe AI features.",
    "outcome": "write detections as code, secure a cloud account and a pipeline, and test an AI feature.",
    "engineerOnly": true,
    "sections": [
      {
        "name": "Automation and detection",
        "topics": [
          {
            "slug": "scripting-and-automation",
            "name": "Scripting and automation",
            "text": "Automate checks and glue tools together with Python, Git and APIs.",
            "sub": [
              "Python for log parsing",
              "REST APIs and JSON",
              "Git and pull requests",
              "Bash one-liners"
            ],
            "soc": "-",
            "eng": "E",
            "time": "4 to 6 weeks",
            "resources": [
              {
                "name": "Automate the Boring Stuff with Python",
                "url": "https://automatetheboringstuff.com/",
                "kind": "Book",
                "note": "Do the files, web and regex chapters, then automate something real."
              },
              {
                "name": "Pro Git",
                "url": "https://git-scm.com/book/en/v2",
                "kind": "Book",
                "note": "The free official Git book."
              },
              {
                "name": "VirusTotal API docs",
                "url": "https://docs.virustotal.com/reference/overview",
                "kind": "Docs",
                "note": "Practise calling a real API from a script."
              },
              {
                "name": "Requests library docs",
                "url": "https://requests.readthedocs.io/",
                "kind": "Docs",
                "note": "The Python library for web APIs."
              },
              {
                "name": "Real Python",
                "url": "https://realpython.com/",
                "kind": "Course",
                "note": "Free tutorials on every Python topic."
              }
            ],
            "books": [
              {
                "title": "Pro Git",
                "author": "Scott Chacon and Ben Straub",
                "url": "https://git-scm.com/book/en/v2"
              },
              {
                "title": "Black Hat Python",
                "author": "Justin Seitz and Tim Arnold"
              }
            ],
            "exercises": [
              "Write a script that checks a list of IPs on AbuseIPDB",
              "Parse auth.log and count failed logins per IP",
              "Open a pull request with a test on your own repo"
            ],
            "milestones": [
              "Your scripts live on GitHub with a README",
              "You can call a REST API and handle errors",
              "You use branches and pull requests"
            ],
            "tools": [
              "Python",
              "Git",
              "curl",
              "jq"
            ]
          },
          {
            "slug": "detection-engineering",
            "name": "Detection engineering",
            "text": "Write, test and tune detection rules as code, mapped to ATT&CK.",
            "sub": [
              "Sigma rules",
              "ATT&CK mapping",
              "Testing with Atomic Red Team",
              "Tuning false positives"
            ],
            "soc": "-",
            "eng": "E",
            "time": "4 to 8 weeks",
            "resources": [
              {
                "name": "Sigma rules repository",
                "url": "https://github.com/SigmaHQ/sigma",
                "kind": "Docs",
                "note": "The open rule format. Read 10 rules, then write one."
              },
              {
                "name": "Sigma getting started",
                "url": "https://sigmahq.io/docs/guide/getting-started.html",
                "kind": "Docs",
                "note": "Official guide to writing and converting rules."
              },
              {
                "name": "Atomic Red Team",
                "url": "https://atomicredteam.io/",
                "kind": "Lab",
                "note": "Small free attack tests to check that your rules fire."
              },
              {
                "name": "MITRE CAR",
                "url": "https://car.mitre.org/",
                "kind": "Docs",
                "note": "Detection ideas with pseudocode."
              },
              {
                "name": "Elastic detection rules",
                "url": "https://github.com/elastic/detection-rules",
                "kind": "Docs",
                "note": "Hundreds of real rules to read."
              },
              {
                "name": "Splunk Security Content",
                "url": "https://research.splunk.com/",
                "kind": "Docs",
                "note": "Free detections with the data each one needs."
              },
              {
                "name": "Awesome Detection Engineering",
                "url": "https://github.com/infosecB/awesome-detection-engineering",
                "kind": "Docs",
                "note": "A big free reading list."
              }
            ],
            "books": [
              {
                "title": "Practical Threat Detection Engineering",
                "author": "Megan Roddie, Jason Deyalsingh and Gary J. Katz"
              }
            ],
            "exercises": [
              "Convert a Sigma rule to Splunk or Elastic",
              "Run 3 Atomic tests and confirm each rule fires",
              "Cut a noisy rule's false positives in half and write down how"
            ],
            "milestones": [
              "10 rules mapped to ATT&CK in a repo",
              "A rule is tested before it ships",
              "Every rule has an owner and a runbook"
            ],
            "tools": [
              "Sigma",
              "Atomic Red Team",
              "Elastic",
              "Splunk"
            ]
          },
          {
            "slug": "siem-and-soar-engineering",
            "name": "SIEM and SOAR engineering",
            "text": "Get logs in, parse them, search them, and automate the boring response steps.",
            "sub": [
              "Log onboarding and parsing",
              "Search languages (SPL, KQL)",
              "Dashboards and alerts",
              "Playbook automation"
            ],
            "soc": "-",
            "eng": "R",
            "time": "4 to 6 weeks",
            "resources": [
              {
                "name": "Splunk: Intro to Splunk (free eLearning)",
                "url": "https://education.splunk.com/course/intro-to-splunk-elearning",
                "kind": "Course",
                "note": "Free official course. Then load the BOTS data."
              },
              {
                "name": "Microsoft Learn: KQL for Sentinel",
                "url": "https://learn.microsoft.com/en-us/training/paths/sc-200-utilize-kql-for-azure-sentinel/",
                "kind": "Course",
                "note": "Free path to learn KQL."
              },
              {
                "name": "Wazuh documentation",
                "url": "https://documentation.wazuh.com/current/getting-started/index.html",
                "kind": "Docs",
                "note": "Free open-source SIEM. Install one and ingest logs."
              },
              {
                "name": "Security Onion documentation",
                "url": "https://docs.securityonion.net/en/2.4/getting-started.html",
                "kind": "Docs",
                "note": "A free network and host monitoring platform."
              },
              {
                "name": "Elastic: free security training",
                "url": "https://www.elastic.co/training/getting-started-intro-to-elastic-security",
                "kind": "Course",
                "note": "Free intro to Elastic Security."
              },
              {
                "name": "Shuffle: getting started",
                "url": "https://github.com/shuffle/shuffle-docs/blob/master/docs/getting_started.md",
                "kind": "Docs",
                "note": "Free SOAR platform. Build one playbook."
              }
            ],
            "books": [
              {
                "title": "Blue Team Handbook: SOC, SIEM, and Threat Hunting",
                "author": "Don Murdoch"
              }
            ],
            "exercises": [
              "Ingest Windows and Linux logs into Wazuh",
              "Write 5 searches in SPL and the same 5 in KQL",
              "Build a Shuffle workflow that enriches an alert with VirusTotal"
            ],
            "milestones": [
              "Logs from 3 sources are searchable",
              "You can write the same search in two languages",
              "One playbook runs end to end"
            ],
            "tools": [
              "Splunk",
              "Wazuh",
              "Elastic",
              "Shuffle",
              "TheHive"
            ]
          }
        ]
      },
      {
        "name": "Cloud and identity",
        "topics": [
          {
            "slug": "identity-and-access",
            "name": "Identity and access",
            "text": "Who can do what, and how it is proven: SSO, MFA, least privilege and Zero Trust.",
            "sub": [
              "IAM policies",
              "SSO and MFA",
              "Least privilege",
              "Zero Trust"
            ],
            "soc": "-",
            "eng": "E",
            "time": "3 to 4 weeks",
            "resources": [
              {
                "name": "AWS IAM user guide",
                "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html",
                "kind": "Docs",
                "note": "Read policies and roles, then write a least-privilege policy."
              },
              {
                "name": "flAWS2.cloud",
                "url": "https://flaws2.cloud/",
                "kind": "Lab",
                "note": "Free IAM and misconfiguration challenges."
              },
              {
                "name": "NIST SP 800-207: Zero Trust Architecture",
                "url": "https://csrc.nist.gov/pubs/sp/800/207/final",
                "kind": "Docs",
                "note": "The standard guide to Zero Trust."
              },
              {
                "name": "CISA Zero Trust Maturity Model",
                "url": "https://www.cisa.gov/zero-trust-maturity-model",
                "kind": "Docs",
                "note": "A step-by-step maturity guide."
              },
              {
                "name": "OWASP Authentication Cheat Sheet",
                "url": "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
                "kind": "Docs",
                "note": "Short rules for safe sign-in."
              },
              {
                "name": "Microsoft Entra fundamentals",
                "url": "https://learn.microsoft.com/en-us/entra/fundamentals/whatis",
                "kind": "Docs",
                "note": "Free docs on Microsoft's identity service."
              }
            ],
            "books": [
              {
                "title": "Security Engineering",
                "author": "Ross Anderson",
                "url": "https://www.cl.cam.ac.uk/~rja14/book.html"
              }
            ],
            "exercises": [
              "Write an IAM policy that allows only one bucket",
              "Turn on MFA and read the sign-in logs",
              "Draw a Zero Trust diagram for a small app"
            ],
            "milestones": [
              "Explain least privilege with an example",
              "Set up MFA and SSO in a lab",
              "Read an access-denied log"
            ],
            "tools": [
              "AWS IAM",
              "Entra ID",
              "Keycloak"
            ]
          },
          {
            "slug": "iac-and-ci-cd-security",
            "name": "IaC and CI/CD security",
            "text": "Define infrastructure in code, scan it, and stop risky changes before they deploy.",
            "sub": [
              "Terraform basics",
              "IaC scanning",
              "GitHub Actions",
              "Secrets in pipelines"
            ],
            "soc": "-",
            "eng": "E",
            "time": "3 to 4 weeks",
            "resources": [
              {
                "name": "HashiCorp Terraform tutorials",
                "url": "https://developer.hashicorp.com/terraform/tutorials",
                "kind": "Course",
                "note": "Free official tutorials. Deploy one small resource."
              },
              {
                "name": "Checkov",
                "url": "https://www.checkov.io/",
                "kind": "Tool",
                "note": "Free scanner for Terraform and more."
              },
              {
                "name": "GitHub Actions security hardening",
                "url": "https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions",
                "kind": "Docs",
                "note": "Official guide to safer pipelines."
              },
              {
                "name": "OWASP DevSecOps Verification Standard",
                "url": "https://owasp.org/www-project-devsecops-verification-standard/",
                "kind": "Docs",
                "note": "A checklist for secure pipelines."
              },
              {
                "name": "gitleaks",
                "url": "https://github.com/gitleaks/gitleaks",
                "kind": "Tool",
                "note": "Find secrets in repos."
              }
            ],
            "books": [
              {
                "title": "Terraform: Up & Running",
                "author": "Yevgeniy Brikman"
              }
            ],
            "exercises": [
              "Deploy an S3 bucket with Terraform, then scan it with Checkov",
              "Add a gitleaks step to a workflow",
              "Block a pull request when Checkov finds a high-risk issue"
            ],
            "milestones": [
              "Infrastructure is defined in code",
              "Scans run on every pull request",
              "No secrets live in the repo"
            ],
            "tools": [
              "Terraform",
              "Checkov",
              "GitHub Actions",
              "gitleaks"
            ]
          },
          {
            "slug": "cloud-detection-and-posture",
            "name": "Cloud detection and posture",
            "text": "Turn on cloud logs, find misconfigurations, and alert on risky activity.",
            "sub": [
              "CloudTrail and activity logs",
              "Posture checks",
              "GuardDuty and Defender",
              "Cloud attack paths"
            ],
            "soc": "-",
            "eng": "E",
            "time": "3 to 4 weeks",
            "resources": [
              {
                "name": "flAWS.cloud",
                "url": "https://flaws.cloud/",
                "kind": "Lab",
                "note": "Attack a weak AWS account, then turn on logs and find yourself."
              },
              {
                "name": "Prowler",
                "url": "https://github.com/prowler-cloud/prowler",
                "kind": "Tool",
                "note": "Free posture checks for AWS, Azure and GCP."
              },
              {
                "name": "CloudGoat",
                "url": "https://github.com/RhinoSecurityLabs/cloudgoat",
                "kind": "Lab",
                "note": "Vulnerable-by-design AWS scenarios."
              },
              {
                "name": "AWS CloudTrail user guide",
                "url": "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html",
                "kind": "Docs",
                "note": "How AWS records who did what."
              },
              {
                "name": "Pwned Labs cloud security labs",
                "url": "https://github.com/pwnedlabs/cloud-security-labs",
                "kind": "Lab",
                "note": "Free hands-on cloud attack labs."
              },
              {
                "name": "Microsoft Sentinel skill-up training",
                "url": "https://learn.microsoft.com/en-us/azure/sentinel/skill-up-resources",
                "kind": "Course",
                "note": "Free learning for Azure detection."
              }
            ],
            "books": [
              {
                "title": "AWS Security",
                "author": "Dylan Shields"
              }
            ],
            "exercises": [
              "Enable CloudTrail and find your own login event",
              "Run Prowler and fix 3 findings",
              "Write a rule for 'root account used'"
            ],
            "milestones": [
              "Cloud logs are on and searchable",
              "You fixed real findings",
              "One cloud alert rule works"
            ],
            "tools": [
              "CloudTrail",
              "GuardDuty",
              "Prowler",
              "Microsoft Sentinel"
            ]
          }
        ]
      },
      {
        "name": "AppSec and AI",
        "topics": [
          {
            "slug": "threat-modelling-and-secure-design",
            "name": "Threat modelling and secure design",
            "text": "Think like an attacker before the code is written, and design controls to match.",
            "sub": [
              "Data flow diagrams",
              "STRIDE",
              "Attack trees",
              "Choosing controls"
            ],
            "soc": "-",
            "eng": "R",
            "time": "2 to 3 weeks",
            "resources": [
              {
                "name": "OWASP Threat Modeling Cheat Sheet",
                "url": "https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html",
                "kind": "Docs",
                "note": "Short and practical. Follow the four questions."
              },
              {
                "name": "Threat Modeling Manifesto",
                "url": "https://www.threatmodelingmanifesto.org/",
                "kind": "Docs",
                "note": "The core ideas on one page."
              },
              {
                "name": "OWASP Developer Guide: threat modeling",
                "url": "https://devguide.owasp.org/en/04-design/01-threat-modeling/01-threat-modeling-project/",
                "kind": "Docs",
                "note": "A free step-by-step guide."
              },
              {
                "name": "OWASP Threat Dragon",
                "url": "https://owasp.org/www-project-threat-dragon/",
                "kind": "Tool",
                "note": "A free diagram tool for threat models."
              },
              {
                "name": "OWASP ASVS",
                "url": "https://owasp.org/www-project-application-security-verification-standard/",
                "kind": "Docs",
                "note": "A checklist to design against."
              }
            ],
            "books": [
              {
                "title": "Threat Modeling: Designing for Security",
                "author": "Adam Shostack"
              }
            ],
            "exercises": [
              "Draw a data flow diagram of a login page",
              "List 10 STRIDE threats and a control for each",
              "Review a friend's side project and write the top 3 risks"
            ],
            "milestones": [
              "You can draw a data flow diagram",
              "You can name the 6 STRIDE threats",
              "You wrote one real threat model"
            ],
            "tools": [
              "OWASP Threat Dragon",
              "draw.io",
              "ASVS"
            ]
          },
          {
            "slug": "devsecops-scanners",
            "name": "DevSecOps scanners",
            "text": "Put scanners for code, packages and images into the build, and tune them so developers listen.",
            "sub": [
              "SAST",
              "Dependency scanning (SCA)",
              "Secrets and image scanning",
              "Triage and fix"
            ],
            "soc": "-",
            "eng": "E",
            "time": "3 weeks",
            "resources": [
              {
                "name": "Semgrep documentation",
                "url": "https://semgrep.dev/docs/",
                "kind": "Tool",
                "note": "Free code scanner. Run it on your own repo."
              },
              {
                "name": "Trivy",
                "url": "https://aquasecurity.github.io/trivy/latest/",
                "kind": "Tool",
                "note": "Free scanner for images, packages and config."
              },
              {
                "name": "OWASP ZAP",
                "url": "https://www.zaproxy.org/",
                "kind": "Tool",
                "note": "Free dynamic scanner for running apps."
              },
              {
                "name": "OWASP Dependency-Check",
                "url": "https://owasp.org/www-project-dependency-check/",
                "kind": "Tool",
                "note": "Find known-vulnerable libraries."
              },
              {
                "name": "OWASP DevSecOps Guideline",
                "url": "https://owasp.org/www-project-devsecops-guideline/",
                "kind": "Docs",
                "note": "Where each scanner fits in a pipeline."
              }
            ],
            "books": [
              {
                "title": "Alice and Bob Learn Application Security",
                "author": "Tanya Janca"
              }
            ],
            "exercises": [
              "Scan a repo with Semgrep and fix 3 findings",
              "Add Trivy to a Docker build",
              "Write one custom Semgrep rule"
            ],
            "milestones": [
              "A pipeline runs 3 kinds of scans",
              "You triaged findings, not just counted them",
              "One custom rule is in your repo"
            ],
            "tools": [
              "Semgrep",
              "Trivy",
              "OWASP ZAP",
              "Dependency-Check"
            ]
          },
          {
            "slug": "ai-and-llm-security",
            "name": "AI and LLM security",
            "text": "Test and defend apps that use language models: injection, leaks, and unsafe actions by agents.",
            "sub": [
              "Prompt injection",
              "Data leakage",
              "Agent and tool risks",
              "Guardrails and logging"
            ],
            "soc": "-",
            "eng": "R",
            "time": "3 to 4 weeks",
            "resources": [
              {
                "name": "OWASP Top 10 for LLM applications",
                "url": "https://genai.owasp.org/llm-top-10/",
                "kind": "Docs",
                "note": "The list of risks. Read all ten."
              },
              {
                "name": "Gandalf prompt injection game",
                "url": "https://gandalf.lakera.ai/",
                "kind": "Lab",
                "note": "A free game that teaches prompt injection."
              },
              {
                "name": "PortSwigger: Web LLM attacks",
                "url": "https://portswigger.net/web-security/llm-attacks",
                "kind": "Lab",
                "note": "Free labs on attacking LLM apps."
              },
              {
                "name": "MITRE ATLAS",
                "url": "https://atlas.mitre.org/",
                "kind": "Docs",
                "note": "An ATT&CK-style map of attacks on AI."
              },
              {
                "name": "NIST AI Risk Management Framework",
                "url": "https://www.nist.gov/itl/ai-risk-management-framework",
                "kind": "Docs",
                "note": "The standard risk guide for AI."
              },
              {
                "name": "Google Secure AI Framework",
                "url": "https://saif.google/",
                "kind": "Docs",
                "note": "A short guide to securing AI systems."
              }
            ],
            "books": [],
            "exercises": [
              "Beat three Gandalf levels and write how",
              "Run 5 prompt injections against a small chatbot you built",
              "Add input and output logging and review it"
            ],
            "milestones": [
              "You can explain prompt injection",
              "You tested a real app and wrote findings",
              "Your app logs what the model sees and does"
            ],
            "tools": [
              "OWASP LLM Top 10",
              "MITRE ATLAS",
              "Python"
            ]
          }
        ]
      }
    ]
  }
];
