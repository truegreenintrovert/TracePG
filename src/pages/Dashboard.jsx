import StatCard from "../components/StatCard";
import { formatDate, getDueQuestions, getSubjectStats } from "../lib/study";
import { FiAlertTriangle, FiArrowRight, FiBarChart2, FiBookOpen, FiCheckCircle, FiClock, FiCpu, FiFileText, FiRepeat, FiTarget, FiZap } from "react-icons/fi";

export default function Dashboard({
  questions,
  state,
  onNavigate,
  onStartAdaptive,
  onContinueTest,
}) {
  const stats = getSubjectStats(questions, state);
  const due = getDueQuestions(questions, state);
  const attempted = Object.keys(state.attempts).length;
  const today = new Date().toDateString();
  const todaySolved = state.history
    .filter((item) => new Date(item.date).toDateString() === today)
    .reduce((total, item) => total + item.total, 0);
  const weak = stats
    .filter((item) => item.attempted)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);
  const pausedTests = state.pausedTests?.length
    ? state.pausedTests
    : state.pausedTest
      ? [state.pausedTest]
      : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">
          Your preparation cockpit
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          NEET-PG Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          A focused study workspace for practice, revision, and performance
          tracking.
        </p>
      </div>

      {pausedTests.length > 0 && (
        <section className="surface-card border-brand-200 bg-blue-50/70 dark:border-brand-900/70 dark:bg-brand-950/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-600">Ongoing tests</p>
              <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">Paused tests</h2>
              <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">Continue any test whenever you are ready.</p>
            </div>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white"><FiClock aria-hidden="true" /></span>
          </div>
          <div className="mt-4 space-y-3">
            {pausedTests.map((pausedTest, index) => (
              <div key={pausedTest.id || `${pausedTest.title}-${pausedTest.pausedAt || index}`} className="flex flex-col gap-3 rounded-2xl border border-brand-100 bg-white/80 p-4 dark:border-brand-900/60 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-950 dark:text-white">{pausedTest.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{Object.keys(pausedTest.answers || {}).length} of {pausedTest.questions?.length || 0} questions answered · Saved {formatPausedTime(pausedTest.pausedAt)}</p>
                </div>
                <button className="primary-button inline-flex shrink-0 items-center justify-center gap-2" onClick={() => onContinueTest(pausedTest.id)}>Continue test <FiArrowRight aria-hidden="true" /></button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-600 to-sky-400 p-6 text-white shadow-2xl shadow-blue-200 sm:p-8 dark:shadow-none">
        <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-100">
          Study HQ
        </span>
        <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
          Make every question count.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
          Start with a focused test, review weak areas, and keep your
          preparation moving with clear progress signals.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-brand-700 transition hover:-translate-y-0.5"
            onClick={() => onNavigate("test")}
          >
            <><FiTarget aria-hidden="true" /> Start a test</>
          </button>
          <button
            className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20"
            onClick={() => onNavigate("revision")}
          >
            <><FiRepeat aria-hidden="true" /> Revise due ({due.length})</>
          </button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          value={questions.length.toLocaleString()}
          label="MCQs"
          icon={<FiBookOpen aria-hidden="true" />}
        />
        <StatCard
          value={new Set(questions.map((question) => question.subject)).size}
          label="Subjects"
          icon={<FiCpu aria-hidden="true" />}
        />
        <StatCard value={attempted} label="Questions attempted" icon={<FiCheckCircle aria-hidden="true" />} />
        <StatCard
          value={state.wrong.length}
          label="Wrong questions"
          icon={<FiTarget aria-hidden="true" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="surface-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-extrabold"><FiTarget className="text-brand-600" aria-hidden="true" /> Today&apos;s goal</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Build a steady revision habit.
              </p>
            </div>
            <FiZap className="text-2xl text-amber-400" aria-hidden="true" />
          </div>
          <div className="mt-6 flex items-end justify-between">
            <strong className="text-3xl font-black">
              {Math.min(todaySolved, state.dailyTarget)}{" "}
              <span className="text-base font-semibold text-slate-400">
                / {state.dailyTarget}
              </span>
            </strong>
            <span className="text-sm font-bold text-brand-600">
              {Math.min(
                100,
                Math.round((todaySolved / state.dailyTarget) * 100),
              )}
              %
            </span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{
                width: `${Math.min(100, Math.round((todaySolved / state.dailyTarget) * 100))}%`,
              }}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="primary-button"
              onClick={() => onNavigate("revision")}
            >
              Start revision
            </button>
            <button
              className="secondary-button"
              onClick={() => onNavigate("test")}
            >
              Set up a test
            </button>
          </div>
        </section>
        <section className="surface-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-extrabold"><FiAlertTriangle className="text-amber-500" aria-hidden="true" /> Weakest areas</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Use these to plan your next block.
              </p>
            </div>
            <button
              className="text-sm font-bold text-brand-600"
              onClick={() => onNavigate("analytics")}
            >
              See all
            </button>
          </div>
          <div className="mt-5 space-y-4">
            {weak.length ? (
              weak.map((item) => (
                <div key={item.subject}>
                  <div className="flex justify-between text-sm">
                    <b>{item.subject}</b>
                    <span className="text-slate-500">
                      {item.accuracy}% · {item.attempted} attempted
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${Math.max(4, item.accuracy)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800">
                Attempt a few questions to generate weakness analysis.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="surface-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold">Quick start</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Jump directly into the workflow you need.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="primary-button" onClick={() => onNavigate("test")}>
            <><FiTarget aria-hidden="true" /> Create test</>
          </button>
          <button
            className="secondary-button"
            onClick={() => onNavigate("bank")}
          >
            <><FiBookOpen aria-hidden="true" /> Question bank</>
          </button>
          <button
            className="secondary-button"
            onClick={() => onNavigate("papers")}
          >
            <><FiFileText aria-hidden="true" /> PYQ papers</>
          </button>
          <button
            className="secondary-button"
            onClick={() => onStartAdaptive()}
          >
            <><FiCpu aria-hidden="true" /> Smart adaptive</>
          </button>
        </div>
      </section>

      {state.history.length > 0 && (
        <section className="surface-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Recent attempts</h2>
            <button
              className="text-sm font-bold text-brand-600"
              onClick={() => onNavigate("history")}
            >
              View history
            </button>
          </div>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {state.history.slice(0, 3).map((item, index) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 py-3"
                key={`${item.date}-${index}`}
              >
                <div>
                  <b>{item.title}</b>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(item.date)} · {item.correct}/{item.total}{" "}
                    correct
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-brand-700 dark:bg-brand-900/50 dark:text-blue-200">
                  {item.score} pts
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function formatPausedTime(timestamp) {
  if (!timestamp) return "just now";
  const minutes = Math.max(0, Math.floor((Date.now() - Number(timestamp)) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}
