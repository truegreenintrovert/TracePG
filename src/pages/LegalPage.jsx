import { useEffect, useState } from "react";
import { FiArrowRight, FiCheckCircle, FiClock, FiFileText, FiRefreshCw, FiShield, FiTruck, FiXCircle } from "react-icons/fi";
import SiteFooter from "../components/SiteFooter";
import SEO, { SITE_URL } from "../components/SEO";
import { LEGAL_POLICIES } from "../data/legalPolicies";
import PublicTopBar from "../components/PublicTopBar";

export function getLegalPage(pathname) {
  if (pathname === "/privacy") return LEGAL_POLICIES.privacy;
  if (pathname === "/terms") return LEGAL_POLICIES.terms;
  if (pathname === "/refund-policy") return LEGAL_POLICIES.refund;
  if (pathname === "/shipping-policy") return LEGAL_POLICIES.shipping;
  if (pathname === "/cancellation-policy") return LEGAL_POLICIES.cancellation;
  return null;
}

const POLICY_META = {
  privacy: { badge: "Privacy & trust", icon: FiShield, sideTitle: "Your information matters", sideBody: "Clear details about the information TracePG uses and the choices available to you." },
  terms: { badge: "Using TracePG", icon: FiFileText, sideTitle: "A fair study workspace", sideBody: "The simple rules that keep TracePG useful, respectful, and reliable for every learner." },
  refund: { badge: "Payments & refunds", icon: FiRefreshCw, sideTitle: "Clear payment guidance", sideBody: "Understand how refund requests are reviewed and what information helps us respond quickly." },
  shipping: { badge: "Digital delivery", icon: FiTruck, sideTitle: "Access, delivered digitally", sideBody: "TracePG is a digital service, so there are no physical products, shipping charges, or delivery addresses." },
  cancellation: { badge: "Digital product", icon: FiXCircle, sideTitle: "No order cancellation", sideBody: "TracePG access is delivered digitally, so completed purchases cannot be cancelled." },
};

export default function LegalPage({ policy, user, theme, setTheme, onNavigate, onSignIn, onSignOut, onUpgrade, isAdmin, trialActive, view }) {
  const [current, setCurrent] = useState(policy);

  useEffect(() => {
    let mounted = true;
    const policySlug = policy.slug || ({ "/refund-policy": "refund", "/shipping-policy": "shipping", "/cancellation-policy": "cancellation" }[policy.path] || policy.path.slice(1));
    fetch(`/api/policies?slug=${encodeURIComponent(policySlug)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (mounted && payload?.policy) setCurrent({ ...policy, ...payload.policy, path: policy.path });
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [policy]);

  const meta = POLICY_META[current.slug] || POLICY_META.privacy;
  const MetaIcon = meta.icon;
  const updatedLabel = current.updatedAt ? new Date(current.updatedAt).toLocaleDateString() : "September 6, 2026";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <SEO
        title={`${current.label} | TracePG`}
        description={current.intro}
        path={current.path}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${current.label} | TracePG`,
          url: `${SITE_URL}${current.path}`,
          description: current.intro,
        }}
      />
      <PublicTopBar view={view} user={user} theme={theme} setTheme={setTheme} onNavigate={onNavigate} onSignIn={onSignIn} onSignOut={onSignOut} onUpgrade={onUpgrade} isAdmin={isAdmin} trialActive={trialActive} />

      <main className="public-page-content max-w-[1160px] px-4 py-8 sm:px-6 sm:py-14">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_-35px_rgba(15,23,42,.35)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <section className="relative overflow-hidden bg-gradient-to-br from-[#062b75] via-[#075fe3] to-[#6d28d9] px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-white/10" />
            <div className="absolute -bottom-24 left-1/2 h-48 w-48 rounded-full bg-purple-400/20 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[.24em] text-blue-100">TracePG · {current.label}</p>
                <p className="mt-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-50">{meta.badge}</p>
                <h1 className="mt-7 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">{current.title}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">{current.intro}</p>
              </div>
              <div className="relative rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.18em] text-blue-100">Policy overview</p>
                    <p className="mt-2 text-xl font-black">{meta.sideTitle}</p>
                  </div>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-2xl text-brand-600 shadow-lg"><MetaIcon aria-hidden="true" /></span>
                </div>
                <p className="mt-4 text-sm leading-6 text-blue-50">{meta.sideBody}</p>
              </div>
            </div>
          </section>

          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-12">
            <section aria-labelledby="policy-details">
              <p className="text-xs font-black uppercase tracking-[.2em] text-brand-600">Read the details</p>
              <h2 id="policy-details" className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">What you should know</h2>
              <div className="mt-6 space-y-4">
                {current.sections.map(([heading, body], index) => (
                  <article className="flex gap-4 rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-700 dark:hover:border-blue-900" key={heading}>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-sm font-black text-brand-600 dark:bg-blue-950/50 dark:text-blue-200">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="font-black text-slate-950 dark:text-white">{heading}</h3>
                      <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">{body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="h-fit rounded-3xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-900/60 dark:bg-blue-950/30 sm:p-6">
              <p className="text-xs font-black uppercase tracking-[.18em] text-brand-600">At a glance</p>
              <h2 className="mt-2 text-2xl font-black">Simple, transparent guidance</h2>
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900/60 dark:bg-slate-900">
                  <FiClock className="mt-0.5 shrink-0 text-xl text-brand-600" aria-hidden="true" />
                  <span><strong className="block text-xs uppercase tracking-wider text-slate-400">Last updated</strong><span className="mt-1 block text-sm font-bold text-slate-700 dark:text-slate-200">{updatedLabel}</span></span>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900/60 dark:bg-slate-900">
                  <FiCheckCircle className="mt-0.5 shrink-0 text-xl text-emerald-600" aria-hidden="true" />
                  <span><strong className="block text-xs uppercase tracking-wider text-slate-400">Current version</strong><span className="mt-1 block text-sm font-bold text-slate-700 dark:text-slate-200">Applies to TracePG users</span></span>
                </div>
              </div>
              <a className="primary-button mt-7 inline-flex w-full items-center justify-center gap-2" href="/contact-us">Need help? Contact us <FiArrowRight aria-hidden="true" /></a>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
