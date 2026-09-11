import {
  FiArrowLeft,
  FiBarChart2,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiGlobe,
  FiMessageSquare,
  FiShield,
  FiTag,
  FiUploadCloud,
  FiUsers,
} from "react-icons/fi";
import BrandLogo from "./BrandLogo";

const navigation = [
  ["admin", FiBarChart2, "Admin Dashboard"],
  ["admin-users", FiUsers, "View Users"],
  ["admin-questions", FiBookOpen, "Questions"],
  ["admin-pyqs", FiFileText, "PYQ Papers"],
  ["admin-bulk", FiUploadCloud, "Bulk Upload"],
  ["admin-support", FiGlobe, "Public Pages"],
  ["admin-policies", FiShield, "Policies"],
  ["admin-discounts", FiTag, "Discount Codes"],
  ["admin-feedback", FiMessageSquare, "Feedback"],
];

export default function AdminSidebar({ view, setView, collapsed = false, onToggle, closeOnSelect = false, onClose }) {
  const renderItem = ([id, Icon, label]) => (
    <button
      key={id}
      className={`nav-item ${collapsed ? "justify-center px-0" : ""} ${view === id ? "nav-item-active" : ""}`}
      onClick={() => setView(id)}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      aria-current={view === id ? "page" : undefined}
    >
      <Icon className="shrink-0 text-[18px]" aria-hidden="true" />
      {!collapsed && <span>{label}</span>}
    </button>
  );

  return (
    <div>
      <div className={`mb-6 flex min-h-10 items-center ${collapsed ? "justify-between" : "justify-between"}`}>
        {!collapsed ? <div className="min-w-0"><BrandLogo iconClassName="h-9 w-9" wordmarkClassName="h-6 w-auto max-w-[138px]" /><p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Admin workspace</p></div> : <img className="h-10 w-10 object-contain" src="/trace-logo-square.png" alt="TracePG" />}
        {closeOnSelect ? <button type="button" className="icon-button relative z-[70]" aria-label="Close navigation" onClick={onClose || (() => setView("admin"))}><FiArrowLeft size={18} /></button> : onToggle && <button type="button" className={`icon-button relative z-[70] shrink-0 ${collapsed ? "h-9 w-9" : ""}`} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onToggle(); }}>{collapsed ? <FiChevronRight size={19} /> : <FiChevronLeft size={19} />}</button>}
      </div>
      <div className="mb-4 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
        <button className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-black transition ${collapsed ? "justify-center px-0" : ""}`} onClick={() => setView("home")} title={collapsed ? "Student Dashboard" : undefined} aria-label={collapsed ? "Student Dashboard" : undefined}>
          <FiArrowLeft className="shrink-0 text-[18px]" aria-hidden="true" />
          {!collapsed && <span>Student Dashboard</span>}
        </button>
      </div>
      {!collapsed && <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[.18em] text-slate-400">Admin tools</p>}
      <nav className="space-y-1" aria-label="Admin navigation">{navigation.map(renderItem)}</nav>
    </div>
  );
}
