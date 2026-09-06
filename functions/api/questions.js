import { getAuthenticatedUser, hasTraceAccess, json } from "./_shared.js";

const DATASETS = {
  questions: {
    table: "questions",
    order: "id",
  },
  pyqs: {
    table: "pyq_questions",
    order: "id",
  },
};

export async function onRequestGet({ request, env }) {
  const auth = await getAuthenticatedUser(request, env);
  if (auth.error) return auth.error;
  if (!(await hasTraceAccess(env, auth.user))) {
    return json({ error: "A TracePG purchase is required to access the question bank." }, 402);
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "questions";
  const dataset = DATASETS[type];

  if (!dataset) {
    return Response.json({ error: "Unknown question dataset." }, { status: 400 });
  }

  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 12000), 1), 12000);
  const offset = Math.max(Number(url.searchParams.get("offset") || 0), 0);
  const cache = caches.default;
  const cacheKey = new Request(url.toString(), request);

  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  const result = await env.DB.prepare(
    `SELECT data FROM ${dataset.table} ORDER BY ${dataset.order} LIMIT ? OFFSET ?`,
  )
    .bind(limit, offset)
    .all();

  const response = Response.json(
    {
      type,
      offset,
      count: result.results.length,
      items: result.results.map((row) => JSON.parse(row.data)),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=86400",
      },
    },
  );

  if (cache) await cache.put(cacheKey, response.clone());
  return response;
}
