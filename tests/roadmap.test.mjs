import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { PHASES } from "../content/roadmap.ts";
import { CERTS, MARKET, PROJECTS, TOOLS } from "../content/roadmap-extra.ts";

const topics = PHASES.flatMap((p) => p.sections.flatMap((s) => s.topics));
const app = new URL("../app/", import.meta.url);
// A practice link must point at a page that exists, in the student workspace or at the top level.
const isPage = (href) => {
  const path = href.split(/[?#]/)[0];
  return existsSync(new URL(`(app)${path}`, app)) || existsSync(new URL(`.${path}`, app));
};
const https = /^https:\/\/[^\s]+$/;
const KINDS = ["Video", "Course", "Lab", "Docs", "Book", "Tool", "Podcast"];

test("every topic has a start-here link and only https resources", () => {
  for (const t of topics) {
    assert.ok(t.resources.length > 0, `${t.name}: no resource`);
    for (const r of t.resources) {
      assert.match(r.url, https, `${t.name}: bad link ${r.url}`);
      assert.ok(KINDS.includes(r.kind), `${t.name}: unknown kind ${r.kind}`);
      assert.ok(r.name && r.note, `${t.name}: resource needs a name and a note`);
    }
    assert.equal(new Set(t.resources.map((r) => r.url)).size, t.resources.length, `${t.name}: repeated link`);
    for (const b of t.books) if (b.url) assert.match(b.url, https, `${t.name}: bad book link`);
  }
});

test("every topic lists 4 different subtopics, practice tasks and self-check items", () => {
  for (const t of topics) {
    assert.equal(t.sub.length, 4, `${t.name}: ${t.sub.length} subtopics`);
    assert.equal(new Set(t.sub).size, t.sub.length, `${t.name}: repeated subtopic`);
    assert.ok(t.exercises.length >= 2, `${t.name}: too few practice tasks`);
    assert.ok(t.milestones.length >= 2, `${t.name}: too few self-check items`);
  }
});

test("every practice link opens a real ShiftLab page", () => {
  for (const t of topics) if (t.practice) assert.ok(isPage(t.practice.href), `${t.name}: no page at ${t.practice.href}`);
});

test("phase ids, topic names and slugs are unique, so anchors and keys never clash", () => {
  assert.equal(new Set(PHASES.map((p) => p.id)).size, PHASES.length);
  assert.equal(new Set(topics.map((t) => t.slug)).size, topics.length);
  assert.equal(new Set(topics.map((t) => t.name)).size, topics.length);
  for (const t of topics) assert.match(t.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${t.name}: bad slug`);
});

test("priorities are valid, every topic is in at least one track, and the engineer phase is engineer-only", () => {
  for (const p of PHASES)
    for (const s of p.sections)
      for (const t of s.topics) {
        assert.match(t.soc, /^[ERO-]$/, `${t.name}: soc`);
        assert.match(t.eng, /^[ERO-]$/, `${t.name}: eng`);
        assert.ok(t.soc !== "-" || t.eng !== "-", `${t.name}: in no track`);
        if (p.engineerOnly) assert.equal(t.soc, "-", `${t.name}: engineer phase topic shown to SOC`);
      }
});

test("the market, certificate, tool and project pages only link to https pages", () => {
  const urls = [
    ...MARKET.sources.map((s) => s.u),
    ...CERTS.free.map((c) => c.u),
    ...CERTS.learnFree.map((c) => c.u),
    ...CERTS.paid.map((c) => c.u),
    CERTS.notFree.u,
    ...TOOLS.flatMap((s) => s.tools.flatMap((t) => [t.lu, t.pu])),
    ...PROJECTS.map((p) => p.u),
  ];
  for (const u of urls) assert.match(u, https, `bad link ${u}`);
});

test("tools and projects are complete and in a sensible order", () => {
  assert.deepEqual(TOOLS.map((s) => s.stage), ["1", "2", "3", "4", "5"]);
  for (const s of TOOLS) for (const t of s.tools) assert.ok(t.why && t.ln && t.pn && t.time && "SEB".includes(t.who), `${t.n}: incomplete`);
  const order = ["Starter", "Core", "Stretch"];
  const lv = PROJECTS.map((p) => order.indexOf(p.lvl));
  assert.ok(lv.every((x) => x >= 0), "unknown project level");
  assert.deepEqual([...lv].sort(), lv, "projects must be listed Starter, then Core, then Stretch");
  for (const p of PROJECTS) assert.ok(p.build && p.tools && p.ship && p.hrs, `${p.n}: incomplete`);
});

test("ISC2 CC is not listed as free", () => {
  assert.ok(!CERTS.free.some((c) => /isc2/i.test(c.by + c.n)), "ISC2 CC's free offer has ended");
});
