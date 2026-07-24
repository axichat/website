import test from "node:test";
import assert from "node:assert/strict";
import { coarseRatios, discoverySources } from "../src/index.js";

test("returns every source without exposing vote counts", () => {
  const results = coarseRatios([
    { source: "app_store", votes: 40 },
    { source: "play_store", votes: 21 },
    { source: "fdroid", votes: 1 },
  ]);

  assert.deepEqual(
    results,
    discoverySources.map((source) => {
      const ratios = { app_store: 100, play_store: 50, fdroid: 10 };
      return { source, ratio: ratios[source] ?? 0 };
    })
  );
  assert.equal(JSON.stringify(results).includes("votes"), false);
});

test("returns empty bars before the first response", () => {
  assert.deepEqual(
    coarseRatios([]),
    discoverySources.map((source) => ({ source, ratio: 0 }))
  );
});

test("ignores unknown and malformed rows", () => {
  const results = coarseRatios([
    { source: "not_an_option", votes: 999 },
    { source: "other", votes: -2 },
    { source: "web_search", votes: "5" },
  ]);

  assert.equal(results.find(({ source }) => source === "web_search")?.ratio, 100);
  assert.equal(results.find(({ source }) => source === "other")?.ratio, 0);
});
