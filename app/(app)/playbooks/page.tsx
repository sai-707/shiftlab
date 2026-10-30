import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { ALERTS } from "@/content/alerts";
import { PLAYBOOKS } from "@/content/playbooks";
import { TOPIC_COLOR } from "@/lib/topics";

export const metadata = { title: "Playbooks" };

export default function PlaybooksPage() {
  return (
    <>
      <PageHeader
        back={{ href: "/practice", label: "Practice and learn" }}
        title="Playbooks"
        description="Step-by-step checklists for each type of alert. Real SOC teams work from guides like these, so read one before you take an alert."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PLAYBOOKS.map((p) => {
          const count = ALERTS.filter((a) => a.topic === p.topic).length;
          return (
            <Link
              key={p.slug}
              href={`/playbooks/${p.slug}`}
              className="spot group flex flex-col rounded-2xl border border-line bg-panel p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)] hover:border-accent/60"
            >
              <span className="flex items-center gap-2 text-xs text-muted">
                <span className="h-2 w-2 rounded-full" style={{ background: TOPIC_COLOR[p.topic] }} />
                {p.topic}
              </span>
              <h2 className="mt-2 text-lg font-semibold tracking-tight group-hover:text-accent">{p.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted">{p.goal}</p>
              <p className="mt-4 text-xs text-muted">
                {p.steps.length} steps · {count} practice {count === 1 ? "alert" : "alerts"}
              </p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
