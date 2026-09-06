import { useEffect, useState } from "react";
import SiteFooter from "../components/SiteFooter";
import { LEGAL_POLICIES } from "../data/legalPolicies";

export function getLegalPage(pathname) {
  if (pathname === "/privacy") return LEGAL_POLICIES.privacy;
  if (pathname === "/terms") return LEGAL_POLICIES.terms;
  if (pathname === "/refund-policy") return LEGAL_POLICIES.refund;
  return null;
}

export default function LegalPage({ policy }) {
  const [current, setCurrent] = useState(policy);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/policies?slug=${encodeURIComponent(policy.path.slice(1))}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (mounted && payload?.policy) setCurrent({ ...policy, ...payload.policy });
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [policy]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between px-4 py-4 sm:px-6">
          <a className="flex items-center gap-2 font-extrabold tracking-tight" href="/">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-lg text-white shadow-lg shadow-blue-200 dark:shadow-none">🩺</span>
            TracePG
          </a>
          <a className="text-sm font-bold text-brand-600 hover:text-brand-700" href="/">Back to TracePG</a>
        </div>
      </header>

      <main className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-brand-600">TracePG · {current.label}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{current.title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{current.intro}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Last updated: {current.updatedAt ? new Date(current.updatedAt).toLocaleDateString() : "September 6, 2026"}
          </p>
        </div>

        <div className="mt-10 max-w-3xl space-y-7">
          {current.sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">{heading}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{body}</p>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
