import { getAuthenticatedUser, hasTraceAccess, isAdminUser, json } from "./_shared.js";
import { getPublicPlans } from "./billing/_plans.js";

export async function onRequestGet({ request, env }) {
  const auth = await getAuthenticatedUser(request, env);
  if (auth.error) return auth.error;
  const isAdmin = isAdminUser(auth.user, env);
  const entitlement = await env.DB.prepare(
    "SELECT user_id, plan_id AS planId, expires_at AS expiresAt FROM entitlements WHERE user_id = ? AND status = 'active' AND (expires_at IS NULL OR expires_at > ?)",
  ).bind(auth.user.id, Date.now()).first();
  const trial = await env.DB.prepare(
    "SELECT used_count AS usedCount, trial_started_at AS trialStartedAt, trial_expires_at AS trialExpiresAt FROM trial_usage WHERE user_id = ?",
  ).bind(auth.user.id).first();
  const trialStartedAt = Number(trial?.trialStartedAt || 0) || null;
  const trialExpiresAt = Number(trial?.trialExpiresAt || 0) || null;
  const trialActive = !isAdmin && !entitlement && Boolean(trialExpiresAt && trialExpiresAt > Date.now());
  const hasAccess = isAdmin || Boolean(entitlement) || trialActive;
  const plans = getPublicPlans();
  const trialDaysRemaining = trialActive
    ? Math.max(1, Math.ceil((trialExpiresAt - Date.now()) / 86400000))
    : 0;
  return json({
    hasAccess,
    isAdmin,
    plans,
    priceInr: plans[0].priceInr,
    currency: "INR",
    product: "TracePG premium access",
    activePlanId: entitlement?.planId || null,
    accessExpiresAt: entitlement?.expiresAt || null,
    trialUsed: Number(trial?.usedCount || 0),
    trialAvailable: !trialStartedAt,
    trialActive,
    trialStartedAt,
    trialExpiresAt,
    trialDaysRemaining,
  });
}
