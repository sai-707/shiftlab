import test from "node:test";
import assert from "node:assert/strict";
import { cleanRef } from "../lib/ref.ts";
import { listHref, parsePage, parseQuery, took, UUID } from "../lib/adminStudents.ts";

test("ref labels: lower-cased, plain characters only, up to 40", () => {
  assert.equal(cleanRef("linkedin-post2"), "linkedin-post2");
  assert.equal(cleanRef("  LinkedIn_Carousel "), "linkedin_carousel");
  assert.equal(cleanRef("a".repeat(40)), "a".repeat(40));
});

test("a bad ref is dropped, not trusted", () => {
  for (const bad of ["", "a".repeat(41), "x y", "<script>", "a/b", "é", null, undefined, 5, {}, ["x"]]) assert.equal(cleanRef(bad), null, String(bad));
});

test("page numbers: whole numbers from 1, anything else is page 1", () => {
  assert.equal(parsePage("3"), 3);
  for (const bad of [undefined, "", "0", "-2", "1.5", "abc", "99999999"]) assert.equal(parsePage(bad), 1, String(bad));
  assert.equal(parsePage(["4", "9"]), 4);
});

test("search text is trimmed and cut to 60 characters", () => {
  assert.equal(parseQuery("  ravi "), "ravi");
  assert.equal(parseQuery(undefined), "");
  assert.equal(parseQuery("x".repeat(100)).length, 60);
});

test("list links keep the search and leave out page 1", () => {
  assert.equal(listHref(1, ""), "/admin/students");
  assert.equal(listHref(2, ""), "/admin/students?page=2");
  assert.equal(listHref(1, "ravi"), "/admin/students?q=ravi");
  assert.equal(listHref(3, "a b&c"), "/admin/students?q=a+b%26c&page=3");
});

test("time taken reads naturally and survives an open case", () => {
  const t = "2026-11-10T10:00:00Z";
  assert.equal(took(t, null), "—");
  assert.equal(took(t, "2026-11-10T10:00:20Z"), "under 1 min");
  assert.equal(took(t, "2026-11-10T10:12:00Z"), "12 min");
  assert.equal(took(t, "2026-11-10T11:20:00Z"), "1 h 20 min");
  assert.equal(took(t, "2026-11-12T10:00:00Z"), "2 d");
  assert.equal(took(t, "2026-11-10T09:00:00Z"), "under 1 min"); // a clock that ran backwards never shows a negative
});

test("only a real uuid is allowed through to the database", () => {
  assert.ok(UUID.test("3fc6b9c1-52d5-4869-8a1b-9d0e8f7a6b5c"));
  for (const bad of ["", "1", "../../etc", "3fc6b9c1-52d5-4869-8a1b-9d0e8f7a6b5", "' or 1=1 --"]) assert.ok(!UUID.test(bad), bad);
});
