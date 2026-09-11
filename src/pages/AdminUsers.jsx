import { useEffect, useState } from "react";
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiRefreshCw, FiSearch, FiUsers } from "react-icons/fi";
import { adminFetch } from "../lib/adminApi";

const PAGE_SIZE = 35;

const filters = [
  ["all", "All users", "totalUsers"],
  ["lifetime", "Lifetime", "lifetime"],
  ["yearly", "1 year", "yearly"],
  ["two_year", "2 years", "twoYear"],
  ["three_year", "3 years", "threeYear"],
  ["five_year", "5 years", "fiveYear"],
];

const planLabels = {
  lifetime: "Lifetime",
  yearly: "1 Year",
  two_year: "2 Years",
  three_year: "3 Years",
  five_year: "5 Years",
};

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

export default function AdminUsers({ onBack }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [data, setData] = useState({ users: [], summary: null });
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const loadUsers = async (nextFilter = filter) => {
    setBusy(true);
    setError("");
    try {
      const payload = await adminFetch(`/api/admin/users?plan=${encodeURIComponent(nextFilter)}`);
      setData(payload);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const matchingUsers = data.users.filter((user) =>
    `${user.displayName} ${user.email}`.toLowerCase().includes(search.toLowerCase().trim()),
  );
  const pageCount = Math.max(1, Math.ceil(matchingUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleUsers = matchingUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const firstVisible = matchingUsers.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const lastVisible = Math.min(currentPage * PAGE_SIZE, matchingUsers.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-brand-600">Admin tools</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">View users</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">See who has premium access and which plan they purchased.</p>
        </div>
        <button className="secondary-button inline-flex items-center gap-2" onClick={onBack}>
          <FiArrowLeft aria-hidden="true" /> Admin Dashboard
        </button>
      </div>

      {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {filters.map(([id, label, summaryKey]) => (
          <button
            className={`rounded-2xl border p-4 text-left transition ${filter === id ? "border-brand-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/40" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"}`}
            key={id}
            onClick={() => {
              setFilter(id);
              loadUsers(id);
            }}
          >
            <span className="block text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
            <strong className="mt-2 block text-2xl font-black">{data.summary?.[summaryKey] ?? "—"}</strong>
          </button>
        ))}
      </div>

      <div className="surface-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[240px] flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input className="field pl-10" aria-label="Search users" placeholder="Search by name or email" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <button className="secondary-button inline-flex items-center gap-2" onClick={() => loadUsers()} disabled={busy}>
            <FiRefreshCw aria-hidden="true" /> Refresh
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="px-3 py-3">User</th>
                <th className="px-3 py-3">Access plan</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Expires</th>
                <th className="px-3 py-3">Joined</th>
                <th className="px-3 py-3">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {busy ? (
                <tr><td className="px-3 py-8 text-center text-slate-500" colSpan="6">Loading users…</td></tr>
              ) : visibleUsers.length ? (
                visibleUsers.map((user) => (
                  <tr className="border-b border-slate-100 last:border-0 dark:border-slate-800" key={user.id}>
                    <td className="px-3 py-4"><p className="font-black">{user.displayName || "Unnamed user"}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{user.email || "No email"}</p></td>
                    <td className="px-3 py-4 font-bold">{planLabels[user.planId] || "No premium plan"}</td>
                    <td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${user.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : user.status === "expired" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{user.status}</span></td>
                    <td className="px-3 py-4 font-semibold">{user.planId === "lifetime" ? "Never" : formatDate(user.expiresAt)}</td>
                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{formatDate(user.createdAt)}</td>
                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{formatDate(user.lastSeenAt)}</td>
                  </tr>
                ))
              ) : (
                <tr><td className="px-3 py-8 text-center text-slate-500" colSpan="6"><FiUsers className="mx-auto mb-2 text-2xl" aria-hidden="true" />No users found for this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-700">
          <p className="font-semibold text-slate-500 dark:text-slate-400">Showing {firstVisible}–{lastVisible} of {matchingUsers.length} users</p>
          <div className="flex items-center gap-2">
            <button className="secondary-button inline-flex items-center gap-1 px-3" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={busy || currentPage === 1}>
              <FiChevronLeft aria-hidden="true" /> Previous
            </button>
            <span className="px-2 font-black text-slate-600 dark:text-slate-300">Page {currentPage} of {pageCount}</span>
            <button className="secondary-button inline-flex items-center gap-1 px-3" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={busy || currentPage === pageCount}>
              Next <FiChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
