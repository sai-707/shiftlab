// Checks every outside link on the roadmap pages and writes a short report of the ones that need a look.
// Run by .github/workflows/roadmap-links.yml once a month, or by hand:
//   node --experimental-strip-types --disable-warning=ExperimentalWarning scripts/check-links.mjs [--out report.md]
// It does not change any file. If links are reported, fix them in content/roadmap.ts or content/roadmap-extra.ts, then set CHECKED
// in content/roadmap.ts to the day you looked, because the pages print that date.
import { appendFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { CHECKED, PHASES } from "../content/roadmap.ts";
import { CERTS, MARKET, PROJECTS, TOOLS } from "../content/roadmap-extra.ts";

/** Every https link in the roadmap data, once each. Walks the data, so a link added to any list later is checked without a change here. */
export function collectUrls(...roots) {
  const found = new Set();
  const walk = (v) => {
    if (typeof v === "string") {
      if (v.startsWith("https://")) found.add(v);
    } else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  roots.forEach(walk);
  return [...found];
}

/** ok: the page answered. blocked: the site refuses scripts (login walls, bot checks), so a person has to look. broken: gone or down. */
export function classify(status) {
  if (status >= 200 && status < 400) return "ok";
  if (status === 401 || status === 403 || status === 429 || status === 999) return "blocked";
  return "broken";
}

const HEADERS = { "user-agent": "Mozilla/5.0 (compatible; ShiftLabLinkCheck/1.0; +https://github.com/sai-707/shiftlab)", accept: "text/html,*/*;q=0.8" };

async function once(url, method, timeoutMs) {
  const res = await fetch(url, { method, headers: HEADERS, redirect: "follow", signal: AbortSignal.timeout(timeoutMs) });
  res.body?.cancel().catch(() => {});
  return res.status;
}

/** Tries HEAD first (cheap), then GET, because many sites answer HEAD with an error. One retry on a network failure. */
export async function check(url, { timeoutMs = 15000 } = {}) {
  let last = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    for (const method of ["HEAD", "GET"]) {
      try {
        const status = await once(url, method, timeoutMs);
        if (classify(status) === "ok" || method === "GET") return { url, status, kind: classify(status) };
      } catch (e) {
        last = e?.cause?.code || e?.name || "error";
      }
    }
  }
  return { url, status: 0, kind: "broken", note: last || "no answer" };
}

export async function checkAll(urls, { concurrency = 8, ...opts } = {}) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (i < urls.length) out.push(await check(urls[i++], opts));
    }),
  );
  return out.sort((a, b) => a.url.localeCompare(b.url));
}

export function report(results, today) {
  const by = (k) => results.filter((r) => r.kind === k);
  const rows = (list) => list.map((r) => `| ${r.url} | ${r.status || r.note} |`).join("\n");
  const head = "| Link | Answer |\n| --- | --- |\n";
  return [
    `# Roadmap link check, ${today}`,
    "",
    `${results.length} links checked: ${by("ok").length} fine, ${by("broken").length} broken, ${by("blocked").length} refused the checker.`,
    "",
    by("broken").length ? `## Broken, fix or replace\n\n${head}${rows(by("broken"))}\n` : "## Broken\n\nNone.\n",
    by("blocked").length ? `## Refused the checker, open these by hand\n\nA login wall or bot check often does this and the page is usually fine.\n\n${head}${rows(by("blocked"))}\n` : "",
    `After fixing, set \`CHECKED\` in content/roadmap.ts (now "${CHECKED}") to today's date.`,
  ].join("\n");
}

async function main() {
  const urls = collectUrls(PHASES, MARKET, CERTS, TOOLS, PROJECTS);
  const results = await checkAll(urls);
  const md = report(results, new Date().toISOString().slice(0, 10));
  const out = process.argv.indexOf("--out");
  if (out > 0) writeFileSync(process.argv[out + 1], md);
  console.log(md);
  // Lets the workflow decide whether to open an issue.
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `broken=${results.filter((r) => r.kind === "broken").length}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
