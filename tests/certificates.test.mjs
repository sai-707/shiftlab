import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ALERTS } from "../content/alerts.ts";
import { ATTACK } from "../content/attack.ts";
import { CERT_ID, KINDS, KIND_META, MIN_AVG, asCert, cleanHolder, statement } from "../lib/certificateRules.ts";
import { qrModules } from "../lib/qr.ts";

// The database decides who earns a certificate by looking at its own list of alerts (alert_catalog in 0014_certificates.sql).
// That list has to be kept in step with content/alerts.ts by hand, so these tests fail loudly when they drift apart.
const sql = readFileSync(new URL("../supabase/migrations/0014_certificates.sql", import.meta.url), "utf8");
const rows = [...sql.matchAll(/\('(SL-\d{4})', '([^']+)'\)/g)].map((m) => ({ id: m[1], level: m[2] }));

test("the database's alert list matches the alerts on the site", () => {
  const catalog = new Map(rows.map((r) => [r.id, r.level]));
  assert.equal(catalog.size, rows.length, "an alert is listed twice in alert_catalog");
  for (const a of ALERTS) assert.equal(catalog.get(a.id), a.difficulty, `${a.id}: alert_catalog is missing it or has the wrong level (add it in a new migration)`);
  for (const id of catalog.keys()) assert.ok(ALERTS.some((a) => a.id === id), `alert_catalog lists ${id}, which no longer exists`);
});

test("the pass mark in the browser and in the database are the same", () => {
  assert.equal(MIN_AVG, 70);
  assert.ok(sql.includes("v_avg < 70"), "the database function no longer checks an average of 70");
});

test("every alert has MITRE ATT&CK tags and every tag is a valid technique id", () => {
  for (const a of ALERTS) assert.ok(a.id in ATTACK, `${a.id}: no ATT&CK entry (an empty list is fine for "no match")`);
  for (const [id, list] of Object.entries(ATTACK)) {
    assert.ok(ALERTS.some((a) => a.id === id), `ATT&CK entry for unknown alert ${id}`);
    for (const t of list) assert.match(t.id, /^T\d{4}(\.\d{3})?$/, `${id}: bad technique id ${t.id}`);
  }
});

test("names are tidied and bad ones refused", () => {
  assert.equal(cleanHolder("  Asha   Rao "), "Asha Rao");
  assert.equal(cleanHolder("A"), null);
  assert.equal(cleanHolder("<script>"), null);
  assert.equal(cleanHolder("x".repeat(61)), null);
});

test("certificate ids, kinds and the shape check on what the database returns", () => {
  assert.equal(KINDS.length, 5);
  for (const k of KINDS) assert.ok(KIND_META[k]);
  assert.ok(CERT_ID.test("SL-BGN-0123456789"));
  assert.ok(!CERT_ID.test("SL-XXX-0123456789"));
  const row = { id: "SL-HRD-ABCDEF0123", kind: "Hard", holder: "A B", alerts: 14, avg: 80, firstAvg: 70, levels: null, issuedAt: "2026-12-05T10:00:00Z" };
  assert.equal(asCert(row)?.avg, 80);
  assert.equal(asCert({ ...row, id: "nope" }), null);
  assert.equal(asCert({ ...row, kind: "Gold" }), null);
  assert.equal(asCert(null), null);
});

test("the statement carries the real numbers", () => {
  const text = statement({ kind: "Beginner", alerts: 11, avg: 86 }).map((w) => w.t).join("");
  assert.ok(text.includes("all 11 alerts") && text.includes("86 out of 100"));
});

test("the QR code grows with the text and stays square", () => {
  const a = qrModules("https://x.test/verify/SL-BGN-0123456789");
  assert.equal(a.length, a[0].length);
  assert.ok(qrModules("x".repeat(100)).length > a.length);
});
