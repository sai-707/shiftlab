import type { IntelReport, IntelVerdict } from "./types";

/** Invented engine names, so no real security vendor is named or imitated. */
export const ENGINES = [
  "Aegis Shield", "Bastion", "Cipherwall", "Dunmore Labs", "Ember AV", "Fathom", "Gridlock", "Halcyon",
  "Ironbark", "Juniper Sec", "Kestrel", "Lumen Guard", "Meridian", "Nimbus Sec", "Obsidian", "Pinewatch",
  "Quill", "Redoak", "Sentry-7", "Tidewater", "Umbra", "Vantage", "Warden", "Xenon",
];

const HASH_TYPE: Record<number, string> = { 32: "MD5", 40: "SHA-1", 64: "SHA-256" };

const LABELS: Record<string, string[]> = {
  "IP address": ["Malicious host", "Scanner", "Bad reputation"],
  Domain: ["Phishing", "Malicious", "Suspicious domain"],
  "File hash": ["Trojan.Gen", "Malware", "Downloader"],
};

/** Same text always gives the same numbers and the same vendors, so a repeat lookup never changes its answer. */
function seeded(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
}

const NEXT: Record<IntelVerdict, string[]> = {
  malicious: [
    "Search the logs: did any of our machines talk to it?",
    "Write the indicator and where you found it in your report.",
    "If one of ours connected, treat it as a real incident and escalate.",
  ],
  suspicious: [
    "Check how old it is and who owns it.",
    "See how our machines used it in the logs.",
    "Do not decide on this alone. Weigh it with the rest of the evidence.",
  ],
  clean: [
    "Clean means it is known and normal. Check it matches what the alert says.",
    "Look for other evidence before you close the case as a false positive.",
  ],
  internal: [
    "Find who owns this machine in the asset list.",
    "Ask: is it normal for this machine to do this?",
  ],
  unknown: [
    "Check how old it is. New is a warning sign (WHOIS is in Tools).",
    "Search the logs: which of our machines talked to it?",
    "Does the alert give a reason to trust it?",
  ],
};

/** Not a valid indicator, so there is nothing to report on. */
const INVALID = /^(Empty|Not an IP address|Not recognised)$/;

export function buildReport(
  query: string,
  d: { verdict: IntelVerdict; kind: string },
  extraFacts: [string, string][] = [],
): IntelReport | undefined {
  if (INVALID.test(d.kind)) return undefined;
  const rnd = seeded(query.toLowerCase());
  const base = d.kind.startsWith("File hash") ? "File hash" : d.kind.includes("IP") ? "IP address" : "Domain";

  const flagged = d.verdict === "malicious" ? 12 + Math.floor(rnd() * 10) : d.verdict === "suspicious" ? 3 + Math.floor(rnd() * 5) : 0;
  const order = ENGINES.map((_, i) => i).sort(() => rnd() - 0.5);
  const hits = new Map(order.slice(0, flagged).map((engine, n) => [engine, LABELS[base][n % 3]]));
  const vendors = ENGINES.map((name, i) => ({ name, hit: hits.get(i) ?? null }));

  const facts: [string, string][] = [...extraFacts];
  if (base === "File hash") facts.push(["Hash type", HASH_TYPE[query.length] ?? "Unknown"]);
  if (flagged) facts.push(["Flagged by", `${flagged} of ${ENGINES.length} vendors`]);

  const unseen = d.verdict === "unknown";
  const tags = [d.kind, ...(d.verdict === "internal" ? ["our network"] : unseen ? [] : [d.verdict])];
  return { flagged, vendors, tags, facts, next: NEXT[d.verdict], ...(unseen && { unseen }) };
}
