// SERVER ONLY. Rule-based review of a submitted report. It never touches the score.
import { ANSWER_KEYS } from "@/content/answer-keys";
import { REVIEW_KEYS, type Section } from "@/content/review-keys";
import type { ReportSections } from "@/lib/types";

export type Status = "strong" | "detail" | "missing" | "vague";
export type SectionReview = {
  section: Section;
  title: string;
  text: string;
  status: Status;
  good: string[];
  fix: string[];
  tryThis: string | null;
};
export type ReviewData = {
  sections: SectionReview[];
  mistakes: string[];
  tip: string;
  model: Record<Section, string>;
};

const TITLES: Record<Section, string> = {
  happened: "What happened",
  confirmed: "What you confirmed",
  unknown: "What you do not know yet",
  next: "Next steps",
};
const ORDER: Section[] = ["happened", "confirmed", "unknown", "next"];

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Short tokens (numbers, "mfa", "l2") must stand alone so "14" does not match "14:02". */
export function has(text: string, m: string): boolean {
  const t = m.trim().toLowerCase();
  if (!t) return false;
  if (t.length > 3) return text.includes(t);
  return new RegExp(`(^|[^\\w.:])${esc(t)}([^\\w.:]|$)`).test(text);
}
export const anyOf = (text: string, ms: string[]) => ms.some((m) => has(text, m));

