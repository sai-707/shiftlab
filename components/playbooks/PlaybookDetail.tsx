"use client";

import Link from "next/link";
import { useState } from "react";
import { ALERTS } from "@/content/alerts";
import type { Playbook } from "@/content/playbooks";
import { TOPIC_COLOR } from "@/lib/topics";
import SeverityBadge from "@/components/ui/SeverityBadge";

const panel = "rounded-2xl border border-line bg-panel p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]";

function Bullets({ items, tone }: { items: string[]; tone?: "real" | "benign" }) {
  const dot = tone === "real" ? "bg-missed" : tone === "benign" ? "bg-correct" : "bg-muted";
  return (
    <ul className="mt-3 space-y-2 text-sm">
      {items.map((i) => (
        <li key={i} className="flex gap-2.5">
          <span className={`mt-1.75 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PlaybookDetail({ playbook: p }: { playbook: Playbook }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const practice = ALERTS.filter((a) => a.topic === p.topic);

  function toggle(i: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (!next.delete(i)) next.add(i);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/playbooks" className="text-sm text-muted hover:text-accent">
          ← All playbooks
        </Link>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <span className="h-2 w-2 rounded-full" style={{ background: TOPIC_COLOR[p.topic] }} />
          {p.topic}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{p.title} playbook</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">{p.goal}</p>
        <p className="mt-2 max-w-3xl text-sm">
          <span className="text-muted">Use this when: </span>
          {p.whenToUse}
        </p>
      </div>

      <section className={panel}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Steps</h2>
          <span className="text-xs text-muted">
            {done.size} of {p.steps.length} ticked
          </span>
        </div>
        <ol className="mt-4 space-y-3">
          {p.steps.map((s, i) => (
            <li key={s.title}>
              <label className="flex cursor-pointer gap-3 rounded-lg border border-line bg-canvas/50 p-3 transition-colors has-checked:border-correct/50">
                <input
                  type="checkbox"
                  checked={done.has(i)}
                  onChange={() => toggle(i)}
                  className="mt-1 h-4 w-4 shrink-0 accent-(--color-accent)"
                />
                <span>
                  <span className="block text-sm font-medium">
                    {i + 1}. {s.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted">{s.detail}</span>
                </span>
              </label>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={panel}>
          <h2 className="font-semibold text-missed">Signs it is real</h2>
          <Bullets items={p.signsReal} tone="real" />
        </section>
        <section className={panel}>
          <h2 className="font-semibold text-correct">Signs it is harmless</h2>
          <Bullets items={p.signsBenign} tone="benign" />
        </section>
        <section className={panel}>
          <h2 className="font-semibold">Escalate when</h2>
          <Bullets items={p.escalateWhen} />
        </section>
        <section className={panel}>
          <h2 className="font-semibold">Common mistakes</h2>
          <Bullets items={p.mistakes} />
        </section>
      </div>

      <section className={panel}>
        <h2 className="font-semibold">Tools you will use</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {p.tools.map((t) => (
            <span key={t} className="rounded-full border border-line bg-raised px-3 py-1 text-xs">
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className={panel}>
        <h2 className="font-semibold">Practice with this playbook</h2>
        <ul className="mt-2 divide-y divide-line">
          {practice.map((a) => (
            <li key={a.id}>
              <Link href={`/alerts/${a.id}`} className="group flex items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0">
                  <span className="font-mono text-xs text-muted">{a.id}</span>
                  <span className="block truncate group-hover:text-accent">{a.title}</span>
                </span>
                <SeverityBadge severity={a.severity} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
