import Sidebar from "./Sidebar";
import AdminSidebar from "./AdminSidebar";

export default function MobileNavigation({ open, adminMode = false, view, onClose, ...sidebarProps }) {
  if (!open) return null;

  const NavigationSidebar = adminMode ? AdminSidebar : Sidebar;
  const closeNavigation = onClose || (() => sidebarProps.setView(adminMode ? "admin" : "home"));

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button className="motion-backdrop absolute inset-0 bg-slate-950/40" aria-label="Close navigation" onClick={closeNavigation} />
      <aside className="scrollbar-invisible motion-drawer relative h-full w-80 max-w-[88vw] overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-900">
        <NavigationSidebar {...sidebarProps} view={view || (adminMode ? "admin" : "home")} closeOnSelect onClose={closeNavigation} />
      </aside>
    </div>
  );
}
