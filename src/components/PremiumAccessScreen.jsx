import { useState } from "react";
import { billingFetch } from "../lib/billing";

export default function PremiumAccessScreen({ user, priceInr = 1000, trialRemaining = 0, error: accessError, onUnlocked, onTrialStarted }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(accessError || "");
  const [message, setMessage] = useState("");

  const startTrial = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const trial = await billingFetch("/api/trial/start", { method: "POST", body: "{}" });
      if (trial.items?.length) onTrialStarted(trial);
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
      const order = await billingFetch("/api/billing/create-order", { method: "POST", body: "{}" });
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
      form.submit();
    } catch (purchaseError) {
      setError(purchaseError.message);
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-[65vh] place-items-center">
      <section className="surface-card w-full max-w-2xl text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-100 text-3xl dark:bg-blue-950/50">🎓</div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-brand-600">TracePG lifetime access</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Prepare with the complete question bank</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">Get lifetime access to the question bank, PYQs, tests, review, history, analytics, revision, bookmarks, and notes.</p>
        <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/70">
          <p className="text-4xl font-black">₹{priceInr.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">One-time payment · lifetime access</p>
        </div>
        <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left dark:border-blue-900/70 dark:bg-blue-950/30">
          <p className="font-black text-blue-900 dark:text-blue-100">Free trial: {trialRemaining} test{trialRemaining === 1 ? "" : "s"} remaining</p>
          <p className="mt-1 text-sm leading-6 text-blue-800 dark:text-blue-200">Each trial contains 20 questions. Start one now, or unlock the complete TracePG experience below.</p>
          {trialRemaining > 0 && <button className="secondary-button mt-3 w-full sm:w-auto" onClick={startTrial} disabled={busy}>{busy ? "Preparing trial…" : "Start free 20-question test"}</button>}
        </div>
        {accessError && <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">{accessError}</p>}
        {error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
        {message && <p className="mt-5 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">{message}</p>}
        <button className="primary-button mt-6 w-full sm:w-auto" onClick={purchase} disabled={busy}>{busy ? "Opening secure checkout…" : `Unlock lifetime access · ₹${priceInr.toLocaleString("en-IN")}`}</button>
        <p className="mt-4 text-xs text-slate-400">Signed in as {user?.email}. Payments are processed securely by PayU.</p>
        <div className="mt-6 flex justify-center gap-4 text-sm font-bold text-brand-600"><a href="/help-support">Help & Support</a><a href="/qa">Q&A</a></div>
      </section>
    </div>
  );
}
