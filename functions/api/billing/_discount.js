export function normalizeDiscountCode(value) {
  return String(value || "").trim().toUpperCase();
}

export async function getDiscountQuote(env, code, basePrice) {
  const normalizedCode = normalizeDiscountCode(code);
  const baseAmount = Math.max(1, Number(basePrice || 0));
  if (!normalizedCode) return { code: "", discountAmount: 0, amount: baseAmount };

  const row = await env.DB.prepare(
    "SELECT code, discount_type AS discountType, discount_value AS discountValue, active, max_uses AS maxUses, used_count AS usedCount, expires_at AS expiresAt FROM discount_codes WHERE code = ?",
  ).bind(normalizedCode).first();
  if (!row || !Number(row.active)) return { error: "That discount code is not active." };
  if (row.expiresAt && Number(row.expiresAt) <= Date.now()) return { error: "That discount code has expired." };
  if (row.maxUses !== null && row.maxUses !== undefined && Number(row.usedCount || 0) >= Number(row.maxUses)) return { error: "That discount code has reached its usage limit." };

  const value = Number(row.discountValue || 0);
  const rawDiscount = row.discountType === "percent" ? (baseAmount * value) / 100 : value;
  const discountAmount = Math.max(0, Math.min(baseAmount - 1, rawDiscount));
  return {
    code: normalizedCode,
    discountAmount: Number(discountAmount.toFixed(2)),
    amount: Number((baseAmount - discountAmount).toFixed(2)),
    discountType: row.discountType,
    discountValue: value,
  };
}
