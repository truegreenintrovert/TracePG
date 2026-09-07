import { getAuthenticatedUser, hasLifetimeAccess, isAdminUser, json, touchUser } from "../_shared.js";
import { getDiscountQuote } from "./_discount.js";

async function sha512(value) {
  const digest = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

const clean = (value, fallback = "") => String(value || fallback).replaceAll("|", " ").trim();

export async function onRequestPost({ request, env }) {
  const auth = await getAuthenticatedUser(request, env);
  if (auth.error) return auth.error;

  if (isAdminUser(auth.user, env) || await hasLifetimeAccess(env, auth.user)) {
    return json({ hasAccess: true, isAdmin: isAdminUser(auth.user, env) });
  }

  const body = await request.json().catch(() => ({}));
  const priceInr = Math.max(1, Number(env.TRACEPG_PRICE_INR || 1000));
  const quote = await getDiscountQuote(env, body.discountCode, priceInr);
  if (quote.error) return json({ error: quote.error }, 400);
  if (body.preview) return json({ hasAccess: false, priceInr, amount: quote.amount, discountCode: quote.code, discountAmount: quote.discountAmount, discountType: quote.discountType || null, discountValue: quote.discountValue || 0 });

  if (!env.PAYU_KEY || !env.PAYU_SALT) {
    return json({ error: "Payment setup is incomplete. Add the PayU key and salt first." }, 503);
  }

  await touchUser(env, auth.user);

  const amount = quote.amount.toFixed(2);
  const txnid = `tp_${Date.now()}_${crypto.randomUUID().replaceAll("-", "").slice(0, 8)}`;
  const productinfo = "TracePG lifetime access";
  const firstname = clean(auth.user.user_metadata?.full_name || auth.user.user_metadata?.name || "TracePG User").slice(0, 60);
  const email = clean(auth.user.email).slice(0, 120);
  const phone = clean(auth.user.phone || "9999999999").replace(/[^0-9+]/g, "").slice(0, 15) || "9999999999";
  const udfValues = ["", "", "", "", ""];
  const hashString = `${env.PAYU_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udfValues.join("|")}||||||${env.PAYU_SALT}`;
  const hash = await sha512(hashString);
  const baseUrl = (env.APP_URL || new URL(request.url).origin).replace(/\/$/, "");
  const callbackUrl = `${baseUrl}/api/billing/response`;
  const now = Date.now();
  await env.DB.prepare(
    "INSERT INTO payment_orders (id, user_id, amount, currency, status, discount_code, created_at, updated_at) VALUES (?, ?, ?, 'INR', 'created', ?, ?, ?)",
  ).bind(txnid, auth.user.id, amount, quote.code || null, now, now).run();

  return json({
    hasAccess: false,
    provider: "payu",
    action: env.PAYU_ENV === "production" ? "https://secure.payu.in/_payment" : "https://test.payu.in/_payment",
    txnid,
    amount,
    priceInr,
    discountCode: quote.code,
    discountAmount: quote.discountAmount,
    fields: {
      key: env.PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      udf1: udfValues[0],
      udf2: udfValues[1],
      udf3: udfValues[2],
      udf4: udfValues[3],
      udf5: udfValues[4],
      surl: callbackUrl,
      furl: callbackUrl,
      curl: callbackUrl,
      hash,
    },
  });
}
