import { useEffect, useRef, useState } from "react";
import { FiActivity, FiArrowLeft, FiChevronDown, FiChevronUp, FiClock, FiGlobe, FiLogOut, FiMenu, FiMoon, FiSun, FiUser, FiZap } from "react-icons/fi";
import BrandLogo from "./BrandLogo";

const publicPages = [
  ["product", "Product"],
  ["about", "About Us"],
  ["contact", "Contact Us"],
  ["help", "Help & Support"],
  ["qa", "Q&A"],
];

export default function TopBar({ setView, theme, setTheme, user, isAdmin, adminMode = false, trialActive, testRunning, testTimeLabel, onOpenMenu, sidebarVisible, sidebarCollapsed, sidebarWidth = 256, onSignOut, onUpgrade, onOpenProfile, publicMode = false, onSignIn, backHref = "/", onBack }) {
  const sidebarOffset = sidebarVisible ? sidebarWidth : 0;
  return (
    <header style={{ "--tracepg-sidebar-offset": `${sidebarOffset}px` }} className="topbar-sidebar-offset sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur transition-[margin] duration-300 ease-out dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-2 px-3 sm:h-20 sm:gap-3 sm:px-6 lg:px-10">
        {!testRunning && (
          <button className="icon-button h-9 w-9 shrink-0 lg:hidden sm:h-10 sm:w-10" aria-label="Open navigation" onClick={onOpenMenu || (() => setView("menu"))}><FiMenu size={19} /></button>
        )}

        <BrandLogo className={`min-w-0 flex-1 ${sidebarVisible ? "lg:hidden" : ""}`} iconClassName="h-9 w-9 sm:h-12 sm:w-12" wordmarkClassName="h-5 w-auto max-w-[98px] sm:h-8 sm:max-w-[180px]" />

        {!testRunning && isAdmin && !adminMode && (
          <button className="ml-2 hidden items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-brand-300 hover:text-brand-600 sm:flex dark:border-slate-700 dark:text-slate-200" onClick={() => setView("admin")}><FiActivity size={16} /> Admin Dashboard</button>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {publicMode && <a className="inline-flex h-9 w-9 shrink-0 items-center justify-center gap-1 rounded-xl px-0 py-2 text-xs font-bold text-brand-600 transition hover:bg-blue-50 hover:text-brand-700 sm:h-auto sm:w-auto sm:justify-start sm:gap-1.5 sm:px-3 sm:text-sm dark:hover:bg-blue-950/40" href={backHref} aria-label="Back to TracePG" title="Back to TracePG" onClick={onBack}><FiArrowLeft aria-hidden="true" /><span className="hidden sm:inline">Back</span></a>}
          {!testRunning && trialActive && <button className="hidden rounded-xl bg-brand-600 px-3 py-2 text-xs font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-brand-700 sm:inline-flex sm:px-4 sm:py-2.5 sm:text-sm dark:shadow-none" onClick={onUpgrade}>Upgrade</button>}
          <button
            className="theme-icon-button h-9 w-9 sm:h-10 sm:w-10"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <FiMoon size={18} aria-hidden="true" /> : <FiSun size={18} aria-hidden="true" />}
          </button>

          {testRunning ? (
            <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-black tabular-nums text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200" aria-label="Test stopwatch">
              <FiClock size={16} aria-hidden="true" />
              <span>{testTimeLabel || "00:00"}</span>
            </div>
          ) : (
            publicMode && !user ? <button className="primary-button shrink-0 whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm" onClick={onSignIn}>Sign in</button> : <ProfileMenu user={user} setView={setView} trialActive={trialActive} onUpgrade={onUpgrade} onOpenProfile={onOpenProfile} onSignOut={onSignOut} />
          )}
        </div>
      </div>
    </header>
  );
}

function ProfileMenu({ user, setView, trialActive, onUpgrade, onOpenProfile, onSignOut }) {
  const [open, setOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const menuRef = useRef(null);
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || "Profile";
  const initials = displayName.slice(0, 1).toUpperCase();

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
        setPagesOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setPagesOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    setPagesOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 sm:h-11 sm:w-11 dark:shadow-none"
        aria-label="Open profile menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        {initials}
      </button>

      {open && (
        <div className="motion-popover absolute right-0 top-14 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900" role="menu" aria-label="Profile menu">
          <div className="border-b border-slate-100 px-3 pb-3 pt-2 dark:border-slate-800">
            <p className="truncate text-sm font-black text-slate-950 dark:text-white">{displayName}</p>
            <p className="mt-0.5 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>

          <button className="profile-menu-item mt-2 flex items-center gap-3" role="menuitem" onClick={() => { closeMenu(); onOpenProfile(); }}><FiUser size={17} aria-hidden="true" /> Profile</button>
          {trialActive && <button className="profile-menu-item flex items-center gap-3 text-brand-600" role="menuitem" onClick={() => { closeMenu(); onUpgrade(); }}><FiZap size={17} aria-hidden="true" /> Choose a premium plan</button>}
          <button className="profile-menu-item flex items-center justify-between" role="menuitem" aria-expanded={pagesOpen} onClick={() => setPagesOpen((current) => !current)}>
            <span className="flex items-center gap-3"><FiGlobe size={17} aria-hidden="true" /> Pages</span>
            {pagesOpen ? <FiChevronUp size={16} aria-hidden="true" /> : <FiChevronDown size={16} aria-hidden="true" />}
          </button>

          {pagesOpen && (
            <div className="ml-3 border-l border-slate-200 pl-2 dark:border-slate-700" aria-label="Public pages">
              {publicPages.map(([id, label]) => (
                <button key={id} className="profile-menu-item text-sm font-semibold" role="menuitem" onClick={() => { closeMenu(); setView(id); }}>
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
          <button className="profile-menu-item flex items-center gap-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40" role="menuitem" onClick={() => { closeMenu(); onSignOut(); }}><FiLogOut size={17} aria-hidden="true" /> Sign out</button>
        </div>
      )}
    </div>
  );
}
