import { useState } from "react";
import SiteFooter from "../components/SiteFooter";
import SEO, { SITE_URL } from "../components/SEO";
import PublicHeader from "../components/PublicHeader";
import PublicSidebar from "../components/PublicSidebar";
import { FiArrowRight, FiBarChart2, FiBookOpen, FiClock } from "react-icons/fi";

export default function PublicHome({ onSignIn }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="page-transition min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <SEO
        title="TracePG | NEET-PG preparation workspace"
        description="Prepare for NEET-PG with focused question practice, previous-year questions, revision tools, and progress tracking."
        path="/"
        structuredData={[
          { "@context": "https://schema.org", "@type": "EducationalOrganization", name: "TracePG", url: SITE_URL, description: "NEET-PG preparation workspace for focused practice, revision, and progress tracking." },
          { "@context": "https://schema.org", "@type": "WebSite", name: "TracePG", url: SITE_URL, description: "Focused NEET-PG question practice, PYQs, revision, and progress tracking." },
        ]}
      />
      <PublicHeader onSignIn={onSignIn} onMenu={() => setSidebarOpen(true)} />
      {sidebarOpen && <div className="fixed inset-0 z-[60] lg:hidden"><button className="motion-backdrop absolute inset-0 h-full w-full bg-slate-950/40" aria-label="Close public navigation" onClick={() => setSidebarOpen(false)} /><aside className="motion-drawer scrollbar-invisible absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-slate-200 bg-white px-4 py-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950"><PublicSidebar view="home" onNavigate={(nextView) => { setSidebarOpen(false); window.location.assign({ home: "/", product: "/product", about: "/about-us", contact: "/contact-us", help: "/help-support", qa: "/qa" }[nextView] || "/"); }} closeOnSelect onClose={() => setSidebarOpen(false)} /></aside></div>}

      <main>
        <section className="mx-auto grid max-w-[1240px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-10 lg:py-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-brand-600">Study smarter, stay consistent</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl dark:text-white">Your focused workspace for NEET-PG preparation.</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-300">Practice high-yield questions, revise weak areas, and understand your progress with one calm, focused preparation cockpit.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="primary-button inline-flex items-center gap-2" onClick={onSignIn}>Start preparing <FiArrowRight aria-hidden="true" /></button>
              <a className="secondary-button" href="/product">Explore TracePG</a>
            </div>
            <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Sign in to save your tests, notes, bookmarks, and progress across devices.</p>
          </div>

          <div className="surface-card relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-sky-400 p-6 text-white shadow-2xl shadow-blue-200 sm:p-8 dark:shadow-none">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
            <div className="relative space-y-4">
              <p className="text-sm font-bold uppercase tracking-[.18em] text-blue-100">TracePG</p>
              <h2 className="text-2xl font-black sm:text-3xl">Make every question count.</h2>
              <div className="grid gap-3 pt-3">
                <Feature icon={<FiBookOpen aria-hidden="true" />} title="Focused practice" text="Build tests around the subjects and topics you need today." />
                <Feature icon={<FiBarChart2 aria-hidden="true" />} title="Clear progress" text="See history, analytics, wrong answers, and revision priorities." />
                <Feature icon={<FiClock aria-hidden="true" />} title="Study at your pace" text="Pause a test and continue it whenever you are ready." />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 py-8 text-sm font-semibold text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10 dark:text-slate-300">
            <p>Ready to make your next study session more focused?</p>
            <button className="inline-flex items-center gap-2 font-black text-brand-600 hover:text-brand-700" onClick={onSignIn}>Sign in to TracePG <FiArrowRight aria-hidden="true" /></button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/15 bg-white/10 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 text-blue-100">{icon}</span>
      <div>
        <p className="font-black">{title}</p>
        <p className="mt-1 text-sm leading-6 text-blue-100">{text}</p>
      </div>
    </div>
  );
}
