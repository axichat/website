import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

function mockDatabase(seed = {}) {
  const votes = new Map(Object.entries(seed));
  return {
    votes,
    prepare(sql) {
      if (sql.startsWith("SELECT")) {
        return {
          async all() {
            return {
              results: Array.from(votes, ([source, count]) => ({ source, votes: count })),
            };
          },
        };
      }
      if (sql.startsWith("UPDATE")) {
        return {
          bind(source) {
            return {
              async run() {
                if (!votes.has(source)) {
                  return { meta: { changes: 0 } };
                }
                votes.set(source, (votes.get(source) ?? 0) + 1);
                return { meta: { changes: 1 } };
              },
            };
          },
        };
      }
      throw new Error(`unexpected SQL: ${sql}`);
    },
  };
}

function testEnvironment(seed) {
  return {
    ALLOWED_ORIGINS: "https://axi.chat",
    DB: mockDatabase(seed),
  };
}

test("public standings contain only coarse relative ratios", async () => {
  const env = testEnvironment({ app_store: 12, play_store: 5, other: 1 });
  const response = await worker.fetch(new Request("https://poll.example/"), env);
  const text = await response.text();
  const payload = JSON.parse(text);

  assert.equal(response.status, 200);
  assert.deepEqual(Object.keys(payload), ["results"]);
  assert.equal(text.includes("votes"), false);
  assert.equal(text.includes("total"), false);
  assert.equal(payload.results.find(({ source }) => source === "app_store").ratio, 100);
  assert.equal(payload.results.find(({ source }) => source === "play_store").ratio, 40);
});

test("an allowed anonymous response updates only its aggregate bucket", async () => {
  const env = testEnvironment({
    app_store: 0,
    play_store: 0,
    fdroid: 0,
    friends_family: 0,
    web_search: 0,
    social_media: 0,
    other: 0,
  });
  const request = new Request("https://poll.example/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://axi.chat",
    },
    body: JSON.stringify({ source: "friends_family" }),
  });
  const response = await worker.fetch(request, env);
  const text = await response.text();

  assert.equal(response.status, 200);
  assert.equal(env.DB.votes.get("friends_family"), 1);
  assert.equal(text.includes("votes"), false);
  assert.equal(text.includes("total"), false);
});

test("responses from other browser origins are rejected", async () => {
  const env = testEnvironment({ web_search: 0 });
  const request = new Request("https://poll.example/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://unrelated.example",
    },
    body: JSON.stringify({ source: "web_search" }),
  });
  const response = await worker.fetch(request, env);

  assert.equal(response.status, 403);
  assert.equal(env.DB.votes.get("web_search"), 0);
});

test("oversized responses are rejected when Content-Length is omitted", async () => {
  const env = testEnvironment({ web_search: 0 });
  const request = new Request("https://poll.example/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://axi.chat",
    },
    body: JSON.stringify({ source: "web_search", padding: "x".repeat(2048) }),
  });

  assert.equal(request.headers.get("Content-Length"), null);
  const response = await worker.fetch(request, env);

  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), { error: "request_too_large" });
  assert.equal(env.DB.votes.get("web_search"), 0);
});

test("oversized responses are rejected when Content-Length understates the body", async () => {
  const env = testEnvironment({ other: 0 });
  const request = new Request("https://poll.example/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": "16",
      Origin: "https://axi.chat",
    },
    body: JSON.stringify({ source: "other", padding: "x".repeat(2048) }),
  });
  const response = await worker.fetch(request, env);

  assert.equal(response.status, 413);
  assert.equal(env.DB.votes.get("other"), 0);
});
