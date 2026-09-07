import { getAuthenticatedUser, hasTraceAccess, isAdminUser, json, touchUser } from "../_shared.js";

const TRIAL_SIZE = 20;
const TRIAL_DURATION_MS = 3 * 86400000;

export async function onRequestPost({ request, env }) {
  const auth = await getAuthenticatedUser(request, env);
  if (auth.error) return auth.error;
  if (isAdminUser(auth.user, env) || await hasTraceAccess(env, auth.user)) {
    return json({ hasAccess: true, remaining: null });
  }

  await touchUser(env, auth.user);
  const now = Date.now();
  await env.DB.prepare(
    "INSERT OR IGNORE INTO trial_usage (user_id, used_count, created_at, updated_at) VALUES (?, 0, ?, ?)",
  ).bind(auth.user.id, now, now).run();

  let current = await env.DB.prepare(
    "SELECT trial_started_at AS trialStartedAt, trial_expires_at AS trialExpiresAt FROM trial_usage WHERE user_id = ?",
  ).bind(auth.user.id).first();
  if (Number(current?.trialExpiresAt || 0) > now) {
    return json({ hasAccess: true, trialActive: true, trialStartedAt: current.trialStartedAt, trialExpiresAt: current.trialExpiresAt });
  }
  if (current?.trialStartedAt) {
    return json({ error: "Your 3-day free trial has expired.", trialActive: false, trialExpiresAt: current.trialExpiresAt }, 403);
  }

  const trialStartedAt = now;
  const trialExpiresAt = now + TRIAL_DURATION_MS;
  const started = await env.DB.prepare(
    "UPDATE trial_usage SET trial_started_at = ?, trial_expires_at = ?, updated_at = ? WHERE user_id = ? AND trial_started_at IS NULL",
  ).bind(trialStartedAt, trialExpiresAt, now, auth.user.id).run();
  if (Number(started.meta?.changes || 0) !== 1) {
    current = await env.DB.prepare(
      "SELECT trial_started_at AS trialStartedAt, trial_expires_at AS trialExpiresAt FROM trial_usage WHERE user_id = ?",
    ).bind(auth.user.id).first();
    if (Number(current?.trialExpiresAt || 0) > Date.now()) {
      return json({ hasAccess: true, trialActive: true, trialStartedAt: current.trialStartedAt, trialExpiresAt: current.trialExpiresAt });
    }
    return json({ error: "Your 3-day free trial has expired.", trialActive: false, trialExpiresAt: current?.trialExpiresAt || null }, 403);
  }

  return json({ hasAccess: true, trialActive: true, trialStartedAt, trialExpiresAt });
}
