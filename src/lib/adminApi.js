import { supabase } from "./supabase";

export async function authHeaders() {
  if (!supabase) throw new Error("Authentication is not configured.");
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("Sign in required.");
  return { Authorization: `Bearer ${data.session.access_token}` };
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
