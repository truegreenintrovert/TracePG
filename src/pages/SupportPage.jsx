import { useEffect, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiClock, FiMail, FiPhone } from "react-icons/fi";
import SiteFooter from "../components/SiteFooter";
import SEO, { SITE_URL } from "../components/SEO";
import { getSupportPage } from "../data/supportContent";
import BrandLogo from "../components/BrandLogo";

export default function SupportPage({ page, onNavigate }) {
  const fallback = page || getSupportPage(window.location.pathname) || getSupportPage("/help-support");
  const [current, setCurrent] = useState(fallback);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/support-content?slug=${encodeURIComponent(fallback.slug)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (mounted && payload?.page) setCurrent({ ...fallback, ...payload.page });
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [fallback.slug]);

  const internalNavigate = (event, path) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(path);
  };

  const goBackToPreviousRoute = (event) => {
    event.preventDefault();
    const previousUrl = document.referrer;
    let hasSameOriginHistory = false;
    try {
      hasSameOriginHistory = Boolean(previousUrl) && new URL(previousUrl, window.location.href).origin === window.location.origin;
    } catch {
      hasSameOriginHistory = false;
    }
    if (hasSameOriginHistory && window.history.length > 1) {
      window.history.back();
      return;
    }
    if (onNavigate) {
      onNavigate("home");
      return;
    }
    window.location.assign("/");
  };

  const pagePath = current.path || {
    product: "/product",
    about: "/about-us",
    contact: "/contact-us",
    help: "/help-support",
    qa: "/qa",
  }[current.slug] || window.location.pathname;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${current.label} | TracePG`,
      url: `${SITE_URL}${pagePath}`,
      description: current.intro,
      isPartOf: { "@type": "WebSite", name: "TracePG", url: SITE_URL },
    },
    ...(current.slug === "qa" && current.faqs?.length
      ? [{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: current.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <SEO title={`${current.label} | TracePG`} description={current.intro} path={pagePath} structuredData={structuredData} />
      <header className="border-b border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between px-4 py-4 sm:px-6">
          <a href="/" aria-label="TracePG home" onClick={(event) => internalNavigate(event, "home")}>
            <BrandLogo iconClassName="h-9 w-9" wordmarkClassName="h-6 w-auto max-w-[150px]" />
          </a>
          <a className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700" href="/" onClick={goBackToPreviousRoute}><FiArrowLeft aria-hidden="true" /> Back</a>
        </div>
      </header>

      <main className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-600">TracePG · {current.label}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{current.title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{current.intro}</p>
          {current.updatedAt && <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Last updated: {new Date(current.updatedAt).toLocaleDateString()}</p>}
        </div>

        {(current.contactEmail || current.contactPhone || current.supportHours) && (
          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            {current.contactEmail && <ContactCard icon={FiMail} label="Email" value={current.contactEmail} href={`mailto:${current.contactEmail}`} />}
            {current.contactPhone && <ContactCard icon={FiPhone} label="Phone" value={current.contactPhone} href={`tel:${current.contactPhone}`} />}
            {current.supportHours && <ContactCard icon={FiClock} label="Support hours" value={current.supportHours} />}
          </section>
        )}

        {current.supportCtaUrl && current.supportCtaLabel && (
          <a className="primary-button mt-6 inline-flex items-center gap-2" href={current.supportCtaUrl}>{current.supportCtaLabel} <FiArrowRight aria-hidden="true" /></a>
        )}

        {current.sections?.length > 0 && (
          <div className="mt-10 max-w-3xl space-y-7">
            {current.sections.map(([heading, body], index) => (
              <section key={`${heading}-${index}`}>
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">{heading}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{body}</p>
              </section>
            ))}
          </div>
        )}

        {current.faqs?.length > 0 && (
          <section className="mt-10 max-w-3xl">
            <h2 className="text-2xl font-black tracking-tight">Common questions</h2>
            <div className="mt-5 space-y-3">
              {current.faqs.map((faq, index) => (
                <details className="surface-card group" key={`${faq.question}-${index}`}>
                  <summary className="cursor-pointer list-none pr-8 text-base font-extrabold marker:hidden">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600">{faq.category || "General"}</span>
                    <span className="mt-1 block">{faq.question}</span>
                  </summary>
                  <p className="mt-3 border-t border-slate-200 pt-3 text-sm leading-7 text-slate-600 dark:border-slate-700 dark:text-slate-300">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function ContactCard({ icon: Icon, label, value, href }) {
  const content = <><Icon className="mt-0.5 shrink-0 text-xl text-brand-600" aria-hidden="true" /><span><strong className="block text-xs uppercase tracking-wider text-slate-400">{label}</strong><span className="mt-1 block text-sm font-bold text-slate-700 dark:text-slate-200">{value}</span></span></>;
  return href ? <a className="surface-card flex gap-3" href={href}>{content}</a> : <div className="surface-card flex gap-3">{content}</div>;
}
