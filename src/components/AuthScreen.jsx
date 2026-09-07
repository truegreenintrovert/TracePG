import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { appUrl, isSupabaseConfigured, supabase } from "../lib/supabase";
import SiteFooter from "./SiteFooter";
import SEO from "./SEO";
import BrandLogo from "./BrandLogo";

export default function AuthScreen({ onPasswordRecovery, onBack }) {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [resetStep, setResetStep] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");

    try {
      if (mode === "forgot") {
        if (!resetStep) {
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
          if (resetError) throw resetError;
          setResetStep(true);
          setMessage("If an account exists for this email, a six-digit reset code has been sent.");
          return;
        }

        const { data: recoveryData, error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: "recovery",
        });
        if (verifyError) throw verifyError;
        if (!recoveryData.session) throw new Error("The reset code could not create a recovery session.");
        window.history.replaceState({}, document.title, "/reset-password");
        onPasswordRecovery?.();
        return;
      }

      if (mode === "otp") {
        if (!otpStep) {
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false },
          });
          if (otpError) throw otpError;
          setOtpStep(true);
          setMessage("A six-digit code has been sent to your email.");
          return;
        }

        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: "email",
        });
        if (verifyError) throw verifyError;
        return;
      }

      const result = mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: name.trim() },
              emailRedirectTo: `${appUrl}/auth/confirmed`,
            },
          });

      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) {
        setMessage("Account created. Check your email to confirm your account, then sign in.");
      }
    } catch (authError) {
      setError(authError.message || "Unable to authenticate. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    setBusy(true);
    setMessage("");
    setError("");
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: appUrl },
    });
    if (authError) {
      setError(authError.message || "Google sign-in is unavailable.");
      setBusy(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <AuthLayout>
        <SEO title="Sign in | TracePG" description="Sign in to your TracePG NEET-PG preparation workspace." noindex path="/sign-in" />
        <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
          Connect TracePG login
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Add the two Supabase values from your local environment file, then restart the development server.
        </p>
        <div className="mt-6 rounded-2xl bg-slate-950 p-4 font-mono text-xs leading-6 text-blue-100">
          VITE_SUPABASE_URL<br />
          VITE_SUPABASE_PUBLISHABLE_KEY
        </div>
      </AuthLayout>
    );
  }

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setOtpStep(false);
    setResetStep(false);
    setOtp("");
    setError("");
    setMessage("");
  };

  const isEmailCode = mode === "otp";

  return (
    <AuthLayout>
      <SEO title={`${mode === "signup" ? "Create account" : mode === "forgot" ? "Reset password" : "Sign in"} | TracePG`} description="Sign in to TracePG to save your NEET-PG practice, revision, and progress." noindex path="/sign-in" />
      <div className="mb-7">
        <BrandLogo className="mb-2" iconClassName="h-10 w-10" wordmarkClassName="h-6 w-auto max-w-[165px]" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
          {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : mode === "forgot" ? (resetStep ? "Enter reset code" : "Reset your password") : "Sign in with email code"}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {mode === "forgot"
            ? resetStep ? "Enter the six-digit code from your email to continue." : "Enter your email and we’ll send you a secure reset code."
            : isEmailCode
              ? "We’ll send a one-time code to your email."
            : "Save your progress across devices and continue your preparation anywhere."}
        </p>
      </div>

      {mode !== "forgot" && !isEmailCode && (
        <>
          <button className="secondary-button flex w-full items-center justify-center gap-2" onClick={signInWithGoogle} disabled={busy}>
            <FcGoogle className="text-lg" aria-hidden="true" />
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            or use email
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>
        </>
      )}

      <form className="space-y-4" onSubmit={submit}>
        {mode === "signup" && (
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
            Full name
            <input className="field mt-2" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
        )}
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
          Email
          <input className="field mt-2" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} readOnly={mode === "forgot" && resetStep} required />
        </label>
        {mode !== "forgot" && !isEmailCode && (
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
            Password
            <input className="field mt-2" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
          </label>
        )}
        {isEmailCode && otpStep && (
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
            Verification code
            <input className="field mt-2 text-center text-xl tracking-[.35em]" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} required />
          </label>
        )}
        {mode === "forgot" && resetStep && (
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
            Reset code
            <input className="field mt-2 text-center text-xl tracking-[.35em]" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} required />
          </label>
        )}

        {error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
        {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</p>}

        <button className="primary-button w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : mode === "forgot" ? (resetStep ? "Verify reset code" : "Send reset code") : otpStep ? "Verify code" : "Send email code"}
        </button>
      </form>

      {mode === "signin" && (
        <button className="mt-4 w-full text-sm font-bold text-slate-500 hover:text-brand-600 dark:text-slate-400" onClick={() => switchMode("forgot")}>
          Forgot password?
        </button>
      )}
      {mode === "signin" && (
        <button className="mt-3 w-full text-sm font-bold text-brand-600 hover:text-brand-700" onClick={() => switchMode("otp")}>
          Sign in with email code
        </button>
      )}
      <button className="mt-5 w-full text-sm font-bold text-brand-600 hover:text-brand-700" onClick={() => switchMode(mode === "signup" ? "signin" : "signup")}>
        {mode === "signup" ? "Already have an account? Sign in" : "New to TracePG? Create an account"}
      </button>
      {mode === "forgot" && (
        <button className="mt-3 w-full text-sm font-bold text-brand-600 hover:text-brand-700" onClick={() => switchMode("signin")}>
          Back to sign in
        </button>
      )}
      {mode === "otp" && (
        <button className="mt-3 w-full text-sm font-bold text-brand-600 hover:text-brand-700" onClick={() => switchMode("signin")}>
          Back to password sign in
        </button>
      )}
      {onBack && (
        <button className="mt-4 w-full text-sm font-bold text-slate-500 hover:text-brand-600 dark:text-slate-400" onClick={onBack}>
          Back to TracePG home
        </button>
      )}
    </AuthLayout>
  );
}

export function ResetPasswordScreen({ onComplete }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 6) {
      setError("Your password must contain at least 6 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message || "Unable to update your password.");
    } else {
      setMessage("Password updated. Opening your TracePG workspace…");
      setTimeout(onComplete, 900);
    }
    setBusy(false);
  };

  return (
    <AuthLayout>
      <BrandLogo iconClassName="h-10 w-10" wordmarkClassName="h-6 w-auto max-w-[165px]" />
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Choose a new password</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Use at least 6 characters for your new password.</p>
      <form className="mt-7 space-y-4" onSubmit={submit}>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
          New password
          <input className="field mt-2" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
        </label>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
          Confirm new password
          <input className="field mt-2" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={6} required />
        </label>
        {error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
        {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</p>}
        <button className="primary-button w-full" disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
      </form>
    </AuthLayout>
  );
}

export function ConfirmEmailScreen({ onContinue }) {
  return (
    <AuthLayout>
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-3xl text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300"><FiCheckCircle aria-hidden="true" /></div>
      <h1 className="mt-6 text-center text-3xl font-black tracking-tight text-slate-950 dark:text-white">Email confirmed</h1>
      <p className="mt-3 text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
        Your TracePG account is ready. Continue to your preparation workspace and start where you left off.
      </p>
      <button className="primary-button mt-7 w-full" onClick={onContinue}>Continue to TracePG</button>
    </AuthLayout>
  );
}

function AuthLayout({ children }) {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="grid flex-1 place-items-center">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          {children}
        </section>
      </div>
      <div className="mx-auto mt-8 w-full max-w-md">
        <SiteFooter />
      </div>
    </main>
  );
}
