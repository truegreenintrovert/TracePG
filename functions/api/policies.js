import { json } from "./_shared.js";

export async function onRequestGet({ request, env }) {
  const slug = new URL(request.url).searchParams.get("slug");
  const query = slug
    ? env.DB.prepare("SELECT slug, label, title, intro, sections, updated_at AS updatedAt FROM legal_pages WHERE slug = ?").bind(slug)
    : env.DB.prepare("SELECT slug, label, title, intro, sections, updated_at AS updatedAt FROM legal_pages ORDER BY slug");
  const result = slug ? { results: [await query.first()].filter(Boolean) } : await query.all();
  const policies = result.results.map((row) => ({
    ...row,
    sections: JSON.parse(row.sections),
    path: `/${row.slug}`,
  }));
  return json(slug ? { policy: policies[0] || null } : { policies });
}
