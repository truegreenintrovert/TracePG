import {
  FiActivity,
  FiBarChart2,
  FiBookOpen,
  FiCheckCircle,
  FiClipboard,
  FiFileText,
  FiMessageSquare,
  FiHome,
  FiRepeat,
  FiTarget,
  FiX,
  FiXCircle,
} from "react-icons/fi";

const navigation = [
  ["home", FiHome, "Dashboard"],
  ["bank", FiBookOpen, "Question Bank"],
  ["test", FiTarget, "Create Test"],
  ["wrong", FiXCircle, "Wrong Questions"],
  ["history", FiClipboard, "History"],
  ["analytics", FiBarChart2, "Analytics"],
  ["revision", FiRepeat, "Smart Revision"],
  ["papers", FiFileText, "PYQ Papers"],
  ["notes", FiCheckCircle, "Notes"],
  ["feedback", FiMessageSquare, "Feedback"],
];

export default function Sidebar({
  view,
  setView,
  closeOnSelect = false,
  isAdmin,
}) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="min-w-0">
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Study smarter, stay consistent</p>
        </div>
        {closeOnSelect && <button className="icon-button" aria-label="Close navigation" onClick={() => setView("home")}><FiX size={19} /></button>}
      </div>
      <nav className="space-y-1" aria-label="Main navigation">
        {navigation.map(([id, Icon, label]) => (
          <button key={id} className={`nav-item ${view === id ? "nav-item-active" : ""}`} onClick={() => setView(id)}>
            <Icon className="shrink-0 text-[18px]" aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
        {isAdmin && <button className={`nav-item ${view === "admin" ? "nav-item-active" : ""}`} onClick={() => setView("admin")}><FiActivity className="shrink-0 text-[18px]" aria-hidden="true" /><span>Admin panel</span></button>}
      </nav>
    </div>
  );
}
