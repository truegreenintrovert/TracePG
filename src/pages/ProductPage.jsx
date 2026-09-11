import { useEffect, useState } from "react";
import { FiArrowRight, FiBarChart2, FiBookOpen, FiCheck, FiClock, FiFileText, FiRepeat, FiTag, FiTarget } from "react-icons/fi";
import PublicTopBar from "../components/PublicTopBar";
import SEO, { SITE_URL } from "../components/SEO";
import SiteFooter from "../components/SiteFooter";
import { BILLING_PLANS } from "../data/billingPlans";
import { getSupportPage } from "../data/supportContent";

const fallback = getSupportPage("/product");

const workflow = [
  [FiTarget, "Choose what to practise", "Build a focused test around a subject, chapter, or difficulty level."],
  [FiFileText, "Work through PYQs", "Use previous-year questions to understand patterns and test-day expectations."],
  [FiRepeat, "Review what matters", "Revisit wrong answers, save notes, and turn weak areas into revision priorities."],
  [FiBarChart2, "Track your momentum", "Use history and analytics to make each study session more intentional."],
];

export default function ProductPage({ onNavigate, user, theme, setTheme, onSignIn, onSignOut, onUpgrade, isAdmin, trialActive, view }) {
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
  }, []);

  const navigateHome = (event) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate("home");
  };

  const startPreparing = (event) => {
    if (user) {
      navigateHome(event);
      return;
    }
    event.preventDefault();
    onSignIn?.();
  };

  const chooseAccess = () => {
    if (user) {
      onUpgrade?.();
      return;
    }
    onSignIn?.();
  };

  const sections = current.sections?.length ? current.sections : fallback.sections;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "TracePG NEET-PG preparation workspace",
    description: current.intro,
    provider: { "@type": "Organization", name: "TracePG", sameAs: SITE_URL },
    offers: BILLING_PLANS.map((plan) => ({
      "@type": "Offer",
      name: `${plan.label} access`,
      price: String(plan.priceInr),
      priceCurrency: "INR",
      category: "One-time access",
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <SEO title="TracePG Product | NEET-PG question bank, PYQs & revision" description={current.intro} path="/product" structuredData={[structuredData]} />
      <PublicTopBar view={view} user={user} theme={theme} setTheme={setTheme} onNavigate={onNavigate} onSignIn={onSignIn} onSignOut={onSignOut} onUpgrade={onUpgrade} isAdmin={isAdmin} trialActive={trialActive} />

      <main className="public-page-content max-w-[1160px] px-4 py-8 sm:px-6 sm:py-14">
        <div className="mb-5 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 shadow-sm dark:border-amber-900/70 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/30" role="status">
          <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:px-6">
            <span className="inline-flex items-center justify-center gap-2 text-sm font-black text-amber-900 dark:text-amber-100"><FiTag className="text-amber-600 dark:text-amber-300" aria-hidden="true" /> Early-access offer</span>
            <span className="hidden h-5 w-px bg-amber-300 sm:block dark:bg-amber-800" aria-hidden="true" />
            <p className="text-center text-sm font-semibold text-amber-950 dark:text-amber-100">Use <strong>FLAT50</strong> for the first 100 users · <strong>FIRST10</strong> for the first 10 users</p>
          </div>
        </div>
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_-35px_rgba(15,23,42,.35)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#062b75] via-[#075fe3] to-[#6d28d9] px-6 py-8 text-white sm:px-10 sm:py-11">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-white/10" />
            <div className="absolute -bottom-24 left-1/2 h-48 w-48 rounded-full bg-purple-400/20 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
              <div>
                <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wider text-blue-50">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">NEET-PG preparation</span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">One-time access</span>
                </div>
                <h1 className="mt-6 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">{current.title || "Everything you need for a smarter preparation workflow."}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">{current.intro}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a className="primary-button inline-flex items-center gap-2 bg-white text-brand-700 shadow-none hover:bg-blue-50" href="/" onClick={startPreparing}>{user ? "Open study workspace" : "Start preparing"} <FiArrowRight aria-hidden="true" /></a>
                  {!user && <button className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20" onClick={chooseAccess}>View access plans</button>}
                </div>
              </div>
              <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-[.2em] text-blue-100">The TracePG loop</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <QuickStat icon={FiBookOpen} label="Question bank" />
                  <QuickStat icon={FiFileText} label="PYQ papers" />
                  <QuickStat icon={FiRepeat} label="Smart revision" />
                  <QuickStat icon={FiBarChart2} label="Clear analytics" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-10 p-6 sm:p-10">
            <section className="rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 dark:border-blue-900/60 dark:from-blue-950/40 dark:via-slate-900 dark:to-purple-950/30 sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.2em] text-brand-600">Access plans</p>
                  <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Choose once. Keep preparing.</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Pick the access period that fits your preparation timeline. Every plan is a one-time payment with no recurring subscription.</p>
                </div>
                <span className="rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-black text-brand-700 shadow-sm dark:border-blue-800 dark:bg-slate-900/70 dark:text-blue-200">3-day free trial available</span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {BILLING_PLANS.map((plan) => <PlanCard key={plan.id} plan={plan} featured={plan.id === "lifetime"} onChoose={chooseAccess} />)}
              </div>
              <p className="mt-4 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">Eligible discount codes can be applied securely at checkout.</p>
            </section>

            <section>
              <p className="text-xs font-black uppercase tracking-[.2em] text-brand-600">How it works</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">A calmer way to turn practice into progress</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {workflow.map(([Icon, heading, body], index) => (
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700" key={heading}>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-xl text-brand-600 dark:bg-blue-950/50 dark:text-blue-200"><Icon aria-hidden="true" /></span>
                    <p className="mt-4 text-xs font-black uppercase tracking-wider text-slate-400">0{index + 1}</p>
                    <h3 className="mt-2 font-black">{heading}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-[.2em] text-brand-600">Inside TracePG</p>
                <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Tools that stay connected to your preparation</h2>
                <div className="mt-6 space-y-4">
                  {sections.map(([heading, body], index) => {
                    const icons = [FiBookOpen, FiTarget, FiBarChart2];
                    const Icon = icons[index % icons.length];
                    return (
                      <div className="flex gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700" key={`${heading}-${index}`}>
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-xl text-brand-600 dark:bg-blue-950/50 dark:text-blue-200"><Icon aria-hidden="true" /></span>
                        <div><h3 className="font-black">{heading}</h3><p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <aside className="h-fit rounded-3xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-900/60 dark:bg-blue-950/30 sm:p-6">
                <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-xl text-brand-600 shadow-sm dark:bg-slate-900"><FiClock aria-hidden="true" /></span><div><p className="text-xs font-black uppercase tracking-[.18em] text-brand-600">Try it first</p><p className="mt-1 text-xl font-black">3-day free trial</p></div></div>
                <p className="mt-5 text-sm leading-6 text-slate-700 dark:text-slate-200">Explore full access to tests, PYQs, review, history, analytics, revision, bookmarks, and notes before choosing a plan.</p>
                <ul className="mt-5 space-y-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {["No recurring subscription", "Save progress across devices", "Discount codes supported at checkout"].map((item) => <li className="flex items-start gap-2" key={item}><FiCheck className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />{item}</li>)}
                </ul>
                <button className="secondary-button mt-6 w-full" onClick={chooseAccess}>{user ? "View access options" : "Sign in to start your trial"}</button>
              </aside>
            </section>

          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function QuickStat({ icon: Icon, label }) {
  return <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-3"><Icon className="shrink-0 text-blue-100" aria-hidden="true" /><span className="font-bold text-blue-50">{label}</span></div>;
}

function PlanCard({ plan, featured, onChoose }) {
  return (
    <button type="button" className={`rounded-2xl border bg-white/90 p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900/80 ${featured ? "border-brand-600 bg-blue-50 ring-2 ring-blue-200 dark:border-blue-400 dark:bg-blue-950/40 dark:ring-blue-900" : "border-slate-200 hover:border-blue-300 dark:border-slate-700"}`} onClick={onChoose}>
      {featured && <span className="text-[11px] font-black uppercase tracking-wider text-brand-600">Best value</span>}
      <span className={`${featured ? "mt-2" : ""} block text-sm font-black`}>{plan.label}</span>
      <span className="mt-2 block text-2xl font-black">₹{Number(plan.priceInr).toLocaleString("en-IN")}</span>
      <span className="mt-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">one-time access</span>
    </button>
  );
}
