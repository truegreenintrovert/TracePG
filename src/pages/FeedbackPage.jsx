import { useEffect, useState } from "react";
import { FiClock, FiMessageSquare, FiSend, FiStar } from "react-icons/fi";
import { authHeaders } from "../lib/adminApi";

const categories = ["General feedback", "Content quality", "Test experience", "Bug report", "Feature request", "Payment support"];

export default function FeedbackPage() {
  const [form, setForm] = useState({ category: "General feedback", rating: "", message: "", contactRequested: false });
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    authHeaders()
      .then((headers) => fetch("/api/feedback", { headers }))
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => setHistory(payload?.feedback || []))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const headers = await authHeaders();
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify({ ...form, rating: form.rating ? Number(form.rating) : null }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to send feedback.");
      setHistory((current) => [payload.feedback, ...current].slice(0, 10));
      setForm((current) => ({ ...current, message: "", rating: "", contactRequested: false }));
      setMessage("Thank you. Your feedback has been sent to the TracePG team.");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">Help us improve</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Feedback</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Tell us what is working, what needs attention, or what would make your preparation easier.</p>
      </div>

      {(error || message) && <div className={`rounded-2xl p-4 text-sm font-semibold ${error ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"}`}>{error || message}</div>}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <form className="surface-card space-y-5" onSubmit={submit}>
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-brand-600 dark:bg-blue-950/40"><FiMessageSquare size={20} aria-hidden="true" /></span><div><h2 className="text-xl font-black">Share your thoughts</h2><p className="text-sm text-slate-500 dark:text-slate-400">Every message is read by our team.</p></div></div>
          <label className="block text-sm font-bold">Feedback type<select className="field mt-2" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <div>
            <p className="text-sm font-bold">How would you rate TracePG? <span className="font-normal text-slate-400">(optional)</span></p>
            <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((rating) => <button type="button" key={rating} className={`grid h-10 w-10 place-items-center rounded-xl border transition ${Number(form.rating) === rating ? "border-amber-400 bg-amber-50 text-amber-500 dark:bg-amber-950/40" : "border-slate-200 text-slate-400 hover:border-amber-300 hover:text-amber-400 dark:border-slate-700"}`} aria-label={`${rating} out of 5`} aria-pressed={Number(form.rating) === rating} onClick={() => setForm((current) => ({ ...current, rating: String(rating) }))}><FiStar className={Number(form.rating) >= rating ? "fill-current" : ""} aria-hidden="true" /></button>)}
            </div>
          </div>
          <label className="block text-sm font-bold">Your feedback<textarea className="field mt-2 min-h-36" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="Share a suggestion, issue, or experience…" minLength={10} maxLength={5000} required /></label>
          <label className="flex items-start gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300"><input className="mt-1" type="checkbox" checked={form.contactRequested} onChange={(event) => setForm((current) => ({ ...current, contactRequested: event.target.checked }))} /><span>I am happy for the TracePG team to contact me about this feedback.</span></label>
          <button className="primary-button inline-flex items-center gap-2" disabled={busy}><FiSend aria-hidden="true" /> {busy ? "Sending…" : "Send feedback"}</button>
        </form>

        <section className="surface-card h-fit">
          <div className="flex items-center gap-3"><FiClock className="text-brand-600" size={20} aria-hidden="true" /><h2 className="text-lg font-black">Your recent feedback</h2></div>
          {loading ? <p className="mt-5 text-sm font-semibold text-slate-500">Loading…</p> : history.length === 0 ? <p className="mt-5 text-sm leading-6 text-slate-500 dark:text-slate-400">Your submitted feedback will appear here.</p> : <div className="mt-5 space-y-3">{history.map((item) => <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950" key={item.id}><div className="flex items-center justify-between gap-2"><span className="tag">{item.category}</span><span className="text-xs font-bold capitalize text-slate-400">{item.status}</span></div><p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{item.message}</p><p className="mt-2 text-xs font-semibold text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p></div>)}</div>}
        </section>
      </div>
    </div>
  );
}
