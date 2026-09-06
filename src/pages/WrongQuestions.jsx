import QuestionCard from "../components/QuestionCard";

export default function WrongQuestions({ questions, state, onBookmark }) {
  const wrong = state.wrong
    .map((id) => questions.find((question) => question.id === id))
    .filter(Boolean);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">
          Targeted practice
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Wrong Questions
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Revisit the questions that can create the biggest score improvement.
        </p>
      </div>
      <div className="space-y-4">
        {wrong.length ? (
          wrong.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              bookmarked={state.bookmarks.includes(question.id)}
              onBookmark={onBookmark}
            />
          ))
        ) : (
          <div className="surface-card py-16 text-center text-slate-500">
            No wrong questions yet. Keep practicing.
          </div>
        )}
      </div>
    </div>
  );
}
