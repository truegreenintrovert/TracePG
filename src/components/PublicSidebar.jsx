import {
  FiBox,
  FiChevronsLeft,
  FiChevronsRight,
  FiFileText,
  FiHelpCircle,
  FiHome,
  FiInfo,
  FiMail,
  FiMessageCircle,
  FiRefreshCw,
  FiShield,
  FiTruck,
  FiX,
} from "react-icons/fi";
import BrandLogo from "./BrandLogo";

const links = [
  ["home", "/", "Home", FiHome],
  ["product", "/product", "Product", FiBox],
  ["about", "/about-us", "About Us", FiInfo],
  ["contact", "/contact-us", "Contact Us", FiMail],
  ["help", "/help-support", "Help & Support", FiHelpCircle],
  ["qa", "/qa", "Q&A", FiMessageCircle],
  ["privacy", "/privacy", "Privacy Policy", FiShield],
  ["terms", "/terms", "Terms of Service", FiFileText],
  ["refund", "/refund-policy", "Refund Policy", FiRefreshCw],
  ["shipping", "/shipping-policy", "Shipping Policy", FiTruck],
];

export default function PublicSidebar({ view, onNavigate, collapsed = false, onToggle, closeOnSelect = false, onClose }) {
  const navigate = (id, path) => {
    if (closeOnSelect) onClose?.();
    if (["home", "product", "about", "contact", "help", "qa"].includes(id) && onNavigate) {
      onNavigate(id);
      return;
    }
    window.location.assign(path);
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className={`mb-6 flex min-h-10 items-center ${collapsed ? "justify-between" : "justify-between"}`}>
        {collapsed ? <img className="h-10 w-10 object-contain" src="/trace-logo-square.png" alt="TracePG" /> : <div className="min-w-0"><BrandLogo iconClassName="h-9 w-9" wordmarkClassName="h-6 w-auto max-w-[138px]" /><p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Study smarter, stay consistent</p></div>}
        {closeOnSelect ? <button type="button" className="icon-button relative z-[70]" aria-label="Close navigation" onClick={onClose}><FiX size={19} /></button> : onToggle && <button type="button" className={`icon-button relative z-[70] shrink-0 ${collapsed ? "h-9 w-9" : ""}`} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onToggle(); }}>{collapsed ? <FiChevronsRight size={19} /> : <FiChevronsLeft size={19} />}</button>}
      </div>

      <nav className="space-y-1" aria-label="Public navigation">
        {links.map(([id, path, label, Icon]) => (
          <button
            type="button"
            key={id}
            className={`nav-item ${collapsed ? "justify-center px-0" : ""} ${view === id ? "nav-item-active" : ""}`}
            title={collapsed ? label : undefined}
            aria-label={collapsed ? label : undefined}
            aria-current={view === id ? "page" : undefined}
            onClick={() => navigate(id, path)}
          >
            <Icon className="shrink-0 text-[18px]" aria-hidden="true" />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
