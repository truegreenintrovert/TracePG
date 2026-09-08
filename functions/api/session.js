import { getAuthenticatedUser, json, releaseDeviceSession, replaceDeviceSession } from "./_shared.js";

export async function onRequestPost({ request, env }) {
  const auth = await getAuthenticatedUser(request, env, { skipDeviceCheck: true });
  if (auth.error) return auth.error;
  const body = await request.json().catch(() => ({}));
  if (body?.force !== true) return json({ error: "A session replacement confirmation is required." }, 400);
  await replaceDeviceSession(env, auth);
  return json({ ok: true, clientType: auth.clientType });
}

export async function onRequestDelete({ request, env }) {
  const auth = await getAuthenticatedUser(request, env);
  if (auth.error) return auth.error;
  await releaseDeviceSession(env, auth);
  return json({ ok: true });
}
