import { useCallback, useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCheck, FiCircle, FiEdit3, FiMoreHorizontal, FiX, FiZap } from "react-icons/fi";
import ProfilePanel from "../components/ProfilePanel";
import Sidebar from "../components/Sidebar";
import SiteFooter from "../components/SiteFooter";
import SidebarResizeHandle from "../components/SidebarResizeHandle";
import TopBar from "../components/TopBar";

export default function TestReview({ result, state, onSaveNote, onBack, view, setView, isAdmin, theme, setTheme, user, trialActive, onSignOut, onUpgrade }) {
  const [filter, setFilter] = useState("all");
  const [index, setIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isDragging, setIsDragging] = useState(false);
  const minWidth = 72;
  const maxWidth = 400;
  const defaultWidth = 256;
  const list = useMemo(() => result.details.map((detail, originalIndex) => ({ detail, originalIndex })).filter(({ detail }) => filter === "all" || statusOf(detail) === filter), [result.details, filter]);
  const current = list[Math.min(index, Math.max(0, list.length - 1))];
  const sidebarOffset = sidebarWidth;

  const startResizing = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const stopResizing = useCallback(() => setIsDragging(false), []);

  const resize = useCallback((event) => {
    if (!isDragging) return;
    const newWidth = event.clientX;
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
      if (sidebarCollapsed && newWidth > minWidth + 10) setSidebarCollapsed(false);
    } else if (newWidth < minWidth) {
      setSidebarWidth(minWidth);
      setSidebarCollapsed(true);
    } else {
      setSidebarWidth(maxWidth);
    }
  }, [isDragging, sidebarCollapsed]);

  useEffect(() => {
    if (!isDragging) return undefined;
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isDragging, resize, stopResizing]);

  const handleHeaderNavigation = (nextView) => {
    if (nextView === "menu") {
      setSidebarOpen(true);
      return;
    }
    setView(nextView);
  };

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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <TopBar
        setView={handleHeaderNavigation}
        theme={theme}
        setTheme={setTheme}
        user={user}
        isAdmin={isAdmin}
        trialActive={trialActive}
        testRunning={false}
        testTimeLabel=""
        sidebarVisible
        sidebarCollapsed={sidebarCollapsed}
        sidebarWidth={sidebarWidth}
        onSignOut={onSignOut}
        onUpgrade={onUpgrade}
        onOpenProfile={() => setProfileOpen(true)}
      />
      <aside style={{ width: `${sidebarOffset}px`, "--tracepg-sidebar-offset": `${sidebarOffset}px` }} className="scrollbar-invisible fixed inset-y-0 left-0 z-40 hidden overflow-x-hidden overflow-y-auto border-r border-slate-200/80 bg-white/95 py-6 shadow-xl backdrop-blur transition-[width,padding] duration-300 ease-out lg:block dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-none">
        <Sidebar view={view} setView={setView} isAdmin={isAdmin} collapsed={sidebarCollapsed} onToggle={() => { setSidebarWidth(sidebarCollapsed ? defaultWidth : minWidth); setSidebarCollapsed((currentState) => !currentState); }} />
      </aside>
      <SidebarResizeHandle width={sidebarWidth} isDragging={isDragging} onStartResize={startResizing} />
      <div style={{ "--tracepg-sidebar-offset": `${sidebarOffset}px` }} className="sidebar-content-offset transition-[margin] duration-300 ease-out">
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 pb-10 sm:px-6 lg:py-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#062b75] via-[#075fe3] to-[#6d28d9] p-5 text-white shadow-[0_20px_60px_-30px_rgba(7,95,227,.8)] sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20" onClick={onBack}><FiArrowLeft aria-hidden="true" /> Back to result</button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20" aria-label="Open sidebar" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(true)}><FiMoreHorizontal aria-hidden="true" /> Menu</button>
          </div>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-100">Test review</span>
        </div>
        <div className="mt-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-blue-100">Review your attempt</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{result.title}</h1>
            <p className="mt-2 text-sm text-blue-100">Check each answer, read the explanation, and save notes for revision.</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-right backdrop-blur-sm">
            <strong className="block text-2xl font-black">{result.total}</strong>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Questions</span>
          </div>
        </div>
        </section>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        {["all", "correct", "wrong", "unattempted"].map((item) => <button key={item} className={`rounded-xl px-3 py-2 text-xs font-bold capitalize transition ${filter === item ? "bg-brand-600 text-white shadow-md shadow-blue-200 dark:shadow-none" : "bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-brand-600 dark:bg-slate-800 dark:text-slate-300"}`} onClick={() => changeFilter(item)}>{item} {item === "all" ? result.total : result.details.filter((detail) => statusOf(detail) === item).length}</button>)}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_250px]">
          <article className="surface-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-slate-500">Question {originalIndex + 1} / {result.total}</span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${status === "correct" ? "bg-emerald-100 text-emerald-700" : status === "wrong" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{status === "correct" ? <><FiCheck aria-hidden="true" /> Correct</> : status === "wrong" ? <><FiX aria-hidden="true" /> Wrong</> : <><FiCircle aria-hidden="true" /> Unattempted</>}</span>
            </div>
            {question ? <>
              <div className="mt-4 flex flex-wrap gap-2"><span className="tag">{question.subject || "Question"}</span><span className="tag">{question.difficulty || "Medium"}</span></div>
              <h1 className="mt-5 text-xl font-extrabold leading-8">{question.q}</h1>
              <div className="mt-5 grid gap-3">{question.o.map((option, optionIndex) => <div key={optionIndex} className={`rounded-xl border p-3 text-sm ${optionIndex === question.a ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200" : detail.answer === optionIndex ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200" : "border-slate-200 dark:border-slate-700"}`}><b className="mr-2">{String.fromCharCode(65 + optionIndex)}.</b>{option}{optionIndex === question.a && <FiCheck className="ml-2 inline text-emerald-600" aria-label="Correct answer" />}{detail.answer === optionIndex && optionIndex !== question.a && <FiX className="ml-2 inline text-rose-600" aria-label="Your incorrect answer" />}</div>)}</div>
              <div className={`mt-5 rounded-xl p-4 text-sm ${status === "wrong" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200"}`}><b>Your answer:</b> {yourAnswer}</div>
              <div className="mt-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200"><b>Correct answer:</b> {correctAnswer}</div>
              <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-slate-600 dark:bg-blue-950/30 dark:text-slate-300"><b className="inline-flex items-center gap-2"><FiZap className="text-brand-600" aria-hidden="true" /> Full solution</b><p className="mt-2">{question.e || "No explanation available."}</p></div>
              <div className="mt-5"><label className="inline-flex items-center gap-2 text-sm font-bold"><FiEdit3 className="text-brand-600" aria-hidden="true" /> Revision note</label><textarea className="field mt-2 min-h-24" defaultValue={note} onBlur={(event) => onSaveNote(question.id, event.target.value)} placeholder="Add a note for revision…" /><p className="mt-2 text-xs text-slate-400">Notes save when you leave this field.</p></div>
            </> : <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">This older history record does not contain a question snapshot. New test attempts will support full review.</p>}
            <div className="mt-7 flex justify-between gap-3"><button className="secondary-button inline-flex items-center gap-2" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}><FiArrowLeft aria-hidden="true" /> Previous</button><button className="primary-button inline-flex items-center gap-2" disabled={index === list.length - 1} onClick={() => setIndex((value) => value + 1)}>Next <FiArrowRight aria-hidden="true" /></button></div>
          </article>

          <aside className="surface-card h-fit">
            <h2 className="font-extrabold">Questions</h2>
            <div className="mt-4 grid grid-cols-5 gap-2">{result.details.map((detail, itemIndex) => <button key={itemIndex} className={`grid h-9 w-9 place-items-center rounded-lg border text-xs font-bold ${itemIndex === originalIndex ? "border-brand-500 bg-brand-600 text-white" : statusOf(detail) === "correct" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : statusOf(detail) === "wrong" ? "border-rose-300 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-500 dark:border-slate-700"}`} onClick={() => { const target = list.findIndex((item) => item.originalIndex === itemIndex); if (target >= 0) setIndex(target); }}>{itemIndex + 1}</button>)}</div>
          </aside>
        </div>
      </div>
      </div>
      <SiteFooter />
      {profileOpen && <ProfilePanel user={user} onClose={() => setProfileOpen(false)} onSignOut={onSignOut} />}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[70]">
          <button className="motion-backdrop absolute inset-0 h-full w-full bg-slate-950/40" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} />
          <aside className="motion-drawer scrollbar-invisible absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-slate-200 bg-white px-4 py-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <Sidebar view={view} setView={(nextView) => { setSidebarOpen(false); setView(nextView); }} isAdmin={isAdmin} closeOnSelect onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}
      {isDragging && <div className="fixed inset-0 z-50 cursor-col-resize select-none" />}
    </div>
  );
}

function statusOf(detail) {
  if (detail.answer === undefined) return "unattempted";
  return detail.correct ? "correct" : "wrong";
}
