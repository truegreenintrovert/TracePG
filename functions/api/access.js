import { getAuthenticatedUser, hasTraceAccess, isAdminUser, json } from "./_shared.js";

export async function onRequestGet({ request, env }) {
  const auth = await getAuthenticatedUser(request, env);
  if (auth.error) return auth.error;
  const isAdmin = isAdminUser(auth.user, env);
  const hasAccess = isAdmin || await hasTraceAccess(env, auth.user);
  const priceInr = Math.max(1, Number(env.TRACEPG_PRICE_INR || 1000));
  const trial = await env.DB.prepare("SELECT used_count AS usedCount FROM trial_usage WHERE user_id = ?").bind(auth.user.id).first();
  const usedCount = Math.min(2, Number(trial?.usedCount || 0));
  return json({ hasAccess, isAdmin, priceInr, currency: "INR", product: "TracePG lifetime access", trialUsed: usedCount, trialRemaining: Math.max(0, 2 - usedCount), trialSize: 20 });
}
