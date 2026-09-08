import { useCallback, useEffect, useState } from "react";
import ProfilePanel from "./ProfilePanel";
import PublicHeader from "./PublicHeader";
import PublicSidebar from "./PublicSidebar";
import Sidebar from "./Sidebar";
import SidebarResizeHandle from "./SidebarResizeHandle";
import TopBar from "./TopBar";

export default function PublicTopBar({ view, user, theme, setTheme, onNavigate, onSignIn, onSignOut, onUpgrade, isAdmin, trialActive }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isDragging, setIsDragging] = useState(false);
  const minWidth = 72;
  const maxWidth = 400;
  const defaultWidth = 256;
  // Guests use the full-width public topbar on desktop; the public links remain available in the mobile drawer.
  const sidebarVisible = Boolean(user);
  const sidebarOffset = sidebarVisible ? sidebarWidth : 0;
  const NavigationSidebar = user ? Sidebar : PublicSidebar;
  const setView = (nextView) => {
    if (nextView === "menu") {
      setSidebarOpen(true);
      return;
    }
    if (onNavigate) {
      onNavigate(nextView);
      return;
    }
    const publicPaths = { home: "/", product: "/product", about: "/about-us", contact: "/contact-us", help: "/help-support", qa: "/qa" };
    if (publicPaths[nextView]) {
      window.location.assign(publicPaths[nextView]);
      return;
    }
    onSignIn?.();
  };

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

  useEffect(() => {
    document.documentElement.style.setProperty("--tracepg-public-sidebar-offset", `${sidebarOffset}px`);
    return () => document.documentElement.style.setProperty("--tracepg-public-sidebar-offset", "0px");
  }, [sidebarOffset]);

  const goHome = (event) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate("home");
  };

  if (!user) {
    return (
      <>
        <PublicHeader onSignIn={onSignIn} onMenu={() => setSidebarOpen(true)} />
        {sidebarOpen && <div className="fixed inset-0 z-[60] lg:hidden"><button className="motion-backdrop absolute inset-0 h-full w-full bg-slate-950/40" aria-label="Close public navigation" onClick={() => setSidebarOpen(false)} /><aside className="motion-drawer scrollbar-invisible absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-slate-200 bg-white px-4 py-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950"><PublicSidebar view={view} onNavigate={(nextView) => { setSidebarOpen(false); setView(nextView); }} closeOnSelect onClose={() => setSidebarOpen(false)} /></aside></div>}
      </>
    );
  }

  return (
    <>
      <TopBar
        setView={setView}
        theme={theme}
        setTheme={setTheme}
        user={user}
        isAdmin={isAdmin}
        trialActive={trialActive}
        testRunning={false}
        testTimeLabel=""
        sidebarVisible={sidebarVisible}
        sidebarCollapsed={sidebarCollapsed}
        sidebarWidth={sidebarWidth}
        onSignOut={onSignOut}
        onUpgrade={onUpgrade}
        onOpenProfile={() => setProfileOpen(true)}
        publicMode
        onSignIn={onSignIn}
        backHref="/"
        onBack={goHome}
      />
      {sidebarVisible && <>
        <aside style={{ width: `${sidebarWidth}px`, "--tracepg-sidebar-offset": `${sidebarWidth}px` }} className="scrollbar-invisible fixed inset-y-0 left-0 z-40 hidden overflow-x-hidden overflow-y-auto border-r border-slate-200/80 bg-white/95 py-6 shadow-xl backdrop-blur transition-[width,padding] duration-300 ease-out lg:block dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-none"><NavigationSidebar view={view} setView={setView} onNavigate={setView} isAdmin={isAdmin} collapsed={sidebarCollapsed} onToggle={() => { setSidebarWidth(sidebarCollapsed ? defaultWidth : minWidth); setSidebarCollapsed((current) => !current); }} /></aside>
        <SidebarResizeHandle width={sidebarWidth} isDragging={isDragging} onStartResize={startResizing} />
      </>}
      {sidebarOpen && <div className="fixed inset-0 z-[60] lg:hidden"><button className="motion-backdrop absolute inset-0 h-full w-full bg-slate-950/40" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} /><aside className="motion-drawer scrollbar-invisible absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-slate-200 bg-white px-4 py-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950"><NavigationSidebar view={view} setView={setView} onNavigate={(nextView) => { setSidebarOpen(false); setView(nextView); }} isAdmin={isAdmin} closeOnSelect onClose={() => setSidebarOpen(false)} /></aside></div>}
      {profileOpen && user && <ProfilePanel user={user} onClose={() => setProfileOpen(false)} onSignOut={onSignOut} />}
      {isDragging && <div className="fixed inset-0 z-50 cursor-col-resize select-none" />}
    </>
  );
}
