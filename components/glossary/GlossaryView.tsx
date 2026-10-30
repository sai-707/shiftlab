"use client";

import { useState } from "react";
import { GLOSSARY } from "@/content/glossary";

export default function GlossaryView() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const terms = [...GLOSSARY]
    .sort((a, b) => a.term.localeCompare(b.term))
    .filter((t) => !q || `${t.term} ${t.meaning}`.toLowerCase().includes(q));

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search terms, for example MFA or SIEM"
        aria-label="Search the glossary"
        className="w-full max-w-md rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent"
      />
      {terms.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-panel p-6 text-sm text-muted">
          No term matches that search.
        </p>
      ) : (
        <dl className="grid gap-3 md:grid-cols-2">
          {terms.map((t) => (
            <div key={t.term} className="rounded-xl border border-line bg-panel p-4">
              <dt className="font-semibold text-accent">{t.term}</dt>
              <dd className="mt-1 text-sm">{t.meaning}</dd>
              {t.example && <dd className="mt-1 font-mono text-xs text-muted">e.g. {t.example}</dd>}
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
