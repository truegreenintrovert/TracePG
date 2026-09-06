import { json } from './_shared.js';

export async function onRequestGet({ env }) {
  return json({
    ok: true,
    service: 'tracepg-api',
    databaseConfigured: Boolean(env.DB),
    timestamp: new Date().toISOString(),
  });
}
