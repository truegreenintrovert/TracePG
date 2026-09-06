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
  const statements = [
    env.DB.prepare("UPDATE payment_orders SET status = ?, payment_id = ?, updated_at = ? WHERE id = ?").bind(success ? "verified" : "failed", fields.mihpayid || null, now, fields.txnid),
  ];
  if (success) {
    statements.push(env.DB.prepare("INSERT INTO entitlements (user_id, status, provider, provider_order_id, provider_payment_id, amount, currency, created_at, updated_at) VALUES (?, 'active', 'payu', ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET status = 'active', provider = excluded.provider, provider_order_id = excluded.provider_order_id, provider_payment_id = excluded.provider_payment_id, amount = excluded.amount, currency = excluded.currency, updated_at = excluded.updated_at").bind(order.user_id, fields.txnid, fields.mihpayid || fields.txnid, order.amount, order.currency, now, now));
  }
  await env.DB.batch(statements);
  return { ok: true, success, userId: order.user_id };
}

export function resultRedirect(request, env, status, message = "") {
  const baseUrl = (env.APP_URL || new URL(request.url).origin).replace(/\/$/, "");
  const query = new URLSearchParams({ payment: status });
  if (message) query.set("message", message);
  return Response.redirect(`${baseUrl}/?${query.toString()}`, 303);
}

export { json };
