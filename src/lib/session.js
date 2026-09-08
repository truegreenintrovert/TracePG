import { supabase } from "./supabase";

const WEB_SESSION_KEY = "tracepg_web_session_id";

function getWebSessionId() {
  try {
    const stored = localStorage.getItem(WEB_SESSION_KEY);
    if (stored) return stored;
    const created = crypto.randomUUID();
    localStorage.setItem(WEB_SESSION_KEY, created);
    return created;
  } catch {
    return "web-session";
  }
}

export function traceClientHeaders() {
  return {
    "X-TracePG-Client": "web",
    "X-TracePG-Session": getWebSessionId(),
  };
}

export async function releaseTraceSession() {
  if (!supabase) return;
  const { data, error } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (error || !token) return;
  await fetch("/api/session", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      ...traceClientHeaders(),
    },
    keepalive: true,
  }).catch(() => undefined);
}
