import { useState } from "react";

export default function Notes({ questions, state, onSave }) {
  const noted = questions.filter((question) => state.notes[question.id]);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">
          Your revision memory
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Notes
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Keep explanations and reminders close to the questions they belong to.
        </p>
      </div>
      {noted.length ? (
        <div className="space-y-4">
          {noted.map((question) => (
            <NoteCard
              key={question.id}
              question={question}
              value={state.notes[question.id]}
              onSave={onSave}
            />
          ))}
        </div>
      ) : (
        <div className="surface-card py-16 text-center text-slate-500">
          No notes yet. Add them from the question bank when you find a
          high-yield explanation.
        </div>
      )}
    </div>
  );
}
function NoteCard({ question, value, onSave }) {
  const [note, setNote] = useState(value);
  return (
    <section className="surface-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="tag">{question.subject}</span>
          <h2 className="mt-3 font-extrabold leading-6">{question.q}</h2>
        </div>
        <button
          className="secondary-button"
          onClick={() => onSave(question.id, note)}
        >
          Save note
        </button>
      </div>
      <textarea
        className="field mt-4 min-h-28"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
    </section>
  );
}
