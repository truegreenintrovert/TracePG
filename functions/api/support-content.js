import { json } from "./_shared.js";

function parsePage(row) {
  if (!row) return null;
  return {
    slug: row.slug,
    label: row.label,
    title: row.title,
    intro: row.intro,
    contactEmail: row.contact_email || "",
    contactPhone: row.contact_phone || "",
    supportHours: row.support_hours || "",
    supportCtaLabel: row.support_cta_label || "",
    supportCtaUrl: row.support_cta_url || "",
    sections: JSON.parse(row.sections || "[]"),
    faqs: JSON.parse(row.faqs || "[]"),
    updatedAt: row.updated_at,
  };
}

export async function onRequestGet({ request, env }) {
  const slug = new URL(request.url).searchParams.get("slug");
  const query = slug
    ? env.DB.prepare("SELECT * FROM support_pages WHERE slug = ?").bind(slug)
    : env.DB.prepare("SELECT * FROM support_pages ORDER BY slug");
  const result = slug ? { results: [await query.first()].filter(Boolean) } : await query.all();
  const pages = result.results.map(parsePage);
  return json(slug ? { page: pages[0] || null } : { pages });
}
