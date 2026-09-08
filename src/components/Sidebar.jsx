import {
  FiActivity,
  FiBarChart2,
  FiBookOpen,
  FiCheckCircle,
  FiChevronsLeft,
  FiChevronsRight,
  FiClipboard,
  FiFileText,
  FiMessageSquare,
  FiHome,
  FiRepeat,
  FiTarget,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import BrandLogo from "./BrandLogo";

const navigation = [
  ["home", FiHome, "Dashboard"],
  ["bank", FiBookOpen, "Question Bank"],
  ["test", FiTarget, "Create Test"],
  ["papers", FiFileText, "PYQ Papers"],
  ["wrong", FiXCircle, "Wrong Questions"],
  ["history", FiClipboard, "History"],
  ["analytics", FiBarChart2, "Analytics"],
  ["revision", FiRepeat, "Smart Revision"],
  ["notes", FiCheckCircle, "Notes"],
  ["feedback", FiMessageSquare, "Feedback"],
];

export default function Sidebar({
  view,
  setView,
  closeOnSelect = false,
  isAdmin,
  collapsed = false,
  onToggle,
  onClose,
}) {
  const renderNavigationItem = (id, Icon, label) => (
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
        {!collapsed ? <div className="min-w-0">
          <BrandLogo iconClassName="h-9 w-9" wordmarkClassName="h-6 w-auto max-w-[138px]" />
          <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Study smarter, stay consistent</p>
        </div> : <img className="h-10 w-10 object-contain" src="/trace-logo-square.png" alt="TracePG" />}
        {closeOnSelect ? <button type="button" className="icon-button relative z-[70]" aria-label="Close navigation" onClick={onClose || (() => setView("home"))}><FiX size={19} /></button> : onToggle && <button type="button" className={`icon-button relative z-[70] shrink-0 ${collapsed ? "h-9 w-9" : ""}`} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onToggle(); }}>{collapsed ? <FiChevronsRight size={19} /> : <FiChevronsLeft size={19} />}</button>}
      </div>
      <nav className="space-y-1" aria-label="Main navigation">
        {navigation.map(([id, Icon, label]) => renderNavigationItem(id, Icon, label))}
        {isAdmin && renderNavigationItem("admin", FiActivity, "Admin panel")}
      </nav>
    </div>
  );
}
