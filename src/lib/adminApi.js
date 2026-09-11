import { supabase } from "./supabase";
import { traceClientHeaders } from "./session";

async function getFreshSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  let session = data.session;
  const expiresAt = Number(session?.expires_at || 0) * 1000;
  if (session && expiresAt > 0 && expiresAt <= Date.now() + 60_000) {
    const refreshed = await supabase.auth.refreshSession();
    if (refreshed.error || !refreshed.data.session) {
      await clearLocalAuthSession();
      throw new Error("Your session has expired. Please sign in again.");
    }
    session = refreshed.data.session;
  }
  return session;
}

async function clearLocalAuthSession() {
  await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
}

export async function authHeaders() {
  if (!supabase) throw new Error("Authentication is not configured.");
  const session = await getFreshSession();
  if (!session?.access_token) throw new Error("Sign in required.");
  return { Authorization: `Bearer ${session.access_token}`, ...traceClientHeaders() };
}

export async function refreshAuthSession() {
  if (!supabase) throw new Error("Authentication is not configured.");
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) {
    await clearLocalAuthSession();
    throw new Error("Your session has expired. Please sign in again.");
  }
  return data.session;
}

export async function adminFetch(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(await authHeaders()),
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Admin request failed: ${response.status}`);
  return payload;
}
