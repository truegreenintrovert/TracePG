import { useEffect, useState } from "react";
import { SUPPORT_CONTENT } from "../data/supportContent";
import { adminFetch } from "../lib/adminApi";

const blankSection = ["New section", "Add the guidance text here."];
const blankFaq = { category: "General", question: "", answer: "" };
const pageOptions = [
  ["product", "Product"],
  ["about", "About Us"],
  ["contact", "Contact Us"],
  ["help", "Help & Support"],
  ["qa", "Q&A"],
];

export default function SupportContentEditor({ pages, onSaved }) {
  const [slug, setSlug] = useState("help");
  const [draft, setDraft] = useState(clonePage(SUPPORT_CONTENT.help));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const serverPage = pages.find((page) => page.slug === slug);
    setDraft(clonePage(serverPage || SUPPORT_CONTENT[slug]));
  }, [pages, slug]);

  const update = (changes) => setDraft((current) => ({ ...current, ...changes }));
  const updateSection = (index, value, part) => update({ sections: draft.sections.map((section, sectionIndex) => sectionIndex === index ? section.map((item, itemIndex) => itemIndex === part ? value : item) : section) });
  const updateFaq = (index, changes) => update({ faqs: draft.faqs.map((faq, faqIndex) => faqIndex === index ? { ...faq, ...changes } : faq) });

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await adminFetch("/api/admin/support-content", { method: "PUT", body: JSON.stringify(draft) });
      setMessage(`${draft.label} updated successfully.`);
      await onSaved();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="surface-card space-y-6" onSubmit={save}>
      <div className="flex flex-wrap gap-2">
        {pageOptions.map(([pageSlug, pageLabel]) => (
          <button type="button" key={pageSlug} className={`rounded-xl px-4 py-2 text-sm font-bold ${slug === pageSlug ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`} onClick={() => setSlug(pageSlug)}>
            {pageLabel}
          </button>
        ))}
      </div>

      {(error || message) && <div className={`rounded-2xl p-4 text-sm font-semibold ${error ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"}`}>{error || message}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Page label" value={draft.label} onChange={(value) => update({ label: value })} required />
        <Field label="Page title" value={draft.title} onChange={(value) => update({ title: value })} required />
      </div>
      <label className="block text-sm font-bold">Introduction<textarea className="field mt-2 min-h-24" value={draft.intro} onChange={(event) => update({ intro: event.target.value })} required /></label>

      <div>
        <h3 className="text-lg font-black">Contact and call-to-action details</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">These fields are optional and appear as contact cards and the main page button.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Support email" type="email" value={draft.contactEmail} onChange={(value) => update({ contactEmail: value })} />
          <Field label="Support phone" value={draft.contactPhone} onChange={(value) => update({ contactPhone: value })} />
          <Field label="Support hours" value={draft.supportHours} onChange={(value) => update({ supportHours: value })} />
          <Field label="Button label" value={draft.supportCtaLabel} onChange={(value) => update({ supportCtaLabel: value })} />
          <div className="sm:col-span-2"><Field label="Button link (URL or mailto:)" value={draft.supportCtaUrl} onChange={(value) => update({ supportCtaUrl: value })} /></div>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="text-lg font-black">Page sections</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add the sections shown on this public page.</p></div>
          <button type="button" className="secondary-button" onClick={() => update({ sections: [...draft.sections, [...blankSection]] })}>+ Add section</button>
        </div>
        <div className="mt-4 space-y-4">
          {draft.sections.map(([heading, body], index) => (
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700" key={index}>
              <div className="flex items-start gap-3"><div className="min-w-0 flex-1 space-y-3"><Field label={`Section ${index + 1} heading`} value={heading} onChange={(value) => updateSection(index, value, 0)} required /><label className="block text-sm font-bold">Section body<textarea className="field mt-2 min-h-24" value={body} onChange={(event) => updateSection(index, event.target.value, 1)} required /></label></div><button type="button" className="text-sm font-bold text-rose-600" onClick={() => update({ sections: draft.sections.filter((_, sectionIndex) => sectionIndex !== index) })}>Remove</button></div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="text-lg font-black">Questions and answers</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Each entry becomes an expandable question on the Q&A page.</p></div>
          <button type="button" className="secondary-button" onClick={() => update({ faqs: [...draft.faqs, { ...blankFaq }] })}>+ Add Q&A</button>
        </div>
        <div className="mt-4 space-y-4">
          {draft.faqs.map((faq, index) => (
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700" key={index}>
              <div className="flex items-start gap-3"><div className="min-w-0 flex-1 space-y-3"><div className="grid gap-3 sm:grid-cols-2"><Field label="Category" value={faq.category} onChange={(value) => updateFaq(index, { category: value })} /><Field label="Question" value={faq.question} onChange={(value) => updateFaq(index, { question: value })} required /></div><label className="block text-sm font-bold">Answer<textarea className="field mt-2 min-h-24" value={faq.answer} onChange={(event) => updateFaq(index, { answer: event.target.value })} required /></label></div><button type="button" className="text-sm font-bold text-rose-600" onClick={() => update({ faqs: draft.faqs.filter((_, faqIndex) => faqIndex !== index) })}>Remove</button></div>
            </div>
          ))}
        </div>
      </div>

      <button className="primary-button" disabled={busy}>{busy ? "Saving…" : `Save ${draft.label}`}</button>
    </form>
  );
}

function clonePage(page) {
  return JSON.parse(JSON.stringify(page));
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return <label className="block text-sm font-bold">{label}<input className="field mt-2" type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} required={required} /></label>;
}
