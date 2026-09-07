import { useEffect, useState } from "react";
import { FiMessageSquare } from "react-icons/fi";
import { adminFetch } from "../lib/adminApi";

export default function FeedbackManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const payload = await adminFetch("/api/admin/feedback");
      setItems(payload.feedback || []);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (item, status) => {
    try {
      await adminFetch("/api/admin/feedback", { method: "PUT", body: JSON.stringify({ id: item.id, status, adminNote: item.adminNote }) });
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status } : entry));
    } catch (updateError) {
      setError(updateError.message);
    }
  };

  return (
    <section className="surface-card">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><FiMessageSquare className="text-brand-600" aria-hidden="true" /><h2 className="text-xl font-black">Student feedback</h2></div><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review suggestions, issues, and requests from learners.</p></div><span className="tag">{items.length} entries</span></div>
      {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
      {loading ? <p className="mt-5 text-sm font-semibold text-slate-500">Loading feedback…</p> : items.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-slate-950 dark:text-slate-400">No student feedback yet.</p> : <div className="mt-5 space-y-4">{items.map((item) => <article className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700" key={item.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="tag tag-blue">{item.category}</span><span className="text-xs font-bold text-amber-500">{item.rating ? `${item.rating}/5` : "No rating"}</span></div><p className="mt-2 text-xs font-semibold text-slate-400">{item.email} · {new Date(item.createdAt).toLocaleString()} {item.contactRequested ? "· Requested contact" : ""}</p></div><select className="field w-auto py-2 text-xs" value={item.status} onChange={(event) => updateStatus(item, event.target.value)}><option value="new">New</option><option value="reviewed">Reviewed</option><option value="resolved">Resolved</option></select></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">{item.message}</p></article>)}</div>}
    </section>
  );
}
