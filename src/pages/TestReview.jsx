import { useMemo, useState } from "react";

export default function TestReview({ result, state, onSaveNote, onBack }) {
  const [filter, setFilter] = useState("all");
  const [index, setIndex] = useState(0);
  const list = useMemo(() => result.details.map((detail, originalIndex) => ({ detail, originalIndex })).filter(({ detail }) => filter === "all" || statusOf(detail) === filter), [result.details, filter]);
  const current = list[Math.min(index, Math.max(0, list.length - 1))];

  const changeFilter = (nextFilter) => {
    setFilter(nextFilter);
    setIndex(0);
  };

  if (!current) {
    return <div className="surface-card text-center"><p className="text-slate-500">No questions match this filter.</p><button className="secondary-button mt-4" onClick={() => changeFilter("all")}>Show all</button></div>;
  }

  const { detail, originalIndex } = current;
  const question = detail.question;
  const status = statusOf(detail);
  const yourAnswer = detail.answer === undefined ? "Not attempted" : `${String.fromCharCode(65 + detail.answer)}. ${question?.o?.[detail.answer] || ""}`;
  const correctAnswer = question ? `${String.fromCharCode(65 + question.a)}. ${question.o?.[question.a] || ""}` : "Unavailable";
  const note = question ? state.notes[question.id] || "" : "";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto min-h-screen max-w-5xl px-4 py-5 sm:px-6 lg:py-8">
        <div className="flex items-center justify-between gap-3">
          <button className="secondary-button" onClick={onBack}>← Back to result</button>
          <strong className="text-sm font-black">Review · {result.title}</strong>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {["all", "correct", "wrong", "unattempted"].map((item) => <button key={item} className={`rounded-xl px-3 py-2 text-xs font-bold capitalize ${filter === item ? "bg-brand-600 text-white" : "bg-white text-slate-500 dark:bg-slate-900"}`} onClick={() => changeFilter(item)}>{item} {item === "all" ? result.total : result.details.filter((detail) => statusOf(detail) === item).length}</button>)}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_250px]">
          <article className="surface-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-slate-500">Question {originalIndex + 1} / {result.total}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${status === "correct" ? "bg-emerald-100 text-emerald-700" : status === "wrong" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{status === "correct" ? "✅ Correct" : status === "wrong" ? "❌ Wrong" : "⭕ Unattempted"}</span>
            </div>
            {question ? <>
              <div className="mt-4 flex flex-wrap gap-2"><span className="tag">{question.subject || "Question"}</span><span className="tag">{question.difficulty || "Medium"}</span></div>
              <h1 className="mt-5 text-xl font-extrabold leading-8">{question.q}</h1>
              <div className="mt-5 grid gap-3">{question.o.map((option, optionIndex) => <div key={optionIndex} className={`rounded-xl border p-3 text-sm ${optionIndex === question.a ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200" : detail.answer === optionIndex ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200" : "border-slate-200 dark:border-slate-700"}`}><b className="mr-2">{String.fromCharCode(65 + optionIndex)}.</b>{option}{optionIndex === question.a && " ✓"}{detail.answer === optionIndex && optionIndex !== question.a && " ✗"}</div>)}</div>
              <div className={`mt-5 rounded-xl p-4 text-sm ${status === "wrong" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200"}`}><b>Your answer:</b> {yourAnswer}</div>
              <div className="mt-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200"><b>Correct answer:</b> {correctAnswer}</div>
              <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-slate-600 dark:bg-blue-950/30 dark:text-slate-300"><b>💡 Full solution</b><p className="mt-2">{question.e || "No explanation available."}</p></div>
              <div className="mt-5"><label className="text-sm font-bold">📝 Revision note<textarea className="field mt-2 min-h-24" defaultValue={note} onBlur={(event) => onSaveNote(question.id, event.target.value)} placeholder="Add a note for revision…" /></label><p className="mt-2 text-xs text-slate-400">Notes save when you leave this field.</p></div>
            </> : <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">This older history record does not contain a question snapshot. New test attempts will support full review.</p>}
            <div className="mt-7 flex justify-between gap-3"><button className="secondary-button" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>← Previous</button><button className="primary-button" disabled={index === list.length - 1} onClick={() => setIndex((value) => value + 1)}>Next →</button></div>
          </article>

          <aside className="surface-card h-fit">
            <h2 className="font-extrabold">Questions</h2>
            <div className="mt-4 grid grid-cols-5 gap-2">{result.details.map((detail, itemIndex) => <button key={itemIndex} className={`grid h-9 w-9 place-items-center rounded-lg border text-xs font-bold ${itemIndex === originalIndex ? "border-brand-500 bg-brand-600 text-white" : statusOf(detail) === "correct" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : statusOf(detail) === "wrong" ? "border-rose-300 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-500 dark:border-slate-700"}`} onClick={() => { const target = list.findIndex((item) => item.originalIndex === itemIndex); if (target >= 0) setIndex(target); }}>{itemIndex + 1}</button>)}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function statusOf(detail) {
  if (detail.answer === undefined) return "unattempted";
  return detail.correct ? "correct" : "wrong";
}
