import { useEffect, useState } from "react";
import { adminFetch } from "../lib/adminApi";

const emptyCode = {
  code: "",
  discountType: "percent",
  discountValue: "10",
  maxUses: "",
  expiresAt: "",
  active: true,
};

export default function DiscountCodeManager() {
  const [codes, setCodes] = useState([]);
  const [form, setForm] = useState(emptyCode);
  const [editingCode, setEditingCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadCodes = async () => {
    setLoading(true);
    try {
      const payload = await adminFetch("/api/admin/discount-codes");
      setCodes(payload.codes || []);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const updateForm = (changes) => setForm((current) => ({ ...current, ...changes }));

  const resetForm = () => {
    setForm(emptyCode);
    setEditingCode("");
  };

  const editCode = (code) => {
    setEditingCode(code.code);
    updateForm({
      code: code.code,
      discountType: code.discountType,
      discountValue: String(code.discountValue),
      maxUses: code.maxUses === "" ? "" : String(code.maxUses),
      expiresAt: toDateTimeInput(code.expiresAt),
      active: code.active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveCode = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await adminFetch("/api/admin/discount-codes", {
        method: editingCode ? "PUT" : "POST",
        body: JSON.stringify({
          ...form,
          code: editingCode || form.code,
          discountValue: Number(form.discountValue),
          maxUses: form.maxUses === "" ? null : Number(form.maxUses),
          expiresAt: form.expiresAt ? new Date(form.expiresAt).getTime() : null,
        }),
      });
      setMessage(`Discount code ${editingCode ? "updated" : "created"} successfully.`);
      resetForm();
      await loadCodes();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  };

  const removeCode = async (code) => {
    if (!window.confirm(`Delete discount code ${code}?`)) return;
    setBusy(true);
    setError("");
    try {
      await adminFetch(`/api/admin/discount-codes?code=${encodeURIComponent(code)}`, { method: "DELETE" });
      setMessage(`Discount code ${code} deleted.`);
      if (editingCode === code) resetForm();
      await loadCodes();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {(error || message) && <div className={`rounded-2xl p-4 text-sm font-semibold ${error ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"}`}>{error || message}</div>}

      <form className="surface-card space-y-5" onSubmit={saveCode}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">Checkout offers</p>
          <h2 className="mt-1 text-xl font-black">{editingCode ? `Edit ${editingCode}` : "Create discount code"}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Codes are checked again on the server when a learner opens PayU checkout.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Code" value={form.code} disabled={Boolean(editingCode)} onChange={(value) => updateForm({ code: value.toUpperCase() })} required />
          <label className="block text-sm font-bold">Discount type<select className="field mt-2" value={form.discountType} onChange={(event) => updateForm({ discountType: event.target.value })}><option value="percent">Percentage</option><option value="fixed">Fixed amount (₹)</option></select></label>
          <Field label={form.discountType === "percent" ? "Percentage" : "Amount (₹)"} type="number" min="1" max={form.discountType === "percent" ? "99" : undefined} step="0.01" value={form.discountValue} onChange={(value) => updateForm({ discountValue: value })} required />
          <Field label="Maximum uses (optional)" type="number" min="1" step="1" value={form.maxUses} onChange={(value) => updateForm({ maxUses: value })} />
          <Field label="Expiry (optional)" type="datetime-local" value={form.expiresAt} onChange={(value) => updateForm({ expiresAt: value })} />
          <label className="flex items-center gap-3 self-end rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold dark:border-slate-700"><input type="checkbox" checked={form.active} onChange={(event) => updateForm({ active: event.target.checked })} /> Active at checkout</label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="primary-button" disabled={busy}>{busy ? "Saving…" : editingCode ? "Update code" : "Create code"}</button>
          {editingCode && <button type="button" className="secondary-button" onClick={resetForm}>Cancel edit</button>}
        </div>
      </form>

      <section className="surface-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-black">Discount codes</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage active offers and usage limits.</p></div>
          <span className="tag">{codes.length} code{codes.length === 1 ? "" : "s"}</span>
        </div>
        {loading ? <p className="mt-5 text-sm font-semibold text-slate-500">Loading discount codes…</p> : codes.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-slate-950 dark:text-slate-400">No discount codes created yet.</p> : (
          <div className="mt-5 space-y-3">
            {codes.map((code) => (
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700" key={code.code}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-black tracking-wide text-slate-950 dark:text-white">{code.code}</p><span className={`tag ${code.active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>{code.active ? "Active" : "Paused"}</span></div>
                  <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{code.discountType === "percent" ? `${code.discountValue}% off` : `₹${code.discountValue.toLocaleString("en-IN")} off`} · {code.usedCount}{code.maxUses === "" ? "" : `/${code.maxUses}`} uses</p>
                  {code.expiresAt && <p className="mt-1 text-xs font-semibold text-slate-400">Expires {new Date(code.expiresAt).toLocaleString("en-IN")}</p>}
                </div>
                <div className="flex shrink-0 gap-2"><button className="secondary-button" onClick={() => editCode(code)}>Edit</button><button className="secondary-button text-rose-600 hover:border-rose-300 hover:text-rose-700" onClick={() => removeCode(code.code)} disabled={busy}>Delete</button></div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", min, max, step, disabled = false, required = false }) {
  return <label className="block text-sm font-bold">{label}<input className="field mt-2" type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} min={min} max={max} step={step} disabled={disabled} required={required} /></label>;
}

function toDateTimeInput(value) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
