import { getSubjectStats, formatSeconds } from "../lib/study";

export default function Analytics({ questions, state }) {
  const stats = getSubjectStats(questions, state);
  const attempted = Object.keys(state.attempts).length;
  const correct = Object.values(state.attempts).filter(
    (item) => item.correct,
  ).length;
  const totalTime = Object.values(state.timeSpent).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );
  const active = stats.filter((item) => item.attempted);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">
          Measure what matters
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Performance Analytics
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Turn practice history into your next revision decision.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric value={attempted} label="Attempted" />
        <Metric
          value={`${attempted ? Math.round((correct / attempted) * 100) : 0}%`}
          label="Overall accuracy"
        />
        <Metric
          value={formatSeconds(attempted ? totalTime / attempted : 0)}
          label="Avg time / question"
        />
        <Metric value={state.history.length} label="Completed tests" />
      </div>
      <section className="surface-card">
        <h2 className="text-lg font-extrabold">Subject performance</h2>
        <div className="mt-5 space-y-5">
          {active.length ? (
            active.map((item) => (
              <div key={item.subject}>
                <div className="flex justify-between text-sm">
                  <b>{item.subject}</b>
                  <span className="text-slate-500">
                    {item.accuracy}% · {item.attempted}/{item.total}
                  </span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${item.accuracy >= 70 ? "bg-emerald-500" : item.accuracy >= 45 ? "bg-amber-400" : "bg-rose-500"}`}
                    style={{ width: `${Math.max(3, item.accuracy)}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Attempt questions to unlock subject-level analytics.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
function Metric({ value, label }) {
  return (
    <div className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
