import { json } from "../_shared.js";

export async function sha512(value) {
  const digest = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function readPayUFields(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return await request.json().catch(() => ({}));
  return Object.fromEntries(new URLSearchParams(await request.text()));
}

export async function verifyPayUResponse(fields, salt) {
  if (!fields?.hash || !fields.status || !fields.txnid) return false;
  const reverseHashString = `${salt}|${fields.status}||||||${fields.udf5 || ""}|${fields.udf4 || ""}|${fields.udf3 || ""}|${fields.udf2 || ""}|${fields.udf1 || ""}|${fields.email || ""}|${fields.firstname || ""}|${fields.productinfo || ""}|${fields.amount || ""}|${fields.txnid || ""}|${fields.key || ""}`;
  const expected = await sha512(reverseHashString);
  return expected === String(fields.hash).toLowerCase();
}

export async function processPayUResult(fields, env) {
  if (!(await verifyPayUResponse(fields, env.PAYU_SALT))) return { ok: false, error: "PayU response verification failed." };
  if (fields.key !== env.PAYU_KEY) return { ok: false, error: "PayU merchant key does not match." };

  const order = await env.DB.prepare("SELECT * FROM payment_orders WHERE id = ?").bind(fields.txnid).first();
  if (!order || Number(fields.amount) !== Number(order.amount)) return { ok: false, error: "PayU transaction details do not match the order." };
  if (order.status === "verified") return { ok: true, success: true, userId: order.user_id };

  const success = String(fields.status).toLowerCase() === "success";
  const now = Date.now();

  if (!success) {
    await env.DB.prepare(
      "UPDATE payment_orders SET status = 'failed', payment_id = ?, updated_at = ? WHERE id = ? AND status = 'created'",
    ).bind(fields.mihpayid || null, now, fields.txnid).run();
    const current = await env.DB.prepare("SELECT status FROM payment_orders WHERE id = ?").bind(fields.txnid).first();
    return { ok: true, success: current?.status === "verified", userId: order.user_id };
  }

  // Claim the order first so a return callback and webhook cannot both grant access.
  // A stale settling claim can be retried after a short failure window.
  const staleSettlingBefore = now - 5 * 60 * 1000;
  const claim = await env.DB.prepare(
    "UPDATE payment_orders SET status = 'settling', payment_id = ?, updated_at = ? WHERE id = ? AND (status IN ('created', 'failed') OR (status = 'settling' AND updated_at < ?))",
  ).bind(fields.mihpayid || fields.txnid, now, fields.txnid, staleSettlingBefore).run();

  if (Number(claim.meta?.changes || 0) !== 1) {
    const current = await env.DB.prepare("SELECT status FROM payment_orders WHERE id = ?").bind(fields.txnid).first();
    return { ok: true, success: current?.status === "verified", processing: current?.status === "settling", userId: order.user_id };
  }

  try {
    const statements = [
      env.DB.prepare("INSERT INTO entitlements (user_id, status, provider, provider_order_id, provider_payment_id, amount, currency, created_at, updated_at) VALUES (?, 'active', 'payu', ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET status = 'active', provider = excluded.provider, provider_order_id = excluded.provider_order_id, provider_payment_id = excluded.provider_payment_id, amount = excluded.amount, currency = excluded.currency, updated_at = excluded.updated_at").bind(order.user_id, fields.txnid, fields.mihpayid || fields.txnid, order.amount, order.currency, now, now),
    ];
    if (order.discount_code) {
      statements.push(env.DB.prepare("UPDATE discount_codes SET used_count = used_count + 1, updated_at = ? WHERE code = ?").bind(now, order.discount_code));
    }
    statements.push(
      env.DB.prepare("UPDATE payment_orders SET status = 'verified', updated_at = ? WHERE id = ? AND status = 'settling'").bind(now, fields.txnid),
    );
    await env.DB.batch(statements);
    return { ok: true, success: true, userId: order.user_id };
  } catch (error) {
    await env.DB.prepare(
      "UPDATE payment_orders SET status = 'created', updated_at = ? WHERE id = ? AND status = 'settling'",
    ).bind(Date.now(), fields.txnid).run().catch(() => {});
    throw error;
  }
}

export function resultRedirect(request, env, status, message = "") {
  const baseUrl = (env.APP_URL || new URL(request.url).origin).replace(/\/$/, "");
  const query = new URLSearchParams({ payment: status });
  if (message) query.set("message", message);
  return Response.redirect(`${baseUrl}/?${query.toString()}`, 303);
}

export { json };
