import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiHelpCircle,
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiShield,
  FiUser,
} from "react-icons/fi";
import SiteFooter from "../components/SiteFooter";
import SEO, { SITE_URL } from "../components/SEO";
import { getSupportPage } from "../data/supportContent";
import PublicTopBar from "../components/PublicTopBar";

const fallback = getSupportPage(window.location.pathname) || getSupportPage("/help-support");

const PAGE_META = {
  about: {
    eyebrow: "About TracePG",
    badge: "Focused preparation",
    icon: FiShield,
    sideTitle: "Built for a steady study rhythm",
    sideBody: "A calm workspace for practice, review, and measurable progress.",
  },
  contact: {
    eyebrow: "Contact TracePG",
    badge: "We’re here to help",
    icon: FiMessageCircle,
    sideTitle: "Let’s keep your preparation moving",
    sideBody: "Share a question, issue, or suggestion and we’ll help you find the next step.",
  },
  help: {
    eyebrow: "TracePG support",
    badge: "Quick help",
    icon: FiHelpCircle,
    sideTitle: "Find your answer faster",
    sideBody: "Simple guidance for getting started, managing your account, and using tests.",
  },
  qa: {
    eyebrow: "TracePG answers",
    badge: "Common questions",
    icon: FiBookOpen,
    sideTitle: "Everything in one place",
    sideBody: "Browse clear answers about your account and study workspace.",
  },
};

