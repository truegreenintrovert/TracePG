import { useEffect, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiFlag, FiPause, FiSend, FiTrash2 } from "react-icons/fi";

export default function TestRunner({ test, onSubmit, onPause, onTimeChange }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(() => test.answers || {});
  const [review, setReview] = useState(() => test.review || []);
  const [endAt] = useState(() => Number(test.endAt) || Date.now() + Number(test.secondsRemaining ?? test.questions.length * 60) * 1000);
  const [now, setNow] = useState(() => Date.now());
  const question = test.questions[index];
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.ceil((endAt - now) / 1000));
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / test.questions.length) * 100);
  const timeLabel = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  useEffect(() => {
    onTimeChange?.(timeLabel);
  }, [timeLabel, onTimeChange]);
  const answer = (value) =>
    setAnswers((current) => ({ ...current, [question.id]: value }));
  const submit = () =>
    onSubmit({
      ...test,
      answers,
      review,
      secondsSpent: test.questions.length * 60 - seconds,
    });
  useEffect(() => {
    if (seconds === 0) submit();
  }, [seconds]);
  const toggleReview = () =>
    setReview((current) => current.includes(question.id)
      ? current.filter((id) => id !== question.id)
      : [...current, question.id]);
  const clearAnswer = () =>
    setAnswers((current) => {
      const next = { ...current };
      delete next[question.id];
      return next;
    });
  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-24 sm:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">
            Focused practice
          </p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">{test.title}</h1>
        </div>
      </div>
      <div className="surface-card">
        <div className="flex items-center justify-between text-sm font-bold">
          <span>
            Question {index + 1} of {test.questions.length}
          </span>
          <span className="text-slate-500">{answered} answered</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-600"
            style={{ width: `${Math.max(4, progress)}%` }}
          />
        </div>
        <h2 className="mt-8 text-xl font-extrabold leading-8">{question.q}</h2>
        <div className="mt-6 grid gap-3">
          {question.o.map((option, optionIndex) => (
            <button
              className={`rounded-2xl border p-4 text-left text-sm font-semibold transition ${answers[question.id] === optionIndex ? "border-brand-500 bg-blue-50 text-brand-800 ring-4 ring-blue-100 dark:bg-brand-900/40 dark:text-blue-100 dark:ring-blue-950" : "border-slate-200 hover:border-brand-300 dark:border-slate-700"}`}
              key={option}
              onClick={() => answer(optionIndex)}
            >
              <b className="mr-3">{String.fromCharCode(65 + optionIndex)}.</b>
              {option}
            </button>
          ))}
        </div>
        <div className="sticky bottom-3 z-20 -mx-2 mt-8 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur sm:static sm:mx-0 sm:flex-row sm:justify-between sm:gap-3 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none dark:border-slate-700 dark:bg-slate-900/95 sm:dark:bg-transparent">
          <button
            className="secondary-button inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            disabled={index === 0}
            onClick={() => setIndex((value) => value - 1)}
          >
            <><FiArrowLeft aria-hidden="true" /> Previous</>
          </button>
          {index === test.questions.length - 1 ? (
            <button className="primary-button inline-flex w-full items-center justify-center gap-2 sm:w-auto" onClick={submit}>
              <><FiSend aria-hidden="true" /> Submit test</>
            </button>
          ) : (
            <button
              className="primary-button inline-flex w-full items-center justify-center gap-2 sm:w-auto"
              onClick={() => setIndex((value) => value + 1)}
            >
              <><FiArrowRight aria-hidden="true" /> Next</>
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="secondary-button inline-flex items-center gap-2" onClick={toggleReview}>
            <FiFlag aria-hidden="true" /> {review.includes(question.id) ? "Unmark review" : "Mark for review"}
          </button>
          <button className="secondary-button inline-flex items-center gap-2" onClick={clearAnswer} disabled={answers[question.id] === undefined}>
            <FiTrash2 aria-hidden="true" />
            Clear answer
          </button>
        </div>
        <button className="secondary-button mt-4 inline-flex items-center gap-2" onClick={() => onPause?.({ questions: test.questions, title: test.title, answers, review, secondsRemaining: seconds })}>
          <FiPause aria-hidden="true" /> Pause test
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {test.questions.map((item, itemIndex) => (
          <button
            key={item.id}
            aria-label={`Go to question ${itemIndex + 1}`}
            className={`grid h-9 w-9 place-items-center rounded-lg border text-xs font-bold ${itemIndex === index ? "border-brand-500 bg-brand-600 text-white" : answers[item.id] !== undefined && review.includes(item.id) ? "border-amber-300 bg-amber-50 text-amber-700" : answers[item.id] !== undefined ? "border-emerald-300 bg-emerald-50 text-emerald-700" : review.includes(item.id) ? "border-amber-300 text-amber-700" : "border-slate-200 dark:border-slate-700"}`}
            onClick={() => setIndex(itemIndex)}
          >
            {itemIndex + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
