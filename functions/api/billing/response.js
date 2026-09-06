import { processPayUResult, readPayUFields, resultRedirect } from "./_payu.js";

export async function onRequestPost({ request, env }) {
  if (!env.PAYU_KEY || !env.PAYU_SALT) return resultRedirect(request, env, "error", "Payment setup is incomplete.");
  const fields = await readPayUFields(request);
  const result = await processPayUResult(fields, env);
  if (!result.ok) return resultRedirect(request, env, "error", result.error);
  return resultRedirect(request, env, result.success ? "success" : "failed");
}
