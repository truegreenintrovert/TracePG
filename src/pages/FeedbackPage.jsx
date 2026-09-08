import { useEffect, useState } from "react";
import { FiArrowRight, FiCheckCircle, FiClock, FiHeart, FiMessageSquare, FiSend, FiStar } from "react-icons/fi";
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
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#062b75] via-[#075fe3] to-[#6d28d9] p-6 text-white shadow-[0_24px_70px_-35px_rgba(7,95,227,.9)] sm:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-white/10" />
        <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[.24em] text-blue-100">Help us improve TracePG</p>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Your feedback shapes the next study session.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">Tell us what is working, what needs attention, or what would make your preparation easier.</p>
          </div>
          <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-xl text-brand-600 shadow-lg"><FiHeart aria-hidden="true" /></span><div><p className="text-xs font-black uppercase tracking-[.16em] text-blue-100">Student-first</p><p className="mt-1 text-lg font-black">Every message is read.</p></div></div>
            <p className="mt-4 text-sm leading-6 text-blue-50">Share a real experience and help us keep TracePG focused, useful, and easy to trust.</p>
          </div>
        </div>
      </section>

      {(error || message) && <div className={`rounded-2xl border p-4 text-sm font-semibold ${error ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"}`} role="status">{error || message}</div>}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <form className="surface-card space-y-5 border-slate-200/80 shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:shadow-none" onSubmit={submit}>
          <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-xl text-brand-600 dark:bg-blue-950/40"><FiMessageSquare aria-hidden="true" /></span><div><p className="text-xs font-black uppercase tracking-[.16em] text-brand-600">Your voice matters</p><h2 className="mt-1 text-xl font-black">Share your thoughts</h2></div></div>
          <label className="block text-sm font-bold">Feedback type<select className="field mt-2" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <div>
            <p className="text-sm font-bold">How would you rate TracePG? <span className="font-normal text-slate-400">(optional)</span></p>
            <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((rating) => <button type="button" key={rating} className={`grid h-10 w-10 place-items-center rounded-xl border transition ${Number(form.rating) === rating ? "border-amber-400 bg-amber-50 text-amber-500 dark:bg-amber-950/40" : "border-slate-200 text-slate-400 hover:border-amber-300 hover:text-amber-400 dark:border-slate-700"}`} aria-label={`${rating} out of 5`} aria-pressed={Number(form.rating) === rating} onClick={() => setForm((current) => ({ ...current, rating: String(rating) }))}><FiStar className={Number(form.rating) >= rating ? "fill-current" : ""} aria-hidden="true" /></button>)}
            </div>
          </div>
          <label className="block text-sm font-bold">Your feedback<textarea className="field mt-2 min-h-36" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="Share a suggestion, issue, or experience…" minLength={10} maxLength={5000} required /></label>
          <label className="flex items-start gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300"><input className="mt-1" type="checkbox" checked={form.contactRequested} onChange={(event) => setForm((current) => ({ ...current, contactRequested: event.target.checked }))} /><span>I am happy for the TracePG team to contact me about this feedback.</span></label>
          <button className="primary-button inline-flex items-center gap-2" disabled={busy}><FiSend aria-hidden="true" /> {busy ? "Sending…" : "Send feedback"} {!busy && <FiArrowRight aria-hidden="true" />}</button>
        </form>

        <section className="surface-card h-fit border-slate-200/80 shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:shadow-none">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-brand-600 dark:bg-blue-950/40"><FiClock aria-hidden="true" /></span><div><p className="text-xs font-black uppercase tracking-[.16em] text-brand-600">Your voice</p><h2 className="mt-1 text-lg font-black">Recent feedback</h2></div></div>
          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/60 dark:bg-blue-950/30"><p className="flex items-start gap-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200"><FiCheckCircle className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" /> We use your feedback to improve the study experience.</p></div>
          {loading ? <p className="mt-5 text-sm font-semibold text-slate-500">Loading…</p> : history.length === 0 ? <p className="mt-5 text-sm leading-6 text-slate-500 dark:text-slate-400">Your submitted feedback will appear here.</p> : <div className="mt-5 space-y-3">{history.map((item) => <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950" key={item.id}><div className="flex items-center justify-between gap-2"><span className="tag">{item.category}</span><span className="text-xs font-bold capitalize text-slate-400">{item.status}</span></div><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.message}</p><p className="mt-2 text-xs font-semibold text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p></div>)}</div>}
        </section>
      </div>
    </div>
  );
}
