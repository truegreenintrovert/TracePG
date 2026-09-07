import { useState } from "react";
import { FiX } from "react-icons/fi";
import { appUrl, supabase } from "../lib/supabase";

export default function ProfilePanel({ user, onClose, onSignOut }) {
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || user?.user_metadata?.name || "TracePG learner");
  const [nameDraft, setNameDraft] = useState(displayName);
  const [editingName, setEditingName] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [resetVerified, setResetVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const emailVerified = Boolean(user?.email_confirmed_at);
  const providers = (user?.identities || []).map((identity) => identity.provider).join(", ") || "Email";
  const initials = displayName.slice(0, 1).toUpperCase();

  const run = async (action) => {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await action();
    } catch (actionError) {
      setError(actionError.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const sendVerificationCode = () => run(async () => {
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: { emailRedirectTo: `${appUrl}/auth/confirmed` },
    });
    if (resendError) throw resendError;
    setVerificationSent(true);
    setMessage("A verification code has been sent to your email.");
  });

  const saveName = () => run(async () => {
    const nextName = nameDraft.trim();
    if (nextName.length < 2) throw new Error("Please enter at least 2 characters for your name.");
    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: nextName },
    });
    if (updateError) throw updateError;
    setDisplayName(nextName);
    setNameDraft(nextName);
    setEditingName(false);
    setMessage("Your name has been updated.");
  });

  const verifyEmail = () => run(async () => {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: user.email,
      token: verificationCode,
      type: "signup",
    });
    if (verifyError) throw verifyError;
    setVerificationSent(false);
    setVerificationCode("");
    setMessage("Your email is verified.");
  });

  const sendResetCode = () => run(async () => {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email);
    if (resetError) throw resetError;
    setResetSent(true);
    setMessage("A password reset code has been sent to your email.");
  });

  const verifyResetCode = () => run(async () => {
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: user.email,
      token: resetCode,
      type: "recovery",
    });
    if (verifyError) throw verifyError;
    if (!data.session) throw new Error("The reset code could not create a recovery session.");
    setResetVerified(true);
    setMessage("Code verified. Choose your new password.");
  });

  const updatePassword = () => run(async () => {
    if (password.length < 6) throw new Error("Your password must contain at least 6 characters.");
    if (password !== passwordConfirmation) throw new Error("The passwords do not match.");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) throw updateError;
    setResetSent(false);
    setResetVerified(false);
    setResetCode("");
    setPassword("");
    setPasswordConfirmation("");
    setMessage("Your password has been updated.");
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 p-3 sm:p-5" role="dialog" aria-modal="true" aria-label="Profile">
      <button className="absolute inset-0 h-full w-full cursor-default" aria-label="Close profile" onClick={onClose} />
      <aside className="relative ml-auto h-full w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">Account</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Your profile</h1>
          </div>
          <button className="icon-button" aria-label="Close profile" onClick={onClose}><FiX size={19} /></button>
        </div>

        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-600 text-xl font-black text-white">{initials}</div>
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-950 dark:text-white">{displayName}</p>
            <p className="truncate font-bold text-slate-950 dark:text-white">{user?.email}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Signed in with {providers}</p>
          </div>
        </div>

        <section className="surface-card mt-5">
          <h2 className="font-black text-slate-950 dark:text-white">Profile information</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950 sm:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Name</p>
                {!editingName && <button className="text-xs font-bold text-brand-600 hover:text-brand-700" onClick={() => setEditingName(true)}>Edit</button>}
              </div>
              {editingName ? (
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input className="field" type="text" autoComplete="name" value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} />
                  <div className="flex gap-2">
                    <button className="primary-button flex-1 sm:flex-none" onClick={saveName} disabled={busy}>Save</button>
                    <button className="secondary-button flex-1 sm:flex-none" onClick={() => { setNameDraft(displayName); setEditingName(false); }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 truncate font-semibold text-slate-700 dark:text-slate-200" title={displayName}>{displayName}</p>
              )}
            </div>
            <InfoItem label="Email" value={user?.email || "—"} />
            <InfoItem label="Account ID" value={`${user?.id?.slice(0, 8) || "—"}…`} />
            <InfoItem label="Sign-in method" value={providers} />
            <InfoItem label="Email status" value={emailVerified ? "Verified" : "Not verified"} />
          </div>
        </section>

        <section className="surface-card mt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-black text-slate-950 dark:text-white">Email verification</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Verify your email with a one-time code.</p>
            </div>
            <span className={`tag ${emailVerified ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200" : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200"}`}>
              {emailVerified ? "Verified" : "Pending"}
            </span>
          </div>
          {!emailVerified && !verificationSent && (
            <button className="primary-button mt-4" onClick={sendVerificationCode} disabled={busy}>Send verification code</button>
          )}
          {!emailVerified && verificationSent && (
            <div className="mt-4 space-y-3">
              <input className="field text-center text-xl tracking-[.35em]" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="000000" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))} />
              <button className="primary-button w-full" onClick={verifyEmail} disabled={busy}>Verify email</button>
            </div>
          )}
        </section>

        <section className="surface-card mt-5">
          <h2 className="font-black text-slate-950 dark:text-white">Password</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Change your password using a secure email code.</p>
          {!resetSent && <button className="secondary-button mt-4" onClick={sendResetCode} disabled={busy}>Send password reset code</button>}
          {resetSent && !resetVerified && (
            <div className="mt-4 space-y-3">
              <input className="field text-center text-xl tracking-[.35em]" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="000000" value={resetCode} onChange={(event) => setResetCode(event.target.value.replace(/\D/g, ""))} />
              <button className="primary-button w-full" onClick={verifyResetCode} disabled={busy}>Verify reset code</button>
            </div>
          )}
          {resetVerified && (
            <div className="mt-4 space-y-3">
              <input className="field" type="password" autoComplete="new-password" placeholder="New password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <input className="field" type="password" autoComplete="new-password" placeholder="Confirm new password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} />
              <button className="primary-button w-full" onClick={updatePassword} disabled={busy}>Update password</button>
            </div>
          )}
        </section>

        {error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
        {message && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</p>}

        <button className="danger-button mt-6 w-full" onClick={onSignOut}>Sign out</button>
      </aside>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 truncate font-semibold text-slate-700 dark:text-slate-200" title={value}>{value}</p>
    </div>
  );
}
