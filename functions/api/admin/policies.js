import { getAdminUser, json } from "../_shared.js";

export async function onRequestGet({ request, env }) {
  const auth = await getAdminUser(request, env);
  if (auth.error) return auth.error;
  const result = await env.DB.prepare(
    "SELECT slug, label, title, intro, sections, updated_at AS updatedAt FROM legal_pages ORDER BY slug",
  ).all();
  return json({
    policies: result.results.map((row) => ({ ...row, sections: JSON.parse(row.sections), path: `/${row.slug}` })),
  });
}

export async function onRequestPut({ request, env }) {
  const auth = await getAdminUser(request, env);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || !["privacy", "terms", "refund"].includes(body.slug)) {
    return json({ error: "A valid policy slug is required." }, 400);
  }
  if (!body.title?.trim() || !body.intro?.trim() || !Array.isArray(body.sections) || !body.sections.length) {
    return json({ error: "Title, introduction, and at least one section are required." }, 400);
  }
  if (body.sections.some((section) => !Array.isArray(section) || section.length !== 2 || !section[0]?.trim() || !section[1]?.trim())) {
    return json({ error: "Each policy section needs a heading and body." }, 400);
  }

  const now = Date.now();
  await env.DB.prepare(
    "UPDATE legal_pages SET title = ?, intro = ?, sections = ?, updated_at = ? WHERE slug = ?",
  ).bind(body.title.trim(), body.intro.trim(), JSON.stringify(body.sections), now, body.slug).run();
  return json({ ok: true, updatedAt: now });
}
