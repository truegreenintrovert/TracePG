function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  });
}

export async function getAuthenticatedUser(request, env) {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!token || !env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    return { error: json({ error: 'Authentication is required.' }, 401) };
  }

  const response = await fetch(`${env.SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) return { error: json({ error: 'Invalid or expired session.' }, 401) };
  return { user: await response.json() };
}

export function isAdminUser(user, env) {
  const configuredEmails = String(env.ADMIN_EMAILS || "").replaceAll("\\@", "@");
  const emails = configuredEmails.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  const ids = String(env.ADMIN_USER_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return ids.includes(user.id) || emails.map((email) => email.toLowerCase()).includes(String(user.email || "").toLowerCase());
}

export function normalizeSubject(value) {
  const subject = String(value ?? '').trim();
  const aliases = {
    anaesthesia: 'Anesthesia',
    anesthesia: 'Anesthesia',
    'gynaecology & obstetrics': 'OBG',
    obg: 'OBG',
    orthopaedics: 'Orthopedics',
    orthopedics: 'Orthopedics',
  };
  return aliases[subject.toLowerCase()] || subject;
}

export async function getAdminUser(request, env) {
  const auth = await getAuthenticatedUser(request, env);
  if (auth.error) return auth;
  if (!isAdminUser(auth.user, env)) {
    return { error: json({ error: "Administrator access is required." }, 403) };
  }
  return auth;
}

export async function hasTraceAccess(env, user) {
  if (isAdminUser(user, env)) return true;
  const row = await env.DB.prepare(
    "SELECT user_id FROM entitlements WHERE user_id = ? AND status = 'active'",
  ).bind(user.id).first();
  if (row) return true;
  const trial = await env.DB.prepare(
    "SELECT trial_expires_at AS trialExpiresAt FROM trial_usage WHERE user_id = ?",
  ).bind(user.id).first();
  return Number(trial?.trialExpiresAt || 0) > Date.now();
}

export async function hasLifetimeAccess(env, user) {
  if (isAdminUser(user, env)) return true;
  const row = await env.DB.prepare(
    "SELECT user_id FROM entitlements WHERE user_id = ? AND status = 'active'",
  ).bind(user.id).first();
  return Boolean(row);
}

export async function touchUser(env, user) {
  const now = Date.now();
  await env.DB.prepare(
    'INSERT INTO users (id, email, display_name, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name, last_seen_at = excluded.last_seen_at',
  ).bind(user.id, user.email || null, user.user_metadata?.full_name || user.user_metadata?.name || null, now, now).run();
}

export { json };
