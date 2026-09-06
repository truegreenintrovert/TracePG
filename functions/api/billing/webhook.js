import { json, processPayUResult, readPayUFields } from "./_payu.js";

export async function onRequestPost({ request, env }) {
  if (!env.PAYU_KEY || !env.PAYU_SALT) return json({ error: "PayU is not configured." }, 503);
  const fields = await readPayUFields(request);
  const result = await processPayUResult(fields, env);
  if (!result.ok) return json({ error: result.error }, 400);
  return json({ ok: true, success: result.success });
}
