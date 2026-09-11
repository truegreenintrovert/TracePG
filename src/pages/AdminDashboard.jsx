import { useEffect, useState } from "react";
import { FiArrowRight, FiBookOpen, FiFileText, FiMessageSquare, FiShield, FiTag, FiUploadCloud, FiUsers } from "react-icons/fi";
import { adminFetch } from "../lib/adminApi";

const tools = [
  ["admin-users", "View users", "See lifetime and timed premium access by plan.", FiUsers],
  ["admin-questions", "Manage questions", "Add and maintain the main question bank.", FiBookOpen],
  ["admin-pyqs", "Manage PYQ papers", "Add previous-year questions and papers.", FiFileText],
  ["admin-bulk", "Bulk upload", "Import question and PYQ files in one workflow.", FiUploadCloud],
  ["admin-support", "Public pages", "Update product and support content.", FiMessageSquare],
  ["admin-discounts", "Discount codes", "Create and manage checkout offers.", FiTag],
  ["admin-policies", "Policies", "Keep the legal pages current.", FiShield],
  ["admin-feedback", "Feedback", "Review learner feedback and requests.", FiMessageSquare],
];

export default function AdminDashboard({ onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch("/api/admin/users")
      .then((payload) => setSummary(payload.summary))
      .catch((loadError) => setError(loadError.message));
  }, []);

  const stats = summary ? [
    [summary.totalUsers, "Total users"],
    [summary.activePremium, "Active premium"],
    [summary.lifetime, "Lifetime"],
    [summary.yearly + summary.twoYear + summary.threeYear + summary.fiveYear, "Timed plans"],
  ] : [["—", "Total users"], ["—", "Active premium"], ["—", "Lifetime"], ["—", "Timed plans"]];

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-black uppercase tracking-[.2em] text-brand-600">Admin workspace</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Admin Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Manage TracePG content, users, access plans, public pages, and feedback from one place.</p>
      </div>
      {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([value, label]) => <div className="stat-card" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
      <section>
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Workspace shortcuts</p><h2 className="mt-2 text-2xl font-black">Choose an admin tool</h2></div><button className="secondary-button hidden items-center gap-2 sm:inline-flex" onClick={() => onNavigate("home")}>Student Dashboard <FiArrowRight aria-hidden="true" /></button></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{tools.map(([id, title, description, Icon]) => <button key={id} className="surface-card text-left transition hover:-translate-y-0.5 hover:border-blue-300" onClick={() => onNavigate(id)}><div className="flex items-start justify-between gap-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-xl text-brand-600 dark:bg-blue-950/50 dark:text-blue-200"><Icon aria-hidden="true" /></span><FiArrowRight className="mt-2 text-slate-400" aria-hidden="true" /></div><h3 className="mt-5 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p></button>)}</div>
      </section>
    </div>
  );
}
