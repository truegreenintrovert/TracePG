import test from "node:test";
import assert from "node:assert/strict";
import { sha512, verifyPayUResponse } from "../functions/api/billing/_payu.js";
import { getDiscountQuote } from "../functions/api/billing/_discount.js";
import { BILLING_PLANS, getPlan } from "../functions/api/billing/_plans.js";

test("exposes the five configured premium plans", () => {
  assert.deepEqual(BILLING_PLANS.map(({ id, priceInr, durationMonths }) => ({ id, priceInr, durationMonths })), [
    { id: "yearly", priceInr: 298, durationMonths: 12 },
    { id: "two_year", priceInr: 398, durationMonths: 24 },
    { id: "three_year", priceInr: 598, durationMonths: 36 },
    { id: "five_year", priceInr: 698, durationMonths: 60 },
    { id: "lifetime", priceInr: 1500, durationMonths: null },
  ]);
  assert.equal(getPlan("three_year").priceInr, 598);
  assert.equal(getPlan("unknown"), null);
});

test("a 50 percent discount reaches the launch prices", async () => {
  const env = {
    DB: {
      prepare() {
        return { bind() { return { first: async () => ({ code: "HALF", discountType: "percent", discountValue: 50, active: 1, maxUses: null, usedCount: 0, expiresAt: null }) }; } };
      },
    },
  };
  const discounted = await Promise.all(BILLING_PLANS.map(async (plan) => (await getDiscountQuote(env, "half", plan.priceInr)).amount));
  assert.deepEqual(discounted, [149, 199, 299, 349, 750]);
});

function makePayUFields(overrides = {}) {
  return {
    key: "merchant-key",
    txnid: "tp_test_123",
    amount: "900.00",
    productinfo: "TracePG lifetime access",
    firstname: "TracePG User",
    email: "student@example.com",
    status: "success",
    udf1: "",
    udf2: "",
    udf3: "",
    udf4: "",
    udf5: "",
    ...overrides,
  };
}

async function signPayUFields(fields, salt) {
  const reverseHashString = `${salt}|${fields.status}||||||${fields.udf5}|${fields.udf4}|${fields.udf3}|${fields.udf2}|${fields.udf1}|${fields.email}|${fields.firstname}|${fields.productinfo}|${fields.amount}|${fields.txnid}|${fields.key}`;
  return { ...fields, hash: await sha512(reverseHashString) };
}

test("accepts a correctly signed PayU response", async () => {
  const fields = await signPayUFields(makePayUFields(), "merchant-salt");
  assert.equal(await verifyPayUResponse(fields, "merchant-salt"), true);
});

test("rejects a tampered PayU response", async () => {
  const fields = await signPayUFields(makePayUFields(), "merchant-salt");
  fields.amount = "1.00";
  assert.equal(await verifyPayUResponse(fields, "merchant-salt"), false);
});

test("calculates a percentage discount and caps the payable amount", async () => {
  const env = {
    DB: {
      prepare() {
        return { bind() { return { first: async () => ({ code: "SAVE10", discountType: "percent", discountValue: 10, active: 1, maxUses: null, usedCount: 0, expiresAt: null }) }; } };
      },
    },
  };
  const quote = await getDiscountQuote(env, "save10", 1000);
  assert.deepEqual(quote, { code: "SAVE10", discountAmount: 100, amount: 900, discountType: "percent", discountValue: 10 });
});

test("rejects an expired discount code", async () => {
  const env = {
    DB: {
      prepare() {
        return { bind() { return { first: async () => ({ code: "OLD", discountType: "fixed", discountValue: 100, active: 1, maxUses: null, usedCount: 0, expiresAt: Date.now() - 1 }) }; } };
      },
    },
  };
  const quote = await getDiscountQuote(env, "old", 1000);
  assert.deepEqual(quote, { error: "That discount code has expired." });
});
