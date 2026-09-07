import { getAdminUser, json } from "../_shared.js";

function cleanCode(value) {
  return String(value || "").trim().toUpperCase();
}

function parseCode(body) {
  const code = cleanCode(body?.code);
  const discountType = body?.discountType === "fixed" ? "fixed" : "percent";
  const discountValue = Number(body?.discountValue);
  const maxUses = body?.maxUses === "" || body?.maxUses === null || body?.maxUses === undefined ? null : Number(body.maxUses);
  const expiresAt = body?.expiresAt === "" || body?.expiresAt === null || body?.expiresAt === undefined ? null : Number(body.expiresAt);

  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return { error: "Code must be 3–32 characters using letters, numbers, hyphens, or underscores." };
  if (!Number.isFinite(discountValue) || discountValue <= 0 || (discountType === "percent" && discountValue > 99)) return { error: discountType === "percent" ? "Percentage must be greater than 0 and at most 99." : "Fixed discount must be greater than 0." };
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) return { error: "Maximum uses must be a whole number greater than 0." };
  if (expiresAt !== null && (!Number.isFinite(expiresAt) || expiresAt <= Date.now())) return { error: "Expiry must be a future date." };

  return { value: { code, discountType, discountValue, maxUses, expiresAt, active: body?.active === false ? 0 : 1 } };
}

function mapCode(row) {
  return {
    code: row.code,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    active: Boolean(row.active),
    maxUses: row.max_uses === null ? "" : Number(row.max_uses),
    usedCount: Number(row.used_count || 0),
    expiresAt: row.expires_at ? Number(row.expires_at) : null,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

export async function onRequestGet({ request, env }) {
  const auth = await getAdminUser(request, env);
  if (auth.error) return auth.error;
  const result = await env.DB.prepare("SELECT * FROM discount_codes ORDER BY created_at DESC").all();
  return json({ codes: result.results.map(mapCode) });
}

export async function onRequestPost({ request, env }) {
  const auth = await getAdminUser(request, env);
  if (auth.error) return auth.error;
  const parsed = parseCode(await request.json().catch(() => null));
  if (parsed.error) return json({ error: parsed.error }, 400);
  const { code, discountType, discountValue, maxUses, expiresAt, active } = parsed.value;
  const now = Date.now();
  try {
    await env.DB.prepare(
      "INSERT INTO discount_codes (code, discount_type, discount_value, active, max_uses, used_count, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)",
    ).bind(code, discountType, discountValue, active, maxUses, expiresAt, now, now).run();
  } catch (error) {
    if (String(error.message || "").toLowerCase().includes("unique")) return json({ error: "That discount code already exists." }, 409);
    throw error;
  }
  return json({ ok: true });
}

export async function onRequestPut({ request, env }) {
  const auth = await getAdminUser(request, env);
  if (auth.error) return auth.error;
  const parsed = parseCode(await request.json().catch(() => null));
  if (parsed.error) return json({ error: parsed.error }, 400);
  const { code, discountType, discountValue, maxUses, expiresAt, active } = parsed.value;
  const now = Date.now();
  const result = await env.DB.prepare(
    "UPDATE discount_codes SET discount_type = ?, discount_value = ?, active = ?, max_uses = ?, expires_at = ?, updated_at = ? WHERE code = ?",
  ).bind(discountType, discountValue, active, maxUses, expiresAt, now, code).run();
  if (Number(result.meta?.changes || 0) !== 1) return json({ error: "Discount code not found." }, 404);
  return json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const auth = await getAdminUser(request, env);
  if (auth.error) return auth.error;
  const code = cleanCode(new URL(request.url).searchParams.get("code"));
  if (!code) return json({ error: "A discount code is required." }, 400);
  const result = await env.DB.prepare("DELETE FROM discount_codes WHERE code = ?").bind(code).run();
  if (Number(result.meta?.changes || 0) !== 1) return json({ error: "Discount code not found." }, 404);
  return json({ ok: true });
}
