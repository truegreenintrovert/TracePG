import { useEffect, useState } from "react";
import { adminFetch } from "../lib/adminApi";
import BulkQuestionUpload from "./BulkQuestionUpload";
import SupportContentEditor from "./SupportContentEditor";

const emptyQuestion = {
  subject: "Anatomy",
  chapter: "",
  difficulty: "Moderate",
  source: "",
  sourceNo: "",
  q: "",
  o: ["", "", "", ""],
  a: 0,
  e: "",
};

const emptyPyq = {
  year: new Date().getFullYear().toString(),
  no: "",
  subject: "",
  source_file: "",
  q: "",
  o: ["", "", "", ""],
  a: 0,
  image_based: false,
};

export default function AdminPanel({ onBack }) {
  const [tab, setTab] = useState("questions");
  const [question, setQuestion] = useState(emptyQuestion);
  const [pyq, setPyq] = useState(emptyPyq);
  const [policies, setPolicies] = useState([]);
  const [supportPages, setSupportPages] = useState([]);
  const [counts, setCounts] = useState({ questions: 0, pyqs: 0 });
  const [policySlug, setPolicySlug] = useState("privacy");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAdminData = async () => {
    try {
      const [questionCounts, policyData, supportData] = await Promise.all([
        adminFetch("/api/admin/questions"),
        adminFetch("/api/admin/policies"),
        adminFetch("/api/admin/support-content"),
      ]);
      setCounts(questionCounts);
      setPolicies(policyData.policies || []);
      setSupportPages(supportData.pages || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const submitQuestion = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const type = tab === "pyqs" ? "pyqs" : "questions";
    try {
      const payload = await adminFetch("/api/admin/questions", {
        method: "POST",
        body: JSON.stringify({ type, question: type === "pyqs" ? pyq : question }),
      });
      setMessage(`${type === "pyqs" ? "PYQ" : "Question"} added successfully with ID ${payload.id}.`);
      if (type === "pyqs") setPyq({ ...emptyPyq });
      else setQuestion({ ...emptyQuestion, o: ["", "", "", ""] });
      await loadAdminData();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  };

  const updatePolicy = (changes) => {
    setPolicies((items) => items.map((policy) => policy.slug === policySlug ? { ...policy, ...changes } : policy));
  };

  const currentPolicy = policies.find((policy) => policy.slug === policySlug);

  const savePolicy = async (event) => {
    event.preventDefault();
    if (!currentPolicy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await adminFetch("/api/admin/policies", {
        method: "PUT",
        body: JSON.stringify(currentPolicy),
      });
      setMessage(`${currentPolicy.label} updated successfully.`);
      await loadAdminData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  const updateQuestion = (changes) => {
    if (tab === "pyqs") setPyq((current) => ({ ...current, ...changes }));
    else setQuestion((current) => ({ ...current, ...changes }));
  };
  const currentQuestion = tab === "pyqs" ? pyq : question;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">Restricted workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Admin panel</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage study content and the public legal pages.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="primary-button" onClick={() => setTab("bulk")}>⬆ Bulk upload</button>
          <button className="secondary-button" onClick={onBack}>← Back to dashboard</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="stat-card"><strong>{counts.questions}</strong><span>Main questions</span></div>
        <div className="stat-card"><strong>{counts.pyqs}</strong><span>PYQs</span></div>
      </div>

      {(error || message) && <div className={`rounded-2xl p-4 text-sm font-semibold ${error ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"}`}>{error || message}</div>}

      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800">
        <button className={`rounded-t-xl px-4 py-3 text-sm font-bold ${tab === "questions" ? "bg-brand-600 text-white" : "text-slate-500"}`} onClick={() => setTab("questions")}>Add question</button>
        <button className={`rounded-t-xl px-4 py-3 text-sm font-bold ${tab === "pyqs" ? "bg-brand-600 text-white" : "text-slate-500"}`} onClick={() => setTab("pyqs")}>Add PYQ</button>
        <button className={`rounded-t-xl px-4 py-3 text-sm font-bold ${tab === "bulk" ? "bg-brand-600 text-white" : "text-slate-500"}`} onClick={() => setTab("bulk")}>Bulk upload</button>
        <button className={`rounded-t-xl px-4 py-3 text-sm font-bold ${tab === "support" ? "bg-brand-600 text-white" : "text-slate-500"}`} onClick={() => setTab("support")}>Help & Q&A</button>
        <button className={`rounded-t-xl px-4 py-3 text-sm font-bold ${tab === "policies" ? "bg-brand-600 text-white" : "text-slate-500"}`} onClick={() => setTab("policies")}>Edit policies</button>
      </div>

      {tab === "bulk" ? <BulkQuestionUpload onUploaded={loadAdminData} /> : tab === "support" ? <SupportContentEditor pages={supportPages} onSaved={loadAdminData} /> : tab !== "policies" ? (
        <form className="surface-card space-y-5" onSubmit={submitQuestion}>
          <div className="grid gap-4 sm:grid-cols-2">
            {tab === "questions" ? <>
              <Field label="Subject" value={question.subject} onChange={(value) => updateQuestion({ subject: value })} required />
              <Field label="Chapter" value={question.chapter} onChange={(value) => updateQuestion({ chapter: value })} />
              <SelectField label="Difficulty" value={question.difficulty} options={["Easy", "Moderate", "Hard"]} onChange={(value) => updateQuestion({ difficulty: value })} />
              <Field label="Source" value={question.source} onChange={(value) => updateQuestion({ source: value })} />
              <Field label="Source number" type="number" value={question.sourceNo} onChange={(value) => updateQuestion({ sourceNo: value })} />
            </> : <>
              <Field label="Year" value={pyq.year} onChange={(value) => updateQuestion({ year: value })} required />
              <Field label="Question number" type="number" value={pyq.no} onChange={(value) => updateQuestion({ no: value })} />
              <Field label="Subject" value={pyq.subject} onChange={(value) => updateQuestion({ subject: value })} />
              <Field label="Source file" value={pyq.source_file} onChange={(value) => updateQuestion({ source_file: value })} />
            </>}
          </div>
          <label className="block text-sm font-bold">Question<textarea className="field mt-2 min-h-28" value={currentQuestion.q} onChange={(event) => updateQuestion({ q: event.target.value })} required /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            {currentQuestion.o.map((option, index) => <Field key={index} label={`Option ${String.fromCharCode(65 + index)}`} value={option} onChange={(value) => updateQuestion({ o: currentQuestion.o.map((item, itemIndex) => itemIndex === index ? value : item) })} required />)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Correct option" value={String(currentQuestion.a)} options={["0 - A", "1 - B", "2 - C", "3 - D"]} onChange={(value) => updateQuestion({ a: Number(value) })} />
            {tab === "questions" && <label className="block text-sm font-bold">Explanation<textarea className="field mt-2 min-h-24" value={question.e} onChange={(event) => updateQuestion({ e: event.target.value })} /></label>}
          </div>
          <button className="primary-button" disabled={busy}>{busy ? "Saving…" : `Add ${tab === "pyqs" ? "PYQ" : "question"}`}</button>
        </form>
      ) : (
        <form className="surface-card space-y-5" onSubmit={savePolicy}>
          <div className="flex flex-wrap gap-2">
            {policies.map((policy) => <button type="button" key={policy.slug} className={`rounded-xl px-4 py-2 text-sm font-bold ${policySlug === policy.slug ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`} onClick={() => setPolicySlug(policy.slug)}>{policy.label}</button>)}
          </div>
          {currentPolicy && <>
            <Field label="Page title" value={currentPolicy.title} onChange={(value) => updatePolicy({ title: value })} required />
            <label className="block text-sm font-bold">Introduction<textarea className="field mt-2 min-h-24" value={currentPolicy.intro} onChange={(event) => updatePolicy({ intro: event.target.value })} required /></label>
            <div className="space-y-4">
              {currentPolicy.sections.map(([heading, body], index) => <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700" key={index}>
                <Field label={`Section ${index + 1} heading`} value={heading} onChange={(value) => updatePolicy({ sections: currentPolicy.sections.map((section, sectionIndex) => sectionIndex === index ? [value, body] : section) })} required />
                <label className="mt-3 block text-sm font-bold">Section body<textarea className="field mt-2 min-h-32" value={body} onChange={(event) => updatePolicy({ sections: currentPolicy.sections.map((section, sectionIndex) => sectionIndex === index ? [heading, event.target.value] : section) })} required /></label>
              </div>)}
            </div>
            <button className="primary-button" disabled={busy}>{busy ? "Saving…" : "Save policy"}</button>
          </>}
        </form>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return <label className="block text-sm font-bold">{label}<input className="field mt-2" type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} required={required} /></label>;
}

function SelectField({ label, value, options, onChange }) {
  return <label className="block text-sm font-bold">{label}<select className="field mt-2" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option.split(" - ")[0]}>{option}</option>)}</select></label>;
}
