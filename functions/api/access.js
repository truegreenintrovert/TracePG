import { getAuthenticatedUser, hasTraceAccess, isAdminUser, json } from "./_shared.js";

export async function onRequestGet({ request, env }) {
  const auth = await getAuthenticatedUser(request, env);
  if (auth.error) return auth.error;
  const isAdmin = isAdminUser(auth.user, env);
  const entitlement = await env.DB.prepare(
    "SELECT user_id FROM entitlements WHERE user_id = ? AND status = 'active'",
  ).bind(auth.user.id).first();
  const trial = await env.DB.prepare(
    "SELECT used_count AS usedCount, trial_started_at AS trialStartedAt, trial_expires_at AS trialExpiresAt FROM trial_usage WHERE user_id = ?",
  ).bind(auth.user.id).first();
  const trialStartedAt = Number(trial?.trialStartedAt || 0) || null;
  const trialExpiresAt = Number(trial?.trialExpiresAt || 0) || null;
  const trialActive = !isAdmin && !entitlement && Boolean(trialExpiresAt && trialExpiresAt > Date.now());
  const hasAccess = isAdmin || Boolean(entitlement) || trialActive;
  const priceInr = Math.max(1, Number(env.TRACEPG_PRICE_INR || 1000));
  const trialDaysRemaining = trialActive
    ? Math.max(1, Math.ceil((trialExpiresAt - Date.now()) / 86400000))
    : 0;
  return json({
    hasAccess,
    isAdmin,
    priceInr,
    currency: "INR",
    product: "TracePG lifetime access",
    trialUsed: Number(trial?.usedCount || 0),
    trialAvailable: !trialStartedAt,
    trialActive,
    trialStartedAt,
    trialExpiresAt,
    trialDaysRemaining,
  });
}
