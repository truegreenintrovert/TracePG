export const STORE_KEY = "tracepg_clean_v1";
const LEGACY_STORE_KEY = "medprep_clean_v1";
import { supabase } from "./supabase";

export const emptyState = {
  history: [],
  wrong: [],
  bookmarks: [],
  notes: {},
  attempts: {},
  revision: {},
  timeSpent: {},
  dailyTarget: 50,
};

export function loadLocalState() {
  try {
    return {
      ...emptyState,
      ...JSON.parse(localStorage.getItem(STORE_KEY) || localStorage.getItem(LEGACY_STORE_KEY) || "{}"),
    };
  } catch {
    return emptyState;
  }
}

export function saveLocalState(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

export function mergeState(local, remote) {
  const history = [...(remote.history || []), ...(local.history || [])];
  const uniqueHistory = [
    ...new Map(history.map((item) => [JSON.stringify(item), item])).values(),
  ];
  const mergeMax = (left = {}, right = {}) =>
    Object.fromEntries(
      [...new Set([...Object.keys(left), ...Object.keys(right)])].map((key) => [
        key,
        Math.max(Number(left[key] || 0), Number(right[key] || 0)),
      ]),
    );
  const attempts = { ...(remote.attempts || {}), ...(local.attempts || {}) };
  Object.keys(remote.attempts || {}).forEach((key) => {
    if ((remote.attempts[key]?.n || 0) > (local.attempts?.[key]?.n || 0))
      attempts[key] = remote.attempts[key];
  });

  return {
    ...local,
    ...remote,
    history: uniqueHistory,
    wrong: [...new Set([...(remote.wrong || []), ...(local.wrong || [])])],
    bookmarks: [
      ...new Set([...(remote.bookmarks || []), ...(local.bookmarks || [])]),
    ],
    notes: { ...(remote.notes || {}), ...(local.notes || {}) },
    attempts,
    revision: mergeMax(local.revision, remote.revision),
    timeSpent: mergeMax(local.timeSpent, remote.timeSpent),
  };
}

export async function getRemoteState() {
  const headers = await authHeaders();
  const response = await fetch("/api/progress", {
    credentials: "same-origin",
    headers,
  });
  if (!response.ok)
    throw new Error(`Progress request failed: ${response.status}`);
  return response.json();
}

export async function putRemoteState(state) {
  const auth = await authHeaders();
  const response = await fetch("/api/progress", {
    method: "PUT",
    credentials: "same-origin",
    headers: { "content-type": "application/json", ...auth },
    body: JSON.stringify({ data: state }),
  });
  if (!response.ok) throw new Error(`Progress save failed: ${response.status}`);
  return response.json();
}

async function authHeaders() {
  if (!supabase) throw new Error("Authentication is not configured.");
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("Sign in required.");
  return { Authorization: `Bearer ${data.session.access_token}` };
}
