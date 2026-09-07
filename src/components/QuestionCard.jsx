import { useState } from "react";
import { FiBookmark, FiFileText, FiZap } from "react-icons/fi";

export default function QuestionCard({
  question,
  bookmarked,
  onBookmark,
  showAnswer = true,
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <article className="surface-card">
      <div className="flex flex-wrap items-center gap-2">
        <span className="tag">{question.subject}</span>
        <span className="tag">{question.difficulty || "Medium"}</span>
        {question.pyqYears?.slice(0, 2).map((year) => (
          <span className="tag tag-blue" key={year}>
            PYQ {year}
          </span>
        ))}
        <button
          className="ml-auto text-lg"
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark question"}
          onClick={() => onBookmark(question.id)}
        >
          {bookmarked ? <FiBookmark className="fill-current" aria-hidden="true" /> : <FiFileText aria-hidden="true" />}
        </button>
      </div>
      <h3 className="mt-4 text-base font-bold leading-7 text-slate-900 dark:text-white">
        {question.q}
      </h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {(question.o || []).map((option, index) => (
          <div
            className={`rounded-xl border px-3 py-2 text-sm ${revealed && index === question.a ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200" : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}
            key={option}
          >
            <b className="mr-2">{String.fromCharCode(65 + index)}.</b>
            {option}
          </div>
        ))}
      </div>
      {showAnswer && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            className="secondary-button"
            onClick={() => setRevealed((value) => !value)}
          >
            {revealed ? "Hide answer" : "Show answer"}
          </button>
          {revealed && (
            <span className="text-sm font-semibold text-emerald-600">
              Correct: {String.fromCharCode(65 + question.a)}.{" "}
              {question.o?.[question.a]}
            </span>
          )}
        </div>
      )}
      {revealed && question.e && (
        <p className="mt-4 rounded-xl bg-blue-50 p-3 text-sm leading-6 text-slate-600 dark:bg-blue-950/30 dark:text-slate-300">
          <FiZap className="mr-1 inline text-brand-600" aria-hidden="true" /> {question.e}
        </p>
      )}
    </article>
  );
}
