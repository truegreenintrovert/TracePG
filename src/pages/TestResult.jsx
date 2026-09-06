export default function TestResult({ result, onReview, onNavigate }) {
  const attempted = result.correct + result.wrong;
  const accuracy = result.total ? Math.round((result.correct / result.total) * 100) : 0;
  const attemptedAccuracy = attempted ? Math.round((result.correct / attempted) * 100) : 0;
  const maxScore = result.total * 4;
  const scorePercent = maxScore ? Math.round((result.score / maxScore) * 100) : 0;
  const message = accuracy >= 85
    ? "🔥 Excellent! Rank-ready performance."
    : accuracy >= 70
      ? "💪 Strong attempt. Keep polishing weak areas."
      : accuracy >= 50
        ? "📚 Good start. Revise your mistakes and retry."
        : "🎯 Focus on revision first, then retake a targeted test.";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">Attempt complete</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Test Result</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{result.title}</p>
      </div>

      <section className="surface-card grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
        <div className="mx-auto grid h-44 w-44 place-items-center rounded-full" style={{ background: `conic-gradient(#10b981 0 ${result.correct / Math.max(1, result.total) * 100}%, #f43f5e ${result.correct / Math.max(1, result.total) * 100}% ${(result.correct + result.wrong) / Math.max(1, result.total) * 100}%, #e2e8f0 ${(result.correct + result.wrong) / Math.max(1, result.total) * 100}% 100%)` }}>
          <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center dark:bg-slate-900">
            <strong className="text-3xl font-black">{accuracy}%</strong>
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Accuracy</span>
          </div>
        </div>
        <div>
          <span className="tag tag-blue">{result.title}</span>
          <h2 className="mt-3 text-4xl font-black text-brand-600">{result.score} <span className="text-lg text-slate-400">/ {maxScore}</span></h2>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{message}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <Metric value={result.correct} label="Correct" tone="text-emerald-600" />
            <Metric value={result.wrong} label="Wrong" tone="text-rose-600" />
            <Metric value={result.unattempted} label="Unattempted" tone="text-slate-500" />
            <Metric value={`${attemptedAccuracy}%`} label="Attempt accuracy" tone="text-brand-600" />
          </div>
        </div>
      </section>

      <section className="surface-card">
        <h2 className="text-lg font-extrabold">Performance snapshot</h2>
        <div className="mt-4 h-3 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.min(100, Math.max(0, scorePercent))}%` }} /></div>
        <p className="mt-3 text-sm text-slate-500">Net score: {scorePercent}% of maximum marks · {attempted} questions attempted</p>
      </section>

      <section className="surface-card">
        <h2 className="text-lg font-extrabold">Review your test</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">See every question, your answer, the correct answer, explanation, and revision notes.</p>
        <button className="primary-button mt-5" onClick={() => onReview(result)}>🔍 Review full test</button>
      </section>

      <section className="surface-card flex flex-wrap gap-3">
        <button className="primary-button" onClick={() => onNavigate("wrong")}>❌ Revise wrong ({result.wrong})</button>
        <button className="secondary-button" onClick={() => onNavigate("test")}>🎯 Create another test</button>
        <button className="secondary-button" onClick={() => onNavigate("analytics")}>📈 View analytics</button>
        <button className="secondary-button" onClick={() => onNavigate("history")}>📊 Test history</button>
      </section>
    </div>
  );
}

function Metric({ value, label, tone }) {
  return <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><strong className={`text-xl font-black ${tone}`}>{value}</strong><p className="mt-1 text-xs font-bold text-slate-400">{label}</p></div>;
}
