import { getDueQuestions, shuffle } from "../lib/study";
import { FiRepeat, FiTarget } from "react-icons/fi";

export default function Revision({ questions, state, onStart }) {
  const due = getDueQuestions(questions, state);
  const wrong = state.wrong
    .map((id) => questions.find((question) => question.id === id))
    .filter(Boolean);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">
          Spaced repetition
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Smart Revision
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Bring due and repeatedly missed questions back into focus.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="surface-card">
          <FiRepeat className="text-3xl text-brand-600" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-extrabold">Due today</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {due.length
              ? `${due.length} questions are ready for a focused review.`
              : "No questions are due right now."}
          </p>
          <button
            className="primary-button mt-5"
            disabled={!due.length}
            onClick={() => onStart(shuffle(due).slice(0, 30), "Smart Revision")}
          >
            Start due revision
          </button>
        </section>
        <section className="surface-card">
          <FiTarget className="text-3xl text-brand-600" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-extrabold">Repeated wrong</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {wrong.length
              ? `${wrong.length} questions need another pass.`
              : "Your wrong-question list is clear."}
          </p>
          <button
            className="secondary-button mt-5"
            disabled={!wrong.length}
            onClick={() =>
              onStart(shuffle(wrong).slice(0, 30), "Repeated-Wrong Priority")
            }
          >
            Review wrong questions
          </button>
        </section>
      </div>
    </div>
  );
}
