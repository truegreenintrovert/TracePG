import { getAuthenticatedUser, json, touchUser } from "./_shared.js";

const categories = new Set(["General feedback", "Content quality", "Test experience", "Bug report", "Feature request", "Payment support"]);

function mapFeedback(row) {
  return {
    id: row.id,
    email: row.email || "",
    category: row.category,
    rating: row.rating === null ? null : Number(row.rating),
    message: row.message,
    contactRequested: Boolean(row.contact_requested),
    status: row.status,
    adminNote: row.admin_note || "",
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

export async function onRequestGet({ request, env }) {
  const auth = await getAuthenticatedUser(request, env);
  if (auth.error) return auth.error;
  const result = await env.DB.prepare(
    "SELECT id, email, category, rating, message, contact_requested, status, admin_note, created_at, updated_at FROM feedback WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
  ).bind(auth.user.id).all();
  return json({ feedback: result.results.map(mapFeedback) });
}

export async function onRequestPost({ request, env }) {
  const auth = await getAuthenticatedUser(request, env);
  if (auth.error) return auth.error;
  const body = await request.json().catch(() => null);
  const category = String(body?.category || "").trim();
  const message = String(body?.message || "").trim();
  const rating = body?.rating === "" || body?.rating === null || body?.rating === undefined ? null : Number(body.rating);
  if (!categories.has(category)) return json({ error: "Choose a valid feedback category." }, 400);
  if (message.length < 10 || message.length > 5000) return json({ error: "Feedback must be between 10 and 5,000 characters." }, 400);
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) return json({ error: "Rating must be between 1 and 5." }, 400);

  await touchUser(env, auth.user);
  const now = Date.now();
  const id = `fb_${now}_${crypto.randomUUID().replaceAll("-", "").slice(0, 8)}`;
  await env.DB.prepare(
    "INSERT INTO feedback (id, user_id, email, category, rating, message, contact_requested, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)",
  ).bind(id, auth.user.id, auth.user.email || null, category, rating, message, body?.contactRequested ? 1 : 0, now, now).run();
  return json({ ok: true, feedback: { id, category, rating, message, contactRequested: Boolean(body?.contactRequested), status: "new", createdAt: now } }, 201);
}
