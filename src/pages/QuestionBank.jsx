import { useMemo, useState } from "react";
import QuestionCard from "../components/QuestionCard";
import { getSubjects } from "../lib/study";

export default function QuestionBank({ questions, state, onBookmark }) {
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      questions
        .filter(
          (question) =>
            (!subject || question.subject === subject) &&
            (!difficulty || question.difficulty === difficulty) &&
            (!search ||
              `${question.q} ${(question.o || []).join(" ")} ${question.e || ""}`
                .toLowerCase()
                .includes(search.toLowerCase())),
        )
        .slice(0, 100),
    [questions, subject, difficulty, search],
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">
          Practice library
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Question Bank
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Search, filter, and bookmark high-yield questions from the full bank.
        </p>
      </div>
      <section className="surface-card">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
          <input
            className="field"
            placeholder="Search question, option, or explanation"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="field"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          >
            <option value="">All subjects</option>
            {getSubjects(questions).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            className="field"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
          >
            <option value="">All difficulty</option>
            <option>Easy</option>
            <option>Moderate</option>
            <option>Hard</option>
          </select>
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-500">
          Showing {filtered.length} matching questions
        </p>
      </section>
      <div className="space-y-4">
        {filtered.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            bookmarked={state.bookmarks.includes(question.id)}
            onBookmark={onBookmark}
          />
        ))}
        {filtered.length === 0 && (
          <div className="surface-card py-12 text-center text-slate-500">
            No questions match these filters.
          </div>
        )}
      </div>
    </div>
  );
}
