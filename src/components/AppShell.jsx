import { useState } from "react";
import ProfilePanel from "./ProfilePanel";
import SiteFooter from "./SiteFooter";

const navigation = [
  ["home", "🏠", "Dashboard"],
  ["bank", "📚", "Question Bank"],
  ["test", "🎯", "Create Test"],
  ["wrong", "❌", "Wrong Questions"],
  ["history", "📊", "History"],
  ["analytics", "📈", "Analytics"],
  ["revision", "🔁", "Smart Revision"],
  ["papers", "📜", "PYQ Papers"],
  ["notes", "📝", "Notes"],
  ["help", "❓", "Help & Support"],
  ["qa", "💬", "Q&A"],
];

export default function AppShell({
  view,
  setView,
  theme,
  setTheme,
  syncStatus,
  user,
  isAdmin,
  onSignOut,
  children,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "T";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex min-h-16 max-w-[1240px] items-center gap-3 px-4 sm:px-6">
          <button
            className="icon-button"
            aria-label="Open navigation"
            onClick={() => setView("menu")}
          >
            ☰
          </button>
          <button
            className="flex items-center gap-2 text-left"
            onClick={() => setView("home")}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg shadow-lg shadow-blue-200 dark:shadow-none">
              🩺
            </span>
            <span className="text-base font-extrabold tracking-tight sm:text-lg">
              TracePG
            </span>
          </button>
          {isAdmin && (
            <button
              className="secondary-button px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm"
              onClick={() => setView("admin")}
              title="Open admin panel"
            >
              <span aria-hidden="true">🛠️</span>
              <span>Admin</span>
            </button>
          )}
          <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {syncStatus}
          </span>
          <button
            className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 dark:shadow-none"
            aria-label="Open profile"
            title={user?.email}
            onClick={() => setProfileOpen(true)}
          >
            {displayName.slice(0, 1).toUpperCase()}
          </button>
          <button className="secondary-button hidden sm:block" onClick={onSignOut} title={user?.email}>
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1240px]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 px-4 py-6 lg:block dark:border-slate-800">
          <Sidebar
            view={view}
            setView={setView}
            theme={theme}
            setTheme={setTheme}
            user={user}
            isAdmin={isAdmin}
            onSignOut={onSignOut}
          />
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          {children}
        </main>
      </div>

      <SiteFooter />

      {view === "menu" && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/40"
            aria-label="Close navigation"
            onClick={() => setView("home")}
          />
          <aside className="relative h-full w-80 max-w-[88vw] overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-900">
            <Sidebar
              view="home"
              setView={setView}
              theme={theme}
              setTheme={setTheme}
              closeOnSelect
              user={user}
              isAdmin={isAdmin}
              onSignOut={onSignOut}
            />
          </aside>
        </div>
      )}
      {profileOpen && <ProfilePanel user={user} onClose={() => setProfileOpen(false)} onSignOut={onSignOut} />}
    </div>
  );
}

function Sidebar({ view, setView, theme, setTheme, closeOnSelect = false, user, isAdmin, onSignOut }) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-600">
            Study HQ
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Your preparation cockpit
          </p>
        </div>
        {closeOnSelect && (
          <button
            className="icon-button"
            aria-label="Close navigation"
            onClick={() => setView("home")}
          >
            ×
          </button>
        )}
      </div>
      <nav className="space-y-1" aria-label="Main navigation">
        {navigation.map(([id, icon, label]) => (
          <button
            key={id}
            className={`nav-item ${view === id ? "nav-item-active" : ""}`}
            onClick={() => setView(id)}
          >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
        {isAdmin && (
          <button
            className={`nav-item ${view === "admin" ? "nav-item-active" : ""}`}
            onClick={() => setView("admin")}
          >
            <span className="text-base">🛠️</span>
            <span>Admin panel</span>
          </button>
        )}
      </nav>
      <div className="mt-8 border-t border-slate-200 pt-5 dark:border-slate-800">
        <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400" title={user?.email}>
          {user?.email}
        </p>
        <button className="mt-3 w-full text-left text-sm font-bold text-rose-600 hover:text-rose-700" onClick={onSignOut}>
          Sign out
        </button>
      </div>
      <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-800">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Appearance
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`mode-button ${theme === "light" ? "mode-button-active" : ""}`}
            onClick={() => setTheme("light")}
          >
            ☀️ Light
          </button>
          <button
            className={`mode-button ${theme === "dark" ? "mode-button-active" : ""}`}
            onClick={() => setTheme("dark")}
          >
            🌙 Dark
          </button>
        </div>
      </div>
    </div>
  );
}
