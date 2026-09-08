import { supabase } from "./supabase";
import { traceClientHeaders } from "./session";

export async function authHeaders() {
  if (!supabase) throw new Error("Authentication is not configured.");
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("Sign in required.");
  return { Authorization: `Bearer ${data.session.access_token}`, ...traceClientHeaders() };
}

export async function billingFetch(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(path, {
      ...options,
      signal: controller.signal,
      headers: { "content-type": "application/json", ...(await authHeaders()), ...(options.headers || {}) },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Payment request failed: ${response.status}`);
    return payload;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Secure checkout timed out. Please try again.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
