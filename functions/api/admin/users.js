import { getAdminUser, json } from "../_shared.js";

const PLAN_IDS = new Set(["yearly", "two_year", "three_year", "five_year", "lifetime"]);

function mapUser(row, now) {
  const expiresAt = row.expires_at === null ? null : Number(row.expires_at || 0);
  const active = row.entitlement_status === "active" && (expiresAt === null || expiresAt > now);
  return {
    id: row.id,
    email: row.email || "",
    displayName: row.display_name || "",
    createdAt: Number(row.created_at || 0),
    lastSeenAt: Number(row.last_seen_at || 0),
    planId: row.plan_id || null,
    expiresAt,
    hasAccess: active,
    status: active ? "active" : row.plan_id ? "expired" : "free",
  };
}

export async function onRequestGet({ request, env }) {
  const auth = await getAdminUser(request, env);
  if (auth.error) return auth.error;

  const filter = new URL(request.url).searchParams.get("plan") || "all";
  if (filter !== "all" && !PLAN_IDS.has(filter)) return json({ error: "Invalid plan filter." }, 400);

  const result = await env.DB.prepare(
    "SELECT u.id, u.email, u.display_name, u.created_at, u.last_seen_at, e.plan_id, e.expires_at, e.status AS entitlement_status FROM users u LEFT JOIN entitlements e ON e.user_id = u.id ORDER BY u.created_at DESC LIMIT 1000",
  ).all();
  const now = Date.now();
  const users = result.results.map((row) => mapUser(row, now));
  const filteredUsers = filter === "all" ? users : users.filter((user) => user.planId === filter && user.hasAccess);
  const activePremium = users.filter((user) => user.hasAccess);
  const summary = {
    totalUsers: users.length,
    activePremium: activePremium.length,
    lifetime: activePremium.filter((user) => user.planId === "lifetime").length,
    yearly: activePremium.filter((user) => user.planId === "yearly").length,
    twoYear: activePremium.filter((user) => user.planId === "two_year").length,
    threeYear: activePremium.filter((user) => user.planId === "three_year").length,
    fiveYear: activePremium.filter((user) => user.planId === "five_year").length,
    expired: users.filter((user) => user.status === "expired").length,
  };

  return json({ users: filteredUsers, summary, filter, generatedAt: now });
}