const IP = /\b\d{1,3}(\.\d{1,3}){3}\b/;
const TIME = /\b\d{1,2}:\d{2}\b/;
const HOST = /\b[a-z0-9-]+\.test\b|\b[a-z]+-[a-z0-9-]*\d+\b|\b[a-z]\.[a-z]{3,}\b/i;
const VAGUE = /\b(suspicious|suspicous|weird|strange|fishy|odd|bad|malicious)\b/i;
export const SOURCE = /\b(logs?|proxy|headers?|lookups?|intel|edr|siem|waf|firewall|dlp|vpn|audit|records?|calendar|ticket|change|rota|whois|sandbox)\b/i;
export const UNCERTAIN = /(not known|unknown|unclear|cannot tell|can't tell|cant tell|do not know|don't know|dont know|not sure|unsure|whether|yet|need to find|still need)/i;
const NOTHING = /^(nothing|none|n\/a|na|no|nil|-)\b/i;
export const ACTION = /(escalat|isolat|reset|block|close|disable|revoke|search|delete|contact|collect|preserve|tune|allow|exclude|monitor|watch|ask|check|review|remove|analys|rotate|notify|involve|hold|restrict|purge|report)/i;
const OWNER = /(\bl2\b|level 2|\bsoc\b|team|\bask\b|please|\bi will\b|\bi would\b|\bi'll\b|engineer|\bhr\b|manager|owner|finance|procurement|detection|\bwe\b|suggest|recommend|\bclose\b)/i;

export function contradictions(all: string, avoid: { pattern: string; message: string }[] | undefined): string[] {
  const out: string[] = [];
  for (const a of avoid ?? []) {
    const re = new RegExp(a.pattern, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(all))) {
      const before = all.slice(Math.max(0, m.index - 30), m.index);
      if (!/(\bnot\b|n't|\bno\b|\bnothing\b|\bnever\b|\bwithout\b|\bnor\b)\s*\w*\s*$/.test(before)) {
        out.push(a.message);
        break;
      }
    }
  }
  return out;
}

export function reviewReport(alertId: string, sections: ReportSections): ReviewData | null {
  if (!Object.hasOwn(REVIEW_KEYS, alertId)) return null;
  const key = REVIEW_KEYS[alertId];
  const answer = Object.hasOwn(ANSWER_KEYS, alertId) ? ANSWER_KEYS[alertId] : null;
  const isFP = answer?.verdict === "fp";
  const needEscalate = answer?.escalate ?? false;

  const text = {} as Record<Section, string>;
  const low = {} as Record<Section, string>;
  for (const s of ORDER) {
    text[s] = String(sections?.[s] ?? "").trim().slice(0, 3000);
    low[s] = text[s].toLowerCase();
  }
  const whole = ORDER.map((s) => low[s]).join("\n");
  const wrong = contradictions(whole, key.avoid);

  const out: SectionReview[] = ORDER.map((s) => {
    const t = text[s];
    const l = low[s];
    const n = words(t);
    const good: string[] = [];
    const fix: string[] = [];
    let status: Status;

    if (n < 3) {
      status = "missing";
      if (s === "unknown") fix.push("Every case has gaps. Writing them down shows judgement and tells L2 where to look.");
      else if (s === "next") fix.push("Say what should happen now and who does it.");
      else fix.push("This section is empty. Say what the logs showed, with names, addresses and times.");
      return { section: s, title: TITLES[s], text: t, status, good, fix, tryThis: key.model[s] };
    }

    if (s === "happened" || s === "confirmed") {
      const facts = key.facts.filter((f) => f.in === s);
      const hit = facts.filter((f) => anyOf(l, f.matches) || anyOf(whole, f.matches));
      const miss = facts.filter((f) => !hit.includes(f));
      const need = Math.ceil(facts.length * 0.6);
      const specifics = IP.test(t) || TIME.test(t) || HOST.test(t);
      hit.slice(0, 3).forEach((f) => good.push(`You covered ${f.label}.`));
      miss.slice(0, 3).forEach((f) => fix.push(`Missing: ${f.label}.`));
      if (s === "happened" && !specifics) fix.unshift("No address, server or time. A reader cannot find the events from this.");
      if (s === "confirmed" && !SOURCE.test(t)) fix.push("Say where each fact came from (proxy log, mail headers, lookup, change calendar) so L2 can repeat it.");
      if (VAGUE.test(t) && hit.length < 2) fix.unshift("\"Suspicious\" is a feeling, not evidence. Say why, with the specific facts.");
      if (n < 8 || (hit.length === 0 && !specifics)) status = "vague";
      else status = hit.length >= need && fix.filter((x) => !x.startsWith("Missing")).length === 0 ? "strong" : "detail";
      if (status === "strong" && miss.length) status = hit.length >= need ? "strong" : "detail";
    } else if (s === "unknown") {
      const nothing = n < 6 || (NOTHING.test(t) && n < 10);
      if (isFP && !UNCERTAIN.test(t) && n >= 6) {
        good.push("For a clear false positive, a short answer is fine.");
        status = "strong";
      } else if (isFP && nothing) {
        good.push("For a clear false positive, a short answer is fine.");
        fix.push("Add one line saying what you checked, so the next analyst trusts it.");
        status = "detail";
      } else if (nothing) {
        status = "vague";
        fix.push("Too thin for a real threat. Name what you cannot tell yet and what would answer it.");
      } else if (UNCERTAIN.test(t)) {
        status = n >= 10 ? "strong" : "detail";
        good.push("You said clearly what is still open.");
        if (n < 10) fix.push("Add what would answer it (which log, who to ask).");
      } else {
        status = "detail";
        fix.push("This reads like a finding, not a gap. Start with 'I do not know whether…'.");
      }
    } else {
      const hit = key.next.filter((x) => anyOf(l, x.matches));
      const miss = key.next.filter((x) => !hit.includes(x));
      const need = Math.max(1, Math.ceil(key.next.length * 0.5));
      hit.slice(0, 3).forEach((x) => good.push(`You included ${x.label}.`));
      miss.slice(0, 3).forEach((x) => fix.push(`Consider: ${x.label}.`));
      const act = ACTION.test(t);
      if (!act) fix.unshift("Who does what? A next step needs an owner and an action.");
      else if (!OWNER.test(t)) fix.push("Say who does each step (you, L2, the user's manager).");
      if (needEscalate && !/(escalat|\bl2\b|level 2|incident)/i.test(t)) fix.unshift("This case needs escalation. Say so plainly and name who gets it.");
      if (!needEscalate && /escalat/i.test(t) && !/(no escalat|not escalat|not need|no need|don't need|do not need|without escalat|rather than escalat)/i.test(t))
        fix.unshift("This case does not need escalation. Say so and say why, so L2 is not interrupted.");
      if (n < 5 || !act) status = "vague";
      else status = hit.length >= need && !fix.some((x) => !x.startsWith("Consider")) ? "strong" : "detail";
    }

    for (const w of wrong) if (s === "happened" || s === "confirmed" || s === "next") { if (!fix.includes(w) && s === "confirmed") fix.unshift(w); }
    if (wrong.length && status === "strong") status = "detail";
    return { section: s, title: TITLES[s], text: t, status, good, fix, tryThis: status === "strong" ? null : key.model[s] };
  });

  // One practice tip, chosen from the weakest area.
  const by = (s: Section) => out.find((o) => o.section === s)!;
  let tip: string;
  if (wrong.length) tip = "Check your conclusion against the evidence before you write it. If a sentence contradicts your own logs, rewrite it.";
  else if (by("happened").status !== "strong") tip = "Name the who, where and when (address, host, time) in the first sentence of every report.";
  else if (by("unknown").status !== "strong") tip = "Always write one thing you do not know yet. It shows judgement and tells L2 where to look.";
  else if (by("next").status !== "strong") tip = "Give every next step an owner and an action, for example 'Ask L2 to isolate web-bastion-02'.";
  else if (by("confirmed").status !== "strong") tip = "Say where each fact came from (proxy log, headers, lookup). A claim without a source is only an opinion.";
  else tip = "Strong report. Next time, try keeping it under 120 words in total. L2 reads dozens a shift.";

  return { sections: out, mistakes: [...wrong, ...key.pitfalls], tip, model: key.model };
}
