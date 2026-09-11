const REDIS_URL_KEY = 'UPSTASH_REDIS_REST_URL';
const REDIS_TOKEN_KEY = 'UPSTASH_REDIS_REST_TOKEN';

function getRedisConfig(env) {
  const url = String(env?.[REDIS_URL_KEY] || '').trim().replace(/\/$/, '');
  const token = String(env?.[REDIS_TOKEN_KEY] || '').trim();
  return url && token ? { url, token } : null;
}

async function command(env, args) {
  const config = getRedisConfig(env);
  if (!config) return null;

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });

  if (!response.ok) throw new Error(`Redis request failed with status ${response.status}`);
  const payload = await response.json();
  if (payload?.error) throw new Error(String(payload.error));
  return payload?.result ?? null;
}

export async function getJson(env, key) {
  try {
    const value = await command(env, ['GET', key]);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn('redis_get_failed', error?.message || error);
    return null;
  }
}

export async function setJson(env, key, value, ttlSeconds) {
  try {
    await command(env, ['SET', key, JSON.stringify(value), 'EX', String(ttlSeconds)]);
  } catch (error) {
    console.warn('redis_set_failed', error?.message || error);
  }
}

export async function deleteKey(env, key) {
  try {
    await command(env, ['DEL', key]);
  } catch (error) {
    console.warn('redis_delete_failed', error?.message || error);
  }
}
