export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <p>© {new Date().getFullYear()} TracePG. Study smarter, stay consistent.</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 font-semibold" aria-label="Site links">
          <a className="transition hover:text-brand-600" href="/product">Product</a>
          <a className="transition hover:text-brand-600" href="/about-us">About Us</a>
          <a className="transition hover:text-brand-600" href="/contact-us">Contact Us</a>
          <a className="transition hover:text-brand-600" href="/help-support">Help & Support</a>
          <a className="transition hover:text-brand-600" href="/qa">Q&A</a>
          <a className="transition hover:text-brand-600" href="/privacy">Privacy Policy</a>
          <a className="transition hover:text-brand-600" href="/terms">Terms of Service</a>
          <a className="transition hover:text-brand-600" href="/refund-policy">Refund Policy</a>
          <a className="transition hover:text-brand-600" href="/shipping-policy">Shipping Policy</a>
        </nav>
      </div>
    </footer>
  );
}
