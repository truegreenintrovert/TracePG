import { getAdminUser, json } from "../_shared.js";

const allowedSlugs = new Set(["product", "about", "contact", "help", "qa"]);

function validText(value, max = 5000) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

function validatePage(body) {
  if (!body || !allowedSlugs.has(body.slug)) return "A valid public page is required.";
  if (!validText(body.label, 120) || !validText(body.title, 200) || !validText(body.intro, 5000)) return "Label, title, and introduction are required.";
  if (!Array.isArray(body.sections) || body.sections.some((section) => !Array.isArray(section) || section.length !== 2 || !validText(section[0], 200) || !validText(section[1], 5000))) return "Each guidance section needs a heading and body.";
  if (!Array.isArray(body.faqs) || body.faqs.some((faq) => !faq || !validText(faq.question, 500) || !validText(faq.answer, 5000))) return "Each Q&A entry needs a question and answer.";
  return null;
}

function cleanPage(body) {
  return {
    slug: body.slug,
    label: body.label.trim(),
    title: body.title.trim(),
    intro: body.intro.trim(),
    contactEmail: String(body.contactEmail || "").trim().slice(0, 320),
    contactPhone: String(body.contactPhone || "").trim().slice(0, 80),
    supportHours: String(body.supportHours || "").trim().slice(0, 300),
    supportCtaLabel: String(body.supportCtaLabel || "").trim().slice(0, 120),
    supportCtaUrl: String(body.supportCtaUrl || "").trim().slice(0, 1000),
    sections: body.sections.map(([heading, content]) => [heading.trim(), content.trim()]),
    faqs: body.faqs.map((faq) => ({
      category: String(faq.category || "General").trim().slice(0, 120),
      question: faq.question.trim(),
      answer: faq.answer.trim(),
    })),
  };
}

function responsePage(row) {
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
  const auth = await getAdminUser(request, env);
  if (auth.error) return auth.error;
  const result = await env.DB.prepare("SELECT * FROM support_pages ORDER BY slug").all();
  return json({ pages: result.results.map(responsePage) });
}

export async function onRequestPut({ request, env }) {
  const auth = await getAdminUser(request, env);
  if (auth.error) return auth.error;
  const body = await request.json().catch(() => null);
  const validationError = validatePage(body);
  if (validationError) return json({ error: validationError }, 400);
  const page = cleanPage(body);
  const now = Date.now();
  await env.DB.prepare(`
    INSERT INTO support_pages (slug, label, title, intro, contact_email, contact_phone, support_hours, support_cta_label, support_cta_url, sections, faqs, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      label = excluded.label,
      title = excluded.title,
      intro = excluded.intro,
      contact_email = excluded.contact_email,
      contact_phone = excluded.contact_phone,
      support_hours = excluded.support_hours,
      support_cta_label = excluded.support_cta_label,
      support_cta_url = excluded.support_cta_url,
      sections = excluded.sections,
      faqs = excluded.faqs,
      updated_at = excluded.updated_at
  `).bind(
    page.slug,
    page.label,
    page.title,
    page.intro,
    page.contactEmail,
    page.contactPhone,
    page.supportHours,
    page.supportCtaLabel,
    page.supportCtaUrl,
    JSON.stringify(page.sections),
    JSON.stringify(page.faqs),
    now,
  ).run();
  return json({ ok: true, updatedAt: now });
}
