import { getAdminUser, json } from "../_shared.js";

export async function onRequestGet({ request, env }) {
  const auth = await getAdminUser(request, env);
  if (auth.error) return auth.error;
  return json({ isAdmin: true, email: auth.user.email || null });
}
