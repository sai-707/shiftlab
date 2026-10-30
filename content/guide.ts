// The words of the guide. Used by the /guide page (app/guide/page.tsx) and the downloadable PDF (public/ShiftLab-guide.pdf).
// Change the text here, then remake the PDF so the two stay the same. No alert counts are written here (the number grows).
// Plain data only (no "@/" imports), so the tests can load it.

export const GUIDE = {
  eyebrow: "About ShiftLab",
  title: "A free place to practise being a security analyst.",
  lead: "ShiftLab lets you work a made-up security shift. Alerts come in, you investigate, decide what is going on and write the report. It is built for people who want a cyber security career and have never done the job.",
  glance: [
    { k: "What it is", v: "A practice site where you work fictional security alerts." },
    { k: "Who it is for", v: "Students, career switchers and new Level 1 analysts." },
    { k: "Cost", v: "Free. Try it as a guest, no signup." },
    { k: "You need", v: "No experience and nothing to install." },
  ],

  problem: {
    eyebrow: "The problem",
    title: "Beginners rarely get to practise the actual job",
    intro:
      "A SOC (Security Operations Centre) is the team that watches a company's computers for attacks. The first person to look at each warning is a Level 1 analyst. It is the usual way into the field, and it is hard to prepare for.",
    cards: [
      {
        big: "28%",
        plain: false,
        title: "Too many alerts, too few people",
        text: "Security tools raise far more warnings than a team can read. In one 2026 survey, teams left on average 28% of alerts uninvestigated, mostly for lack of time or staff.",
        source: "Source 1",
      },
      {
        big: "Up to 1 yr",
        plain: false,
        title: "New hires take months to become useful",
        text: "In a 2022 survey of 1,250 hiring managers, 37% said entry-level staff work independently within six months. Half said it takes up to a year.",
        source: "Source 2",
      },
      {
        big: "Facts, not decisions",
        plain: true,
        title: "Learning material stops short of the job",
        text: "A lot of beginner material explains what phishing or a stolen password is. The daily work is different: look at messy evidence, decide, and explain your decision.",
        source: "Author's experience",
      },
    ],
    caveat:
      "The figures come from industry surveys. The 2026 survey was paid for by a security company and its answers are self-reported, so read the numbers as a guide, not as a measurement.",
  },

  does: {
    eyebrow: "What ShiftLab does about it",
    title: "You practise the decision, not just the vocabulary",
    intro:
      "Every alert in ShiftLab follows the same four steps a real Level 1 analyst follows. You do it yourself, at your own speed, with hints available and nothing real at risk.",
    steps: [
      { title: "An alert arrives", text: "You see what the security tool reported, who or what it involves, and when." },
      { title: "Look at the evidence", text: "Search the logs, check a suspicious link or address, read the forwarded email." },
      { title: "Make the call", text: "False alarm, real attack, or hand it to a senior analyst (this is called escalating)." },
      { title: "Write it up", text: "Explain your reasoning in a short report. You get a score, what you missed and what really happened." },
    ],
  },

  example: {
    eyebrow: "An example",
    title: "One alert, start to finish",
    intro: "This is what a single, simple alert looks like. It is a made-up example for this guide and is not one of the alerts on the site.",
    alert: "Employee opened a link from a text message claiming to be a parcel company",
    rows: [
      { k: "1 · The alert", text: "The web filter noticed an employee's computer visiting a site that looks like a delivery company's page.", call: "" },
      { k: "2 · Evidence", text: "The web address is not the delivery company's real address. The site was created two days ago. The page asks for card details.", call: "" },
      { k: "3 · The call", text: "This is phishing. The open question is whether the employee typed in anything, so check the log of what they sent and escalate if they did.", call: "Real attack" },
      { k: "4 · The report", text: "A few plain sentences: what happened, what is confirmed, what is still unknown, and what should happen next.", call: "" },
    ],
  },

  benefits: {
    eyebrow: "How it helps you",
    title: "What you get out of it",
    items: [
      { title: "Practise the real routine", text: "Triage, investigate, decide, report. The same cycle you would repeat all day in the job." },
      { title: "Make mistakes safely", text: "Everything is fictional. A wrong call costs you a lower score, not a company's data." },
      { title: "Learn from feedback", text: "After each report you see what you missed and what really happened, then try a similar alert." },
      { title: "Get faster under pressure", text: "Timed drills such as a six-alert shift and a triage sprint train you to pick what matters first." },
      { title: "Prepare for the AI era", text: "Practise checking an AI assistant's summary and finding where it went wrong." },
      { title: "Have something to talk about", text: "Closed cases and written reports give you real examples to describe in an interview." },
    ],
  },

  who: {
    eyebrow: "Who it is for",
    title: "Made for people at the start",
    forYouTitle: "ShiftLab is for you if you are",
    forYou: [
      "A student aiming for a SOC or other blue-team job",
      "Changing careers into cyber security",
      "Self-taught and want practice beyond videos",
      "A new Level 1 analyst who wants more repetitions",
    ],
    notTitle: "It is not",
    notFor: ["A certificate or a course", "A tool for advanced malware or forensics work", "Real company data or real attack tools"],
  },

  levels: [
    { name: "Beginner", text: "One clear clue per alert." },
    { name: "Intermediate", text: "Several clues, some misleading." },
    { name: "Hard", text: "Real attack styles with a lot of noise." },
    { name: "AI Era", text: "AI tools involved, and an AI helper that can be wrong." },
  ],

  // shortcut: a draft in the owner's voice. He should rewrite it in his own words.
  why: {
    eyebrow: "Why I made it",
    title: "I needed this when I was learning",
    paragraphs: [
      "I am a third-year computer science student, and I want to work as a SOC Level 1 analyst. I studied from videos and hands-on labs, and they taught me the words.",
      "What I could not find was a free place to practise the job itself: alert after alert, messy evidence, and a decision I had to make and explain. So I started building one.",
      "Every alert, person and company in ShiftLab is made up and written from scratch. I built it first to practise myself, then to make the same practice easier to find for the next student. I am still adding alerts and fixing things, and I want your honest feedback.",
    ],
    author: "Sai Daswadkar",
  },

  start: {
    eyebrow: "How to start",
    title: "Your first alert takes about ten minutes",
    steps: [
      "Press \"Try it as a guest\". No signup is needed.",
      "Open a Beginner alert from the queue and follow the four steps. Use a hint if you get stuck.",
      "Create a free account if you want your progress and reports saved.",
    ],
  },

  faq: [
    { q: "Do I need to know anything first?", a: "No. Every word is explained in the glossary, and each alert has hints you can open when you are stuck." },
    { q: "Is it free? Do I need an account?", a: "It is free. You can try it as a guest. A free account saves your progress and your case reports." },
    { q: "Is any of this real company data?", a: "No. Harbor & Pine Logistics is made up, and so are its people and computers. The alerts are inspired by real incidents." },
    { q: "Will this get me a job?", a: "It will not on its own, and it is not a certificate. It gives you practice at the daily routine, which helps in interviews and in the first weeks of a job." },
  ],

  sources: [
    {
      n: 1,
      text: "Prophet Security, State of AI in Security Operations (August 2026), as reported by Expert Insights. 250 security professionals; paid for by a security vendor.",
      url: "https://expertinsights.com/news/security-teams-ignore-nearly-a-third-of-alerts",
    },
    {
      n: 2,
      text: "(ISC)², 2022 Cybersecurity Hiring Managers study (survey run December 2021, 1,250 hiring managers).",
      url: "https://www.securityinfowatch.com/cybersecurity/press-release/21271326/isc2-is-an-international-nonprofit-membership-association-isc2-research-finds-employer-hiring-practices-must-evolve-to-overcome-the-cybersecurity-workforce-gap",
    },
  ],
  footnote: "Harbor & Pine Logistics and everyone in it are made up.",
} as const;