export default function SupportPage({ page, onNavigate, user, theme, setTheme, onSignIn, onSignOut, onUpgrade, isAdmin, trialActive, view }) {
  const initialPage = page || fallback;
  const [current, setCurrent] = useState(initialPage);
  const meta = PAGE_META[current.slug] || PAGE_META.help;
  const MetaIcon = meta.icon;

  useEffect(() => {
    let mounted = true;
    fetch(`/api/support-content?slug=${encodeURIComponent(initialPage.slug)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (mounted && payload?.page) setCurrent({ ...initialPage, ...payload.page });
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [initialPage.slug]);

  const internalNavigate = (event, view) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(view);
  };

  const pagePath = current.path || {
    about: "/about-us",
    contact: "/contact-us",
    help: "/help-support",
    qa: "/qa",
  }[current.slug] || window.location.pathname;
  const sections = current.sections || [];
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
      <PublicTopBar view={view} user={user} theme={theme} setTheme={setTheme} onNavigate={onNavigate} onSignIn={onSignIn} onSignOut={onSignOut} onUpgrade={onUpgrade} isAdmin={isAdmin} trialActive={trialActive} />

      <main className="public-page-content max-w-[1160px] px-4 py-8 sm:px-6 sm:py-14">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_-35px_rgba(15,23,42,.35)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <section className="relative overflow-hidden bg-gradient-to-br from-[#062b75] via-[#075fe3] to-[#6d28d9] px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-white/10" />
            <div className="absolute -bottom-24 left-1/2 h-48 w-48 rounded-full bg-purple-400/20 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[.24em] text-blue-100">{meta.eyebrow}</p>
                <p className="mt-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-50">{meta.badge}</p>
                <h1 className="mt-7 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">{current.title}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">{current.intro}</p>
              </div>
              <div className="relative rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.18em] text-blue-100">TracePG</p>
                    <p className="mt-2 text-xl font-black">{meta.sideTitle}</p>
                  </div>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-2xl text-brand-600 shadow-lg"><MetaIcon aria-hidden="true" /></span>
                </div>
                <p className="mt-4 text-sm leading-6 text-blue-50">{meta.sideBody}</p>
                {current.slug === "about" && current.operatorName && (
                  <div className="mt-5 rounded-2xl border border-white/20 bg-slate-950/20 p-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-100"><FiUser aria-hidden="true" /> Website operator</div>
                    <p className="mt-2 text-base font-black text-white">{current.operatorName}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {current.slug === "about" && current.teamMembers?.length > 0 && (
            <section className="border-t border-slate-200 px-6 py-8 sm:px-10 sm:py-10 dark:border-slate-800" aria-labelledby="meet-our-team">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.2em] text-brand-600">The people behind the product</p>
                  <h2 id="meet-our-team" className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Meet Our Team</h2>
                </div>
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">Building with purpose</span>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                {current.teamMembers.map((member) => (
                  <article key={member.name} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/70 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 dark:hover:border-blue-800">
                    <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-600/10 blur-2xl transition duration-300 group-hover:bg-brand-600/20" />
                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
                      <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-blue-100 bg-white p-3 shadow-md dark:border-blue-900/60 dark:bg-slate-800">
                        <img className="h-full w-full object-contain" src={member.image} alt={`${member.name} profile`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[.16em] text-brand-600">Team member</p>
                        <h3 className="mt-2 text-xl font-black tracking-tight">{member.name}</h3>
                        <p className="mt-1 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-blue-950/60 dark:text-blue-200">{member.qualification}</p>
                        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{member.summary}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-12">
            <section>
              <p className="text-xs font-black uppercase tracking-[.2em] text-brand-600">{current.slug === "qa" ? "Helpful answers" : "Inside TracePG"}</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">{current.slug === "contact" ? "How we can help" : current.slug === "qa" ? "Common questions, answered" : "A clear path forward"}</h2>

              {sections.length > 0 && (
                <div className="mt-6 space-y-4">
                  {sections.map(([heading, body], index) => {
                    const icons = [FiCheckCircle, FiBookOpen, FiShield, FiMessageCircle];
                    const Icon = icons[index % icons.length];
                    return (
                      <article className="flex gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm dark:border-slate-700 dark:hover:border-blue-900" key={`${heading}-${index}`}>
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-xl text-brand-600 dark:bg-blue-950/50 dark:text-blue-200"><Icon aria-hidden="true" /></span>
                        <div>
                          <h3 className="font-black">{heading}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {current.faqs?.length > 0 && (
                <div className="mt-6 space-y-3">
                  {current.faqs.map((faq, index) => (
                    <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60" key={`${faq.question}-${index}`}>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-black marker:hidden">
                        <span><span className="mb-1 block text-xs font-bold uppercase tracking-wider text-brand-600">{faq.category || "General"}</span>{faq.question}</span>
                        <FiChevronDown className="shrink-0 text-lg text-brand-600 transition group-open:rotate-180" aria-hidden="true" />
                      </summary>
                      <p className="mt-3 border-t border-slate-200 pt-3 text-sm leading-7 text-slate-600 dark:border-slate-700 dark:text-slate-300">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              )}
            </section>

            <aside className="h-fit rounded-3xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-900/60 dark:bg-blue-950/30 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[.18em] text-brand-600">{current.slug === "contact" ? "Reach us" : "TracePG at a glance"}</p>
              <h2 className="mt-2 text-2xl font-black">{current.slug === "contact" ? "We’re listening" : "Keep it simple"}</h2>

              {(current.contactEmail || current.contactPhone || current.supportHours) ? (
                <div className="mt-6 space-y-3">
                  {current.contactEmail && <ContactRow icon={FiMail} label="Email" value={current.contactEmail} href={`mailto:${current.contactEmail}`} />}
                  {current.contactPhone && <ContactRow icon={FiPhone} label="Phone" value={current.contactPhone} href={`tel:${current.contactPhone}`} />}
                  {current.supportHours && <ContactRow icon={FiClock} label="Support hours" value={current.supportHours} />}
                </div>
              ) : (
                <div className="mt-6 space-y-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {["Focused practice and review", "Progress connected to your account", "A calmer way to prepare"].map((item) => <p className="flex items-start gap-2" key={item}><FiCheckCircle className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" /> {item}</p>)}
                </div>
              )}

              {current.supportCtaUrl && current.supportCtaLabel && (
                <a className="primary-button mt-7 inline-flex w-full items-center justify-center gap-2" href={current.supportCtaUrl}>{current.supportCtaLabel} <FiArrowRight aria-hidden="true" /></a>
              )}
              {current.slug === "contact" && <p className="mt-4 text-center text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">Please do not send passwords or other sensitive credentials.</p>}
            </aside>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function ContactRow({ icon: Icon, label, value, href }) {
  const content = <><Icon className="mt-0.5 shrink-0 text-xl text-brand-600" aria-hidden="true" /><span><strong className="block text-xs uppercase tracking-wider text-slate-400">{label}</strong><span className="mt-1 block text-sm font-bold text-slate-700 dark:text-slate-200">{value}</span></span></>;
  return href ? <a className="flex gap-3 rounded-2xl border border-blue-100 bg-white p-4 transition hover:border-blue-300 dark:border-blue-900/60 dark:bg-slate-900" href={href}>{content}</a> : <div className="flex gap-3 rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900/60 dark:bg-slate-900">{content}</div>;
}
