import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import StartChecklist from "@/components/start/StartChecklist";

export const metadata = { title: "Start here" };

const panel = "rounded-2xl border border-line bg-panel p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]";

const STEPS = [
  { title: "Take an alert", text: "Open the Alert queue and press Assign to me. You work on one alert at a time, like a real shift." },
  { title: "Read the briefing", text: "Each alert starts with what raised it, what the rule looks for and who is involved, plus questions to ask first." },
  { title: "Investigate", text: "Study the evidence. Use the Intel lookup for IPs, domains and hashes, and the Log search for the wider picture." },
  { title: "Decide", text: "Choose true positive or false positive, and whether to escalate. Both choices matter and are scored separately." },
  { title: "Write your report", text: "Say what happened, what is confirmed, what is still unknown and what should happen next. Keep it short and factual." },
  { title: "Learn from the feedback", text: "You get a score, what you missed and what really happened. Compare with a similar alert to sharpen your instinct." },
];

const SCORE = [
  { part: "Verdict", points: 30, text: "True or false positive. A wrong verdict caps the whole score at 40." },
  { part: "Escalation", points: 15, text: "Escalate or handle it yourself." },
  { part: "What happened", points: 15, text: "The key facts, in this section." },
  { part: "What is confirmed", points: 15, text: "The facts the evidence proves, and where they came from." },
  { part: "What is unknown", points: 10, text: "The specific gaps you could not close." },
  { part: "Next action", points: 15, text: "What should happen, and who does it." },
];

const PAGES = [
  { href: "/queue", name: "Alert queue", text: "Take the next alert and investigate it." },
  { href: "/practice", name: "Practice and learn", text: "Playbooks, glossary and short skill drills. Start here if you feel lost." },
  { href: "/reports", name: "Case reports", text: "Review your past reports." },
  { href: "/handover", name: "Shift handover", text: "Write notes for the next shift." },
];

export default function StartPage() {
  return (
    <>
      <PageHeader
        title="Start here"
        description="ShiftLab lets you practise being a SOC Level 1 analyst on realistic alerts. Everything is fictional, so you cannot break anything."
      />

      <div className="space-y-6">
        <section className={panel}>
          <h2 className="font-semibold">What does a SOC Level 1 analyst do?</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            A SOC watches a company&apos;s systems for attacks. Security tools raise thousands of alerts, and most turn out to
            be harmless. The Level 1 analyst is the first person to look at each one. Your job is to work out quickly and
            carefully which alerts are real, write down what you found, and pass the serious ones to a senior colleague.
          </p>
        </section>

        <section className={panel}>
          <h2 className="font-semibold">How a shift works</h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-xl border border-line bg-canvas/50 p-4">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                  {i + 1}
                </span>
                <p className="mt-3 text-sm font-medium">{s.title}</p>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className={panel}>
            <h2 className="font-semibold">Your first goals</h2>
            <div className="mt-3">
              <StartChecklist />
            </div>
          </section>

          <section className={panel}>
            <h2 className="font-semibold">How scoring works</h2>
            <p className="mt-1 text-sm text-muted">Each case is out of 100. All four report sections are compulsory, and each fact only counts in its own section. On Intermediate, Hard and AI Era alerts the evidence is hidden: you must open at least 3 sources (4 on Hard and AI Era) before you can report, and 15 points reward looking at the sources that matter, so the other parts count a little less. A report that names fewer than two key facts is capped at 40, and one that contradicts the evidence is capped at 70.</p>
            <ul className="mt-3 divide-y divide-line text-sm">
              {SCORE.map((s) => (
                <li key={s.part} className="flex items-baseline justify-between gap-4 py-2.5">
                  <span>
                    <span className="font-medium">{s.part}</span>
                    <span className="block text-muted">{s.text}</span>
                  </span>
                  <span className="font-mono text-accent">{s.points}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className={panel}>
          <h2 className="font-semibold">True positive, false positive, and escalation</h2>
          <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-xl border border-line bg-canvas/50 p-4">
              <p className="font-medium text-missed">True positive</p>
              <p className="mt-1 text-muted">The alert is right: something harmful or against policy really happened.</p>
            </div>
            <div className="rounded-xl border border-line bg-canvas/50 p-4">
              <p className="font-medium text-correct">False positive</p>
              <p className="mt-1 text-muted">The alert fired, but there is a harmless explanation, such as an approved scan.</p>
            </div>
            <div className="rounded-xl border border-line bg-canvas/50 p-4">
              <p className="font-medium text-accent">Escalate or not</p>
              <p className="mt-1 text-muted">
                A separate decision. A real attack that was fully blocked may need no escalation, and a real one that got in
                usually does.
              </p>
            </div>
          </div>
        </section>

        <section className={panel}>
          <h2 className="font-semibold">Where to find things</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {PAGES.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="block rounded-xl border border-line bg-canvas/50 p-4 text-sm transition-colors hover:border-accent/60"
                >
                  <span className="font-medium text-accent">{p.name}</span>
                  <span className="block text-muted">{p.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
