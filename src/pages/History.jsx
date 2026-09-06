import { formatDate, formatSeconds } from "../lib/study";

export default function History({ history, onReview }) {
  const totalQuestions = history.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const totalCorrect = history.reduce((sum, item) => sum + Number(item.correct || 0), 0);
  const totalAttempted = history.reduce((sum, item) => sum + Number(item.correct || 0) + Number(item.wrong || 0), 0);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">
          Your record
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Test History
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Review how your practice is trending over time.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat-card"><strong>{history.length}</strong><span>Completed tests</span></div>
        <div className="stat-card"><strong>{totalQuestions}</strong><span>Questions completed</span></div>
        <div className="stat-card"><strong>{totalAttempted ? Math.round((totalCorrect / totalAttempted) * 100) : 0}%</strong><span>Attempt accuracy</span></div>
      </div>
      {history.length ? (
        <div className="space-y-3">
          {history.map((item, index) => (
            <div
              className="surface-card flex flex-wrap items-center justify-between gap-4"
              key={`${item.date}-${index}`}
            >
              <div>
                <span className="tag tag-blue">{formatDate(item.date)}</span>
                <h2 className="mt-3 font-extrabold">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {item.correct} correct · {item.wrong} wrong · {item.unattempted} unattempted
                  {item.secondsSpent ? ` · ${formatSeconds(item.secondsSpent)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-4 text-right">
                <strong className="text-3xl font-black text-brand-600">
                  {item.score}
                </strong>
                <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">score</p><button className="mt-2 text-sm font-bold text-brand-600 hover:text-brand-700" onClick={() => onReview?.(item)}>Review →</button></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="surface-card py-16 text-center text-slate-500">
          No tests taken yet. Your completed practice sets will appear here.
        </div>
      )}
    </div>
  );
}
