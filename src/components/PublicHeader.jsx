import { useEffect, useRef, useState } from "react";
import { FiArrowRight, FiChevronDown, FiChevronUp, FiMenu } from "react-icons/fi";
import BrandLogo from "./BrandLogo";

const publicLinks = [
  ["/", "Home"],
  ["/product", "Product"],
  ["/about-us", "About Us"],
  ["/contact-us", "Contact Us"],
  ["/qa", "Q&A"],
];

const policyLinks = [
  ["/privacy", "Privacy Policy"],
  ["/terms", "Terms of Service"],
  ["/refund-policy", "Refund Policy"],
  ["/shipping-policy", "Shipping Policy"],
];

export default function PublicHeader({ onSignIn, onMenu }) {
  const [policyOpen, setPolicyOpen] = useState(false);
  const policyRef = useRef(null);

  useEffect(() => {
    if (!policyOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!policyRef.current?.contains(event.target)) setPolicyOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setPolicyOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [policyOpen]);

  return (
    <header className="border-b border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-5 px-4 py-4 sm:px-6 lg:px-10">
        <a className="shrink-0" href="/" aria-label="TracePG home">
          <BrandLogo iconClassName="h-9 w-9 sm:h-10 sm:w-10" wordmarkClassName="h-6 w-auto max-w-[145px] sm:h-7 sm:max-w-[175px]" />
        </a>
        <nav style={{ fontFamily: '"Inter", "Segoe UI", Arial, sans-serif' }} className="hidden flex-1 items-center justify-center gap-4 text-sm font-bold text-slate-600 lg:flex xl:gap-5 dark:text-slate-300" aria-label="Public navigation">
          {publicLinks.map(([href, label]) => <a key={href} className="whitespace-nowrap transition hover:text-brand-600" href={href}>{label}</a>)}
          <div className="relative" ref={policyRef}>
            <button type="button" className="inline-flex items-center gap-1 whitespace-nowrap transition hover:text-brand-600" aria-expanded={policyOpen} aria-haspopup="menu" onClick={() => setPolicyOpen((current) => !current)}>
              Policy {policyOpen ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
            </button>
            {policyOpen && <div className="motion-popover absolute right-0 top-8 z-50 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900" role="menu" aria-label="Policy pages">
              {policyLinks.map(([href, label]) => <a key={href} className="block rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-brand-600 dark:text-slate-200 dark:hover:bg-slate-800" href={href} role="menuitem" onClick={() => setPolicyOpen(false)}>{label}</a>)}
            </div>}
          </div>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button type="button" className="primary-button inline-flex items-center gap-2 px-3 text-xs sm:px-4 sm:text-sm" onClick={onSignIn}>Sign in <FiArrowRight aria-hidden="true" /></button>
          {onMenu && <button type="button" className="icon-button h-10 w-10 lg:hidden" aria-label="Open public navigation" onClick={onMenu}><FiMenu size={19} /></button>}
        </div>
      </div>
    </header>
  );
}
