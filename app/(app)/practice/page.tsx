import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { LEARN, PRACTICE, type HubItem } from "@/content/practiceHub";

export const metadata = { title: "Practice and learn" };

function Card({ item, n }: { item: HubItem; n?: number }) {
  return (
    <li>
      <Link
        href={item.href}
        className="spot flex h-full gap-3 rounded-2xl border border-line bg-panel p-4 hover:border-accent/60"
      >
        {n !== undefined && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-raised text-xs font-semibold text-accent">
            {n}
          </span>
        )}
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="font-medium">{item.name}</span>
            <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">{item.level}</span>
          </span>
          <span className="mt-1 block text-sm text-muted">{item.text}</span>
        </span>
      </Link>
    </li>
  );
}

export default function PracticePage() {
  return (
    <>
      <PageHeader
        title="Practice and learn"
        description="You do not need all of this at once. Start at the top, and come back whenever you want to get better at one skill."
      />
      <div className="space-y-8">
        <section>
          <h2 className="font-semibold">1. Learn the basics</h2>
          <p className="mt-1 text-sm text-muted">Read these before or alongside your first alerts.</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {LEARN.map((i) => (
              <Card key={i.href} item={i} />
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-semibold">2. Practise one skill at a time</h2>
          <p className="mt-1 text-sm text-muted">Each one is short. Take them in order, or jump to the one you need.</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {PRACTICE.map((i, idx) => (
              <Card key={i.href} item={i} n={idx + 1} />
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
