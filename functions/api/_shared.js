import { getJson as getRedisJson, setJson as setRedisJson } from './_redis.js';

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

const DEVICE_SESSION_TTL_MS = 30 * 86400000;

function getClientType(request) {
  return String(request.headers.get('x-tracepg-client') || '').toLowerCase() === 'app' ? 'app' : 'web';
}

function decodeJwtPayload(token) {
  try {
    const encoded = token.split('.')[1];
    if (!encoded) return null;
    const base64 = encoded.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(encoded.length / 4) * 4, '=');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

function getSessionId(token, request) {
  const tokenSessionId = decodeJwtPayload(token)?.session_id;
  const clientSessionId = request.headers.get('x-tracepg-session')?.trim();
  return String(tokenSessionId || clientSessionId || `token_${token.slice(-32)}`).slice(0, 160);
}

async function claimDeviceSession(env, userId, clientType, sessionId) {
  if (!env.DB) return { ok: true };
  const now = Date.now();
  const staleBefore = now - DEVICE_SESSION_TTL_MS;
  let current = await env.DB.prepare(
    'SELECT session_id AS sessionId, last_seen_at AS lastSeenAt FROM device_sessions WHERE user_id = ? AND client_type = ?',
  ).bind(userId, clientType).first();

  if (!current) {
    try {
      await env.DB.prepare(
        'INSERT INTO device_sessions (user_id, client_type, session_id, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?)',
      ).bind(userId, clientType, sessionId, now, now).run();
      return { ok: true };
    } catch {
      // Another request may have claimed the slot at the same time. Re-read it
      // before deciding whether this session is allowed.
      current = await env.DB.prepare(
        'SELECT session_id AS sessionId, last_seen_at AS lastSeenAt FROM device_sessions WHERE user_id = ? AND client_type = ?',
      ).bind(userId, clientType).first();
    }
  }

  if (current?.sessionId === sessionId) {
    await env.DB.prepare(
      'UPDATE device_sessions SET last_seen_at = ? WHERE user_id = ? AND client_type = ? AND session_id = ?',
    ).bind(now, userId, clientType, sessionId).run();
    return { ok: true };
  }

  if (Number(current?.lastSeenAt || 0) < staleBefore) {
    const replaced = await env.DB.prepare(
      'UPDATE device_sessions SET session_id = ?, created_at = ?, last_seen_at = ? WHERE user_id = ? AND client_type = ? AND session_id = ?',
    ).bind(sessionId, now, now, userId, clientType, current?.sessionId || '').run();
    if (Number(replaced.meta?.changes || 0) === 1) return { ok: true };
  }

  const label = clientType === 'app' ? 'app' : 'web';
  return {
    ok: false,
    error: json({
      code: 'DEVICE_LIMIT_REACHED',
      clientType,
      error: `This account already has an active ${label} sign-in. Sign out from that ${label} device before signing in here.`,
    }, 409),
  };
}

export async function replaceDeviceSession(env, auth) {
  if (!env.DB || !auth?.user?.id || !auth.sessionId) return;
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO device_sessions (user_id, client_type, session_id, created_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, client_type) DO UPDATE SET
       session_id = excluded.session_id,
       created_at = excluded.created_at,
       last_seen_at = excluded.last_seen_at`,
  ).bind(auth.user.id, auth.clientType, auth.sessionId, now, now).run();
}

export async function releaseDeviceSession(env, auth) {
  if (!env.DB || !auth?.user?.id || !auth.sessionId) return;
  await env.DB.prepare(
    'DELETE FROM device_sessions WHERE user_id = ? AND client_type = ? AND session_id = ?',
  ).bind(auth.user.id, auth.clientType, auth.sessionId).run();
}

export async function getAuthenticatedUser(request, env, options = {}) {
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
  const user = await response.json();
  if (env.DB) {
    await touchUser(env, user);
    const clientType = getClientType(request);
    const sessionId = getSessionId(token, request);
    if (!options.skipDeviceCheck) {
      const claimed = await claimDeviceSession(env, user.id, clientType, sessionId);
      if (!claimed.ok) return claimed;
    }
    return { user, clientType, sessionId };
  }
  return { user, clientType: getClientType(request), sessionId: getSessionId(token, request) };
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
  const accessCacheKey = `tracepg:access:${user.id}`;
  const cachedAccess = await getRedisJson(env, accessCacheKey);
  if (typeof cachedAccess === 'boolean') return cachedAccess;

  const row = await env.DB.prepare(
    "SELECT user_id FROM entitlements WHERE user_id = ? AND status = 'active' AND (expires_at IS NULL OR expires_at > ?)",
  ).bind(user.id, Date.now()).first();
  if (row) {
    await setRedisJson(env, accessCacheKey, true, 30);
    return true;
  }
  const trial = await env.DB.prepare(
    "SELECT trial_expires_at AS trialExpiresAt FROM trial_usage WHERE user_id = ?",
  ).bind(user.id).first();
  const hasAccess = Number(trial?.trialExpiresAt || 0) > Date.now();
  await setRedisJson(env, accessCacheKey, hasAccess, 30);
  return hasAccess;
}

export async function hasLifetimeAccess(env, user) {
  if (isAdminUser(user, env)) return true;
  const row = await env.DB.prepare(
    "SELECT user_id FROM entitlements WHERE user_id = ? AND status = 'active' AND expires_at IS NULL",
  ).bind(user.id).first();
  return Boolean(row);
}

export async function touchUser(env, user) {
  if (!env.DB || !user?.id) return;

  const edgeCache = globalThis.caches?.default;
  const markerRequest = new Request(
    `https://tracepg-user-touch.invalid/${encodeURIComponent(user.id)}`,
  );
  if (edgeCache) {
    try {
      if (await edgeCache.match(markerRequest)) return;
    } catch {
      // Continue with the database update if the edge cache is unavailable.
    }
  }

  const now = Date.now();
  await env.DB.prepare(
    'INSERT INTO users (id, email, display_name, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name, last_seen_at = excluded.last_seen_at',
  ).bind(user.id, user.email || null, user.user_metadata?.full_name || user.user_metadata?.name || null, now, now).run();

  if (edgeCache) {
    try {
      await edgeCache.put(
        markerRequest,
        new Response('1', { headers: { 'Cache-Control': 'public, max-age=600' } }),
      );
    } catch {
      // The user record is already updated; cache warming is best effort.
    }
  }
}

export { json };
