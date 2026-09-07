import { useState } from "react";
import MobileNavigation from "./MobileNavigation";
import ProfilePanel from "./ProfilePanel";
import Sidebar from "./Sidebar";
import SiteFooter from "./SiteFooter";
import TopBar from "./TopBar";
import TestExitPrompt from "./TestExitPrompt";

export default function AppShell({
  view,
  setView,
  theme,
  setTheme,
  user,
  isAdmin,
  trialActive,
  testRunning,
  testTimeLabel,
  testExitPrompt,
  onContinueTest,
  onSignOut,
  onUpgrade,
  children,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const sidebarProps = { view, setView, isAdmin };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <TopBar
        setView={setView}
        theme={theme}
        setTheme={setTheme}
        user={user}
        isAdmin={isAdmin}
        trialActive={trialActive}
        testRunning={testRunning}
        testTimeLabel={testTimeLabel}
        onSignOut={onSignOut}
        onUpgrade={onUpgrade}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <div className="mx-auto flex max-w-[1240px]">
        {!testRunning && <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 self-start overflow-y-auto border-r border-slate-200/80 px-4 py-6 lg:block dark:border-slate-800"><Sidebar {...sidebarProps} /></aside>}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">{children}</main>
      </div>

      {!testRunning && <SiteFooter />}
      {!testRunning && <MobileNavigation open={view === "menu"} {...sidebarProps} />}
      {profileOpen && <ProfilePanel user={user} onClose={() => setProfileOpen(false)} onSignOut={onSignOut} />}
      {testRunning && testExitPrompt && <TestExitPrompt onContinue={onContinueTest} />}
    </div>
  );
}
