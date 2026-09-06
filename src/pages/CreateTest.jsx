import { useMemo, useState } from "react";
import { getSubjects, shuffle } from "../lib/study";

export default function CreateTest({ questions, state, onStart }) {
  const subjects = getSubjects(questions);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [count, setCount] = useState(20);
  const [mode, setMode] = useState("all");
  const topics = useMemo(
    () => [...new Set(
      questions
        .filter((question) => selectedSubjects.includes(question.subject))
        .map((question) => String(question.chapter || question.topic || "General").trim())
        .filter(Boolean),
    )].sort((a, b) => a.localeCompare(b)),
    [questions, selectedSubjects],
  );
  const selectedTopic = topics.includes(topic) || topic === "__all__" ? topic : "";
  const available = useMemo(
    () =>
      questions.filter(
        (question) =>
            (!selectedSubjects.length ||
            selectedSubjects.includes(question.subject)) &&
          (!selectedTopic || selectedTopic === "__all__" || (question.chapter || question.topic || "General") === selectedTopic) &&
          (!difficulty || question.difficulty === difficulty) &&
          (mode === "all" ||
            (mode === "wrong" && state.wrong.includes(question.id)) ||
            (mode === "bookmarked" && state.bookmarks.includes(question.id))),
      ),
    [questions, selectedSubjects, selectedTopic, difficulty, mode, state],
  );
  const toggleSubject = (subject) =>
    setSelectedSubjects((current) =>
      current.includes(subject)
        ? current.filter((item) => item !== subject)
        : [...current, subject],
    );
  const start = () => {
    const picked = shuffle(available).slice(
      0,
      Math.min(Number(count), available.length),
    );
    if (picked.length) onStart(picked, "Custom Practice Test");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">
          Build a practice block
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Create Test
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Choose the scope, then let TracePG assemble a focused set.
        </p>
      </div>
      <section className="surface-card">
        <h2 className="text-lg font-extrabold">1. Choose subjects</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-semibold transition ${selectedSubjects.includes(subject) ? "border-brand-500 bg-blue-50 text-brand-700 dark:bg-brand-900/40 dark:text-blue-200" : "border-slate-200 dark:border-slate-700"}`}
              key={subject}
            >
              <input
                type="checkbox"
                checked={selectedSubjects.includes(subject)}
                onChange={() => toggleSubject(subject)}
              />
              {subject}
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="secondary-button"
            onClick={() => setSelectedSubjects(subjects)}
          >
            Select all
          </button>
          <button
            className="secondary-button"
            onClick={() => setSelectedSubjects([])}
          >
            Clear
          </button>
        </div>
      </section>
      <section className="surface-card">
        <h2 className="text-lg font-extrabold">2. Choose topic</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Select a subject first to load its chapters and topics.
        </p>
        <select
          className="field mt-4"
          value={selectedTopic}
          disabled={!selectedSubjects.length}
          onChange={(event) => setTopic(event.target.value)}
        >
          <option value="">{selectedSubjects.length ? "Select topic" : "Select subject first"}</option>
          {selectedSubjects.length > 0 && <option value="__all__">All topics</option>}
          {topics.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        {selectedSubjects.length > 0 && !topics.length && (
          <p className="mt-3 text-sm font-semibold text-amber-600">No chapter/topic value is available for this subject.</p>
        )}
      </section>
      <section className="surface-card">
        <h2 className="text-lg font-extrabold">3. Set the mix</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm font-bold">
            Difficulty
            <select
              className="field mt-2"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            >
              <option value="">All difficulty</option>
              <option>Easy</option>
              <option>Moderate</option>
              <option>Hard</option>
            </select>
          </label>
          <label className="text-sm font-bold">
            Practice mode
            <select
              className="field mt-2"
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="all">All questions</option>
              <option value="wrong">Previously wrong</option>
              <option value="bookmarked">Bookmarked</option>
            </select>
          </label>
          <label className="text-sm font-bold">
            Questions
            <input
              className="field mt-2"
              type="number"
              min="5"
              max="200"
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
          </label>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            className="primary-button"
            disabled={!available.length || (selectedSubjects.length > 0 && !selectedTopic)}
            onClick={start}
          >
            🎯 Start test
          </button>
          <span className="text-sm font-semibold text-slate-500">
            {available.length.toLocaleString()} questions available
          </span>
        </div>
      </section>
    </div>
  );
}
