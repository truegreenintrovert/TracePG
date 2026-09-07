const USER_STORE_PREFIX = "tracepg_user_v2:";
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
  pausedTests: [],
  pausedTest: null,
  pausedTestClearedAt: 0,
  pausedTestRemovedAt: {},
};

function getUserStoreKey(userId) {
  return `${USER_STORE_PREFIX}${encodeURIComponent(String(userId))}`;
}

export function loadLocalState(userId) {
  if (!userId) return emptyState;
  try {
    const saved = JSON.parse(localStorage.getItem(getUserStoreKey(userId)) || "{}");
    return {
      ...emptyState,
      ...saved,
      pausedTests: normalizePausedTests(saved),
      pausedTest: null,
    };
  } catch {
    return emptyState;
  }
}

export function saveLocalState(state, userId) {
  if (!userId) return;
  try {
    localStorage.setItem(getUserStoreKey(userId), JSON.stringify(state));
  } catch {
    // Local storage is optional; cloud progress remains the source of truth.
  }
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

  const pausedTestClearedAt = Math.max(
    Number(local.pausedTestClearedAt || 0),
    Number(remote.pausedTestClearedAt || 0),
  );
  const pausedTestRemovedAt = {
    ...(remote.pausedTestRemovedAt || {}),
    ...(local.pausedTestRemovedAt || {}),
  };
  const pausedCandidates = [...normalizePausedTests(local), ...normalizePausedTests(remote)]
    .filter((item) => {
      const removedAt = Number(pausedTestRemovedAt[item.id] || 0);
      const isLegacy = String(item.id).startsWith("legacy_");
      return Number(item.pausedAt || 0) > removedAt
        && (!isLegacy || Number(item.pausedAt || 0) > pausedTestClearedAt);
    })
    .sort((left, right) => Number(right.pausedAt || 0) - Number(left.pausedAt || 0));
  const uniquePausedTests = [
    ...new Map(pausedCandidates.map((item) => [item.id, item])).values(),
  ];

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
    pausedTestClearedAt,
    pausedTests: uniquePausedTests,
    pausedTest: null,
    pausedTestRemovedAt,
  };
}

function normalizePausedTests(source = {}) {
  const list = Array.isArray(source.pausedTests)
    ? source.pausedTests
    : source.pausedTest
      ? [source.pausedTest]
      : [];
  return list
    .filter((item) => item?.questions?.length)
    .map((item, index) => ({
      ...item,
      id: item.id || `legacy_${Number(item.pausedAt || 0)}_${index}`,
    }));
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
