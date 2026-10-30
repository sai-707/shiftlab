// The answer keys must never reach the browser. This walks the import graph from every client file.
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIRS = ["app", "components", "content", "lib"];
const SERVER_ONLY = [/-keys\.ts$/, /lib[\\/]grade\.ts$/, /lib[\\/]review\.ts$/];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const files = DIRS.flatMap((d) => walk(join(root, d)));
const source = new Map(files.map((f) => [f, readFileSync(f, "utf8")]));
const firstLine = (f) => source.get(f).trimStart().split("\n", 1)[0];
const isClient = (f) => /^["']use client["']/.test(firstLine(f));
const isServerAction = (f) => /^["']use server["']/.test(firstLine(f));

function resolveImport(from, spec) {
  const base = spec.startsWith("@/") ? join(root, spec.slice(2)) : spec.startsWith(".") ? resolve(dirname(from), spec) : null;
  if (!base) return null;
  return [`${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx"), base].find((c) => source.has(c)) ?? null;
}

function imports(f) {
  const found = [];
  for (const m of source.get(f).matchAll(/^\s*(?:import|export)\s+(?!type\b)[^;]*?from\s+["']([^"']+)["']/gm)) {
    const target = resolveImport(f, m[1]);
    if (target) found.push(target);
  }
  return found;
}

test("no client file can reach an answer key or the grading code", () => {
  // Client files: anything marked "use client", plus everything under components/ (they all render in the browser).
  const clients = files.filter((f) => isClient(f) || f.startsWith(join(root, "components")));
  for (const start of clients) {
    const seen = new Set([start]);
    const queue = [[start, [start]]];
    while (queue.length) {
      const [file, trail] = queue.shift();
      for (const next of imports(file)) {
        if (seen.has(next) || isServerAction(next)) continue; // a "use server" file is a safe boundary
        seen.add(next);
        assert.ok(!SERVER_ONLY.some((re) => re.test(next)), `server-only file reachable from the browser: ${trail.concat(next).map((x) => x.slice(root.length + 1)).join(" -> ")}`);
        queue.push([next, trail.concat(next)]);
      }
    }
  }
});
