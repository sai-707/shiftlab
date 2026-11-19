import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { check, classify, collectUrls, report } from "../scripts/check-links.mjs";
import { PHASES } from "../content/roadmap.ts";
import { CERTS, MARKET, PROJECTS, TOOLS } from "../content/roadmap-extra.ts";

test("the checker finds every roadmap link, each once, all https", () => {
  const urls = collectUrls(PHASES, MARKET, CERTS, TOOLS, PROJECTS);
  assert.ok(urls.length > 150, `only ${urls.length} links found`);
  assert.equal(new Set(urls).size, urls.length);
  for (const u of urls) assert.match(u, /^https:\/\/\S+$/);
  assert.ok(urls.includes(CERTS.notFree.u), "the certificate page links are missed");
});

test("status codes sort into fine, refused and broken", () => {
  assert.deepEqual([200, 301, 404, 410, 500, 403, 429].map(classify), ["ok", "ok", "broken", "broken", "broken", "blocked", "blocked"]);
});

test("a real request: 200 is fine, 404 is broken, HEAD refused falls back to GET, a dead server is broken", async () => {
  const server = createServer((req, res) => {
    if (req.url === "/ok") res.writeHead(200).end("hi");
    else if (req.url === "/nohead") res.writeHead(req.method === "HEAD" ? 405 : 200).end("hi");
    else if (req.url === "/moved") res.writeHead(302, { location: "/ok" }).end();
    else res.writeHead(404).end("no");
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await check(`${base}/ok`)).kind, "ok");
    assert.equal((await check(`${base}/nohead`)).kind, "ok");
    assert.equal((await check(`${base}/moved`)).kind, "ok");
    assert.equal((await check(`${base}/gone`)).kind, "broken");
  } finally {
    server.close();
  }
  assert.equal((await check(`${base}/ok`, { timeoutMs: 500 })).kind, "broken");
});

test("the report lists broken links and says when none are", () => {
  assert.match(report([{ url: "https://a.test/x", status: 404, kind: "broken" }], "2026-12-01"), /\| https:\/\/a\.test\/x \| 404 \|/);
  assert.match(report([{ url: "https://a.test/x", status: 200, kind: "ok" }], "2026-12-01"), /## Broken\n\nNone\./);
});
