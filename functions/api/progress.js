import { getAuthenticatedUser, json, touchUser } from './_shared.js';

const MAX_BODY_BYTES = 900 * 1024;

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ error: 'Database is not configured.' }, 503);

  try {
    const auth = await getAuthenticatedUser(request, env);
    if (auth.error) return auth.error;
    await touchUser(env, auth.user);
    const row = await env.DB.prepare(
      'SELECT data, updated_at AS updatedAt FROM user_progress WHERE user_id = ?',
    ).bind(auth.user.id).first();

    return json({ data: row ? JSON.parse(row.data) : null, updatedAt: row?.updatedAt || null });
  } catch (error) {
    return json({ error: 'Unable to load progress.', detail: error.message }, 500);
  }
}

export async function onRequestPut({ request, env }) {
  if (!env.DB) return json({ error: 'Database is not configured.' }, 503);

  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_BODY_BYTES) return json({ error: 'Progress payload is too large.' }, 413);

  try {
    const body = await request.json();
    if (!body || typeof body.data !== 'object' || Array.isArray(body.data)) {
      return json({ error: 'Expected a progress object.' }, 400);
    }

    const serialized = JSON.stringify(body.data);
    if (new TextEncoder().encode(serialized).byteLength > MAX_BODY_BYTES) {
      return json({ error: 'Progress payload is too large.' }, 413);
    }

    const auth = await getAuthenticatedUser(request, env);
    if (auth.error) return auth.error;
    const now = Date.now();
    await touchUser(env, auth.user);
    await env.DB.batch([
      env.DB.prepare(
        'INSERT INTO users (id, email, display_name, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET email = excluded.email, display_name = excluded.display_name, last_seen_at = excluded.last_seen_at',
      ).bind(auth.user.id, auth.user.email || null, auth.user.user_metadata?.full_name || auth.user.user_metadata?.name || null, now, now),
      env.DB.prepare(
        'INSERT INTO user_progress (user_id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at',
      ).bind(auth.user.id, serialized, now),
    ]);

    return json({ ok: true, updatedAt: now });
  } catch (error) {
    return json({ error: 'Unable to save progress.', detail: error.message }, 500);
  }
}
