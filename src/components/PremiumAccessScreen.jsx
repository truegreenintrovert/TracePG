import { useEffect, useState } from "react";
import { FiAward } from "react-icons/fi";
import { billingFetch } from "../lib/billing";
import { BILLING_PLANS } from "../data/billingPlans";

export default function PremiumAccessScreen({ user, plans = BILLING_PLANS, trialAvailable = false, trialActive = false, trialDaysRemaining = 0, error: accessError, onUnlocked, onTrialStarted, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || "yearly");

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || plans[0] || BILLING_PLANS[0];

  useEffect(() => {
    if (accessError) setError(accessError);
  }, [accessError]);

  const startTrial = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const trial = await billingFetch("/api/trial/start", { method: "POST", body: "{}" });
      if (trial.hasAccess || trial.trialActive) onTrialStarted(trial);
      else throw new Error("The trial test could not be started.");
    } catch (trialError) {
      setError(trialError.message);
      setBusy(false);
    }
  };

  const purchase = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const order = await billingFetch("/api/billing/create-order", { method: "POST", body: JSON.stringify({ planId: selectedPlan.id, discountCode: discountCode.trim() }) });
      if (order.hasAccess) {
        onUnlocked();
        return;
      }
      const form = document.createElement("form");
      form.method = "POST";
      form.action = order.action;
      form.style.display = "none";
      Object.entries(order.fields || {}).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value ?? "";
        form.appendChild(input);
      });
      document.body.appendChild(form);
      let checkoutNavigated = false;
      const markCheckoutNavigation = () => {
        checkoutNavigated = true;
      };
      window.addEventListener("pagehide", markCheckoutNavigation, { once: true });
      form.submit();
      window.setTimeout(() => {
        if (checkoutNavigated) return;
        window.removeEventListener("pagehide", markCheckoutNavigation);
        form.remove();
        setBusy(false);
        setError("Secure checkout could not open. Please check the PayU test setup and try again.");
      }, 20000);
    } catch (purchaseError) {
      setError(purchaseError.message);
      setBusy(false);
    }
  };

  const applyDiscount = async () => {
    const code = discountCode.trim();
    if (!code) {
      setError("Enter a discount code first.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const quote = await billingFetch("/api/billing/create-order", { method: "POST", body: JSON.stringify({ planId: selectedPlan.id, discountCode: code, preview: true }) });
      setDiscount(quote);
      setMessage(`Discount applied. You save ₹${Number(quote.discountAmount || 0).toLocaleString("en-IN")} on this purchase.`);
    } catch (discountError) {
      setDiscount(null);
      setError(discountError.message);
    } finally {
      setBusy(false);
    }
  };

  const displayedPrice = discount?.amount ?? selectedPlan.priceInr;

  return (
    <div className="grid min-h-[65vh] place-items-center">
      <section className="surface-card w-full max-w-2xl text-center">
        {onClose && <button className="float-right text-sm font-bold text-slate-500 hover:text-brand-600 dark:text-slate-400" onClick={onClose}>Continue studying</button>}
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-100 text-3xl text-brand-600 dark:bg-blue-950/50 dark:text-blue-200"><FiAward aria-hidden="true" /></div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-brand-600">TracePG premium access</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Prepare with the complete question bank</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">Get full access to the question bank, PYQs, tests, review, history, analytics, revision, bookmarks, and notes.</p>
        <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-5">
          {plans.map((plan) => (
            <button key={plan.id} type="button" className={`rounded-2xl border p-3 text-left transition ${selectedPlan.id === plan.id ? "border-brand-600 bg-blue-50 ring-2 ring-blue-200 dark:border-blue-400 dark:bg-blue-950/40 dark:ring-blue-900" : "border-slate-200 hover:border-blue-300 dark:border-slate-700"}`} onClick={() => { setSelectedPlanId(plan.id); setDiscount(null); setMessage(""); setError(""); }} disabled={busy}>
              <span className="block text-sm font-black">{plan.label}</span>
              <span className="mt-1 block text-lg font-black">₹{Number(plan.priceInr).toLocaleString("en-IN")}</span>
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">one-time</span>
            </button>
          ))}
        </div>
        <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/70">
          <p className="text-4xl font-black">₹{Number(displayedPrice).toLocaleString("en-IN")}</p>
          {discount && <p className="mt-1 text-sm font-bold text-slate-400 line-through">₹{Number(selectedPlan.priceInr).toLocaleString("en-IN")}</p>}
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">One-time payment · {selectedPlan.label.toLowerCase()} access</p>
        </div>
        <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left dark:border-blue-900/70 dark:bg-blue-950/30">
          {trialActive ? (
            <>
              <p className="font-black text-blue-900 dark:text-blue-100">Your free trial is active</p>
              <p className="mt-1 text-sm leading-6 text-blue-800 dark:text-blue-200">You have {trialDaysRemaining || 1} day{trialDaysRemaining === 1 ? "" : "s"} left. Upgrade anytime to keep full access after your trial ends.</p>
            </>
          ) : (
            <>
              <p className="font-black text-blue-900 dark:text-blue-100">Free trial: 3 days of full access</p>
              <p className="mt-1 text-sm leading-6 text-blue-800 dark:text-blue-200">Explore the complete TracePG question bank, PYQs, tests, and study tools free for three days. The trial starts when you click the button.</p>
              {trialAvailable ? <button className="secondary-button mt-3 w-full sm:w-auto" onClick={startTrial} disabled={busy}>{busy ? "Starting trial…" : "Start 3-day free trial"}</button> : <p className="mt-3 text-sm font-bold text-amber-700 dark:text-amber-300">Your free trial has ended. Choose a plan to continue.</p>}
            </>
          )}
        </div>
        <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-slate-200 p-4 text-left dark:border-slate-700">
          <label className="text-sm font-black text-slate-800 dark:text-slate-100" htmlFor="discount-code">Have a discount code?</label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input id="discount-code" className="field uppercase" type="text" autoComplete="off" placeholder="Enter code" value={discountCode} onChange={(event) => { setDiscountCode(event.target.value.toUpperCase()); setDiscount(null); setMessage(""); }} />
            <button className="secondary-button sm:shrink-0" onClick={applyDiscount} disabled={busy}>{busy ? "Checking…" : "Apply code"}</button>
          </div>
        </div>
        {error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
        {message && <p className="mt-5 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">{message}</p>}
        <button className="primary-button mt-6 w-full sm:w-auto" onClick={purchase} disabled={busy}>{busy ? "Opening secure checkout…" : `Choose ${selectedPlan.label} · ₹${Number(displayedPrice).toLocaleString("en-IN")}`}</button>
        <p className="mt-4 text-xs text-slate-400">Signed in as {user?.email}. Payments are processed securely by PayU.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-bold text-brand-600"><a href="/product">Product</a><a href="/about-us">About Us</a><a href="/contact-us">Contact Us</a><a href="/help-support">Help & Support</a><a href="/qa">Q&A</a></div>
      </section>
    </div>
  );
}
