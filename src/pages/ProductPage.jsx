import { useEffect, useState } from "react";
import { FiArrowRight, FiBarChart2, FiBookOpen, FiCheck, FiClock, FiTarget } from "react-icons/fi";
import PublicTopBar from "../components/PublicTopBar";
import SEO, { SITE_URL } from "../components/SEO";
import SiteFooter from "../components/SiteFooter";
import { getSupportPage } from "../data/supportContent";

const fallback = getSupportPage("/product");

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

  const sections = current.sections?.length ? current.sections : fallback.sections;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "TracePG Test series NEET PG",
    description: current.intro,
    provider: { "@type": "Organization", name: "TracePG", sameAs: SITE_URL },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <SEO title="TracePG Test series NEET PG | TracePG" description={current.intro} path="/product" structuredData={[structuredData]} />
      <PublicTopBar view={view} user={user} theme={theme} setTheme={setTheme} onNavigate={onNavigate} onSignIn={onSignIn} onSignOut={onSignOut} onUpgrade={onUpgrade} isAdmin={isAdmin} trialActive={trialActive} />

      <main className="public-page-content max-w-[1160px] px-4 py-8 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_-35px_rgba(15,23,42,.35)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#062b75] via-[#075fe3] to-[#6d28d9] px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-white/10" />
            <div className="absolute -bottom-24 left-1/2 h-48 w-48 rounded-full bg-purple-400/20 blur-3xl" />
            <div className="relative flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[.24em] text-blue-100">TracePG course</p>
                <p className="mt-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-50">NEET PG · Test series</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-sm">
                <img className="h-14 w-14 object-contain" src="/trace-logo-square.png" alt="" aria-hidden="true" />
              </div>
            </div>
            <h1 className="relative mt-8 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">TracePG Test series NEET PG</h1>
            <p className="relative mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">{current.intro}</p>
          </div>

          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-12">
            <section>
              <p className="text-xs font-black uppercase tracking-[.2em] text-brand-600">What you get</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">A complete preparation workspace</h2>
              <div className="mt-6 space-y-4">
                {sections.map(([heading, body], index) => {
                  const icons = [FiBookOpen, FiTarget, FiBarChart2];
                  const Icon = icons[index % icons.length];
                  return (
                    <div className="flex gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700" key={`${heading}-${index}`}>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-xl text-brand-600 dark:bg-blue-950/50 dark:text-blue-200"><Icon aria-hidden="true" /></span>
                      <div>
                        <h3 className="font-black">{heading}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <aside className="h-fit rounded-3xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-900/60 dark:bg-blue-950/30 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.18em] text-brand-600">Course access</p>
                  <p className="mt-2 text-2xl font-black">Study with clarity</p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-xl text-brand-600 shadow-sm dark:bg-slate-900"><FiClock aria-hidden="true" /></span>
              </div>
              <div className="mt-6 space-y-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {[
                  "Focused subject-wise practice",
                  "Previous-year questions and review",
                  "History, analytics, notes, and revision",
                ].map((item) => <p className="flex items-start gap-2" key={item}><FiCheck className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" /> {item}</p>)}
              </div>
              <a className="primary-button mt-7 inline-flex w-full items-center justify-center gap-2" href="/" onClick={navigateHome}>Start preparing <FiArrowRight aria-hidden="true" /></a>
              <p className="mt-3 text-center text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">Sign in to save your tests, notes, bookmarks, and progress across devices.</p>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
