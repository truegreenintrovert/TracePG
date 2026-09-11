import { useCallback, useEffect, useState } from "react";
import MobileNavigation from "./MobileNavigation";
import ProfilePanel from "./ProfilePanel";
import Sidebar from "./Sidebar";
import AdminSidebar from "./AdminSidebar";
import SiteFooter from "./SiteFooter";
import TopBar from "./TopBar";
import TestExitPrompt from "./TestExitPrompt";
import SidebarResizeHandle from "./SidebarResizeHandle";

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
  adminMode = false,
  children,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isDragging, setIsDragging] = useState(false);
  const minWidth = 72;
  const maxWidth = 400;
  const defaultWidth = 256;
  const sidebarProps = { view, setView, isAdmin };
  const sidebarOffset = !testRunning ? sidebarWidth : 0;
  const NavigationSidebar = adminMode ? AdminSidebar : Sidebar;
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const navigateFromMobileMenu = useCallback((nextView, options) => {
    setMobileMenuOpen(false);
    setView(nextView, options);
  }, [setView]);

  const startResizing = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resize = useCallback((event) => {
    if (!isDragging) return;
    const newWidth = event.clientX;
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
      if (sidebarCollapsed && newWidth > minWidth + 10) setSidebarCollapsed(false);
    } else if (newWidth < minWidth) {
      setSidebarWidth(minWidth);
      setSidebarCollapsed(true);
    } else {
      setSidebarWidth(maxWidth);
    }
  }, [isDragging, sidebarCollapsed]);

  useEffect(() => {
    if (!isDragging) return undefined;
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isDragging, resize, stopResizing]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <TopBar
        setView={setView}
        theme={theme}
        setTheme={setTheme}
        user={user}
        isAdmin={isAdmin}
        adminMode={adminMode}
        trialActive={trialActive}
        testRunning={testRunning}
        testTimeLabel={testTimeLabel}
        onOpenMenu={() => setMobileMenuOpen(true)}
        sidebarVisible={!testRunning}
        sidebarCollapsed={sidebarCollapsed}
        sidebarWidth={sidebarWidth}
        onSignOut={onSignOut}
        onUpgrade={onUpgrade}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {!testRunning && <>
        <aside style={{ width: `${sidebarOffset}px`, "--tracepg-sidebar-offset": `${sidebarOffset}px` }} className="scrollbar-invisible fixed inset-y-0 left-0 z-40 hidden overflow-x-hidden overflow-y-auto border-r border-slate-200/80 bg-white/95 py-6 shadow-xl backdrop-blur transition-[width,padding] duration-300 ease-out lg:block dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-none"><NavigationSidebar {...sidebarProps} collapsed={sidebarCollapsed} onToggle={() => { setSidebarWidth(sidebarCollapsed ? defaultWidth : minWidth); setSidebarCollapsed((current) => !current); }} /></aside>
        <SidebarResizeHandle width={sidebarWidth} isDragging={isDragging} onStartResize={startResizing} />
      </>}
      <div style={{ "--tracepg-sidebar-offset": `${sidebarOffset}px` }} className="sidebar-content-offset transition-[margin] duration-300 ease-out">
        <div className="mx-auto flex max-w-[1240px]">
          <main key={view} className="page-transition min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">{children}</main>
        </div>
      </div>

      {!testRunning && <SiteFooter />}
      {!testRunning && <MobileNavigation open={mobileMenuOpen} adminMode={adminMode} {...sidebarProps} setView={navigateFromMobileMenu} view={view} onClose={closeMobileMenu} />}
      {profileOpen && <ProfilePanel user={user} onClose={() => setProfileOpen(false)} onSignOut={onSignOut} />}
      {testRunning && testExitPrompt && <TestExitPrompt onContinue={onContinueTest} />}
      {isDragging && <div className="fixed inset-0 z-50 cursor-col-resize select-none" />}
    </div>
  );
}
