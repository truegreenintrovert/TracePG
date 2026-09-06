import { getAuthenticatedUser, hasTraceAccess, isAdminUser, json, touchUser } from "../_shared.js";

const TRIAL_SIZE = 20;
const MAX_TRIALS = 2;

export async function onRequestPost({ request, env }) {
  const auth = await getAuthenticatedUser(request, env);
  if (auth.error) return auth.error;
  if (isAdminUser(auth.user, env) || await hasTraceAccess(env, auth.user)) {
    return json({ hasAccess: true, remaining: null });
  }

  await touchUser(env, auth.user);
  await env.DB.prepare(
    "INSERT OR IGNORE INTO trial_usage (user_id, used_count, created_at, updated_at) VALUES (?, 0, ?, ?)",
  ).bind(auth.user.id, Date.now(), Date.now()).run();

  const usage = await env.DB.prepare(
    "UPDATE trial_usage SET used_count = used_count + 1, updated_at = ? WHERE user_id = ? AND used_count < ?",
  ).bind(Date.now(), auth.user.id, MAX_TRIALS).run();
  if (Number(usage.meta?.changes || 0) !== 1) {
    const current = await env.DB.prepare("SELECT used_count FROM trial_usage WHERE user_id = ?").bind(auth.user.id).first();
    return json({ error: "Your two free trial tests have already been used.", remaining: Math.max(0, MAX_TRIALS - Number(current?.used_count || MAX_TRIALS)) }, 403);
  }

  const result = await env.DB.prepare("SELECT data FROM questions ORDER BY RANDOM() LIMIT ?").bind(TRIAL_SIZE).all();
  const items = result.results.map((row) => JSON.parse(row.data));
  if (items.length < TRIAL_SIZE) return json({ error: "The trial question bank is not ready yet." }, 503);

  const usedCount = await env.DB.prepare("SELECT used_count FROM trial_usage WHERE user_id = ?").bind(auth.user.id).first();
  return json({ hasAccess: false, trialNumber: Number(usedCount?.used_count || 1), remaining: Math.max(0, MAX_TRIALS - Number(usedCount?.used_count || 1)), items });
}
