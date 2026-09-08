import Sidebar from "./Sidebar";

export default function MobileNavigation({ open, ...sidebarProps }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button className="motion-backdrop absolute inset-0 bg-slate-950/40" aria-label="Close navigation" onClick={() => sidebarProps.setView("home")} />
      <aside className="scrollbar-invisible motion-drawer relative h-full w-80 max-w-[88vw] overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-900">
        <Sidebar {...sidebarProps} view="home" closeOnSelect />
      </aside>
    </div>
  );
}
