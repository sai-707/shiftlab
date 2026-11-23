import { ATTACK, NO_MATCH_NOTE, techniqueUrl } from "@/content/attack";

/** MITRE ATT&CK techniques the alert's detection rule maps to. Shown once a case is closed, so the tag never hints at the verdict. */
export default function AttackTags({ alertId }: { alertId: string }) {
  const list = ATTACK[alertId];
  if (!list) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
      <span className="text-muted" title="MITRE ATT&CK is a public catalogue of attacker techniques. This is what the alert's rule is built to catch.">
        MITRE ATT&amp;CK
      </span>
      {list.length === 0 ? (
        <span className="max-w-xl text-muted">{NO_MATCH_NOTE}</span>
      ) : (
        list.map((t) => (
          <a
            key={t.id}
            href={techniqueUrl(t.id)}
            target="_blank"
            rel="noopener noreferrer"
            title={`${t.name}. Opens attack.mitre.org`}
            className="press rounded-full border border-line px-2.5 py-1 text-ink hover:border-accent hover:text-accent"
          >
            <span className="font-mono text-accent">{t.id}</span> <span className="text-muted">{t.name.split(": ").pop()}</span>
          </a>
        ))
      )}
    </div>
  );
}
