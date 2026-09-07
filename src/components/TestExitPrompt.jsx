import { FiClock } from "react-icons/fi";

export default function TestExitPrompt({ onContinue }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="test-exit-title">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-slate-900">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-2xl text-amber-600 dark:bg-amber-950/50 dark:text-amber-200"><FiClock aria-hidden="true" /></div>
        <h2 id="test-exit-title" className="mt-4 text-xl font-black">Test in progress</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Your test is not submitted yet. Continue the test to keep your answers and timer active.</p>
        <button className="primary-button mt-6 w-full" onClick={onContinue}>Continue test</button>
      </section>
    </div>
  );
}
