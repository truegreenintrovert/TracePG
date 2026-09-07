import { getAdminUser, json } from "../_shared.js";

function mapFeedback(row) {
  return {
    id: row.id,
    userId: row.user_id,
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
  const auth = await getAdminUser(request, env);
  if (auth.error) return auth.error;
  const result = await env.DB.prepare("SELECT * FROM feedback ORDER BY created_at DESC LIMIT 200").all();
  return json({ feedback: result.results.map(mapFeedback) });
}

export async function onRequestPut({ request, env }) {
  const auth = await getAdminUser(request, env);
  if (auth.error) return auth.error;
  const body = await request.json().catch(() => null);
  if (!body?.id || !["new", "reviewed", "resolved"].includes(body.status)) return json({ error: "A valid feedback ID and status are required." }, 400);
  const adminNote = String(body.adminNote || "").trim().slice(0, 2000);
  const now = Date.now();
  const result = await env.DB.prepare("UPDATE feedback SET status = ?, admin_note = ?, updated_at = ? WHERE id = ?").bind(body.status, adminNote, now, body.id).run();
  if (Number(result.meta?.changes || 0) !== 1) return json({ error: "Feedback entry not found." }, 404);
  return json({ ok: true, updatedAt: now });
}
