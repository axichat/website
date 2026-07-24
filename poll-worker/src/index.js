export const discoverySources = [
  "app_store",
  "play_store",
  "fdroid",
  "friends_family",
  "web_search",
  "social_media",
  "other",
];

export function coarseRatios(rows) {
  const votesBySource = new Map(discoverySources.map((source) => [source, 0]));
  for (const row of Array.isArray(rows) ? rows : []) {
    if (!votesBySource.has(row?.source)) {
      continue;
    }
    const votes = Number(row.votes);
    if (Number.isFinite(votes) && votes >= 0) {
      votesBySource.set(row.source, votes);
    }
  }

  const maximum = Math.max(...votesBySource.values());
  return discoverySources.map((source) => {
    const votes = votesBySource.get(source) ?? 0;
    if (maximum === 0 || votes === 0) {
      return { source, ratio: 0 };
    }
    const ratio = Math.round((votes / maximum) * 10) * 10;
    return { source, ratio: Math.max(10, Math.min(100, ratio)) };
  });
}

const discoverySourceSet = new Set(discoverySources);
const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

function allowedOrigins(env) {
  return new Set(
    String(env.ALLOWED_ORIGINS ?? "https://axi.chat")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  );
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") ?? "";
  if (!allowedOrigins(env).has(origin)) {
    return { Vary: "Origin" };
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonResponse(request, env, payload, status = 200, cacheControl = "no-store") {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...jsonHeaders,
      ...corsHeaders(request, env),
      "Cache-Control": cacheControl,
    },
  });
}

async function currentRatios(env) {
  const query = await env.DB.prepare("SELECT source, votes FROM discovery_poll_counts").all();
  return { results: coarseRatios(query.results) };
}

async function handlePost(request, env) {
  const origin = request.headers.get("Origin") ?? "";
  if (!allowedOrigins(env).has(origin)) {
    return jsonResponse(request, env, { error: "origin_not_allowed" }, 403);
  }
  const contentLength = Number(request.headers.get("Content-Length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 2048) {
    return jsonResponse(request, env, { error: "request_too_large" }, 413);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(request, env, { error: "bad_json" }, 400);
  }
  const source = typeof payload?.source === "string" ? payload.source.trim() : "";
  if (!discoverySourceSet.has(source)) {
    return jsonResponse(request, env, { error: "invalid_source" }, 400);
  }

  const update = await env.DB.prepare(
    "UPDATE discovery_poll_counts SET votes = votes + 1 WHERE source = ?"
  )
    .bind(source)
    .run();
  if (update.meta?.changes !== 1) {
    return jsonResponse(request, env, { error: "poll_unavailable" }, 503);
  }
  return jsonResponse(request, env, await currentRatios(env));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/" && url.pathname !== "/poll") {
      return jsonResponse(request, env, { error: "not_found" }, 404);
    }
    if (request.method === "OPTIONS") {
      const origin = request.headers.get("Origin") ?? "";
      return new Response(null, {
        status: allowedOrigins(env).has(origin) ? 204 : 403,
        headers: corsHeaders(request, env),
      });
    }
    if (request.method === "GET") {
      return jsonResponse(request, env, await currentRatios(env), 200, "public, max-age=60");
    }
    if (request.method === "POST") {
      return handlePost(request, env);
    }
    return jsonResponse(request, env, { error: "method_not_allowed" }, 405);
  },
};
