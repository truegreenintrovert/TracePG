import { useEffect, useState } from "react";
import AppShell from "./components/AppShell";
import Analytics from "./pages/Analytics";
import CreateTest from "./pages/CreateTest";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Notes from "./pages/Notes";
import Papers from "./pages/Papers";
import QuestionBank from "./pages/QuestionBank";
import Revision from "./pages/Revision";
import TestRunner from "./pages/TestRunner";
import WrongQuestions from "./pages/WrongQuestions";
import LegalPage, { getLegalPage } from "./pages/LegalPage";
import AdminPanel from "./pages/AdminPanel";
import TestResult from "./pages/TestResult";
import TestReview from "./pages/TestReview";
import SupportPage from "./pages/SupportPage";
import PremiumAccessScreen from "./components/PremiumAccessScreen";
import {
  getRemoteState,
  loadLocalState,
  mergeState,
  putRemoteState,
  saveLocalState,
} from "./lib/storage";
import { getDueQuestions, getSubjectStats, shuffle } from "./lib/study";
import AuthScreen, { ConfirmEmailScreen, ResetPasswordScreen } from "./components/AuthScreen";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import { getSupportPage } from "./data/supportContent";
import { authHeaders } from "./lib/adminApi";

const VIEW_PATHS = {
  home: "/",
  bank: "/question-bank",
  test: "/create-test",
  wrong: "/wrong-questions",
  history: "/history",
  analytics: "/analytics",
  revision: "/revision",
  papers: "/papers",
  notes: "/notes",
  help: "/help-support",
  qa: "/qa",
  result: "/result",
  review: "/review",
  admin: "/admin",
};

function viewFromPath(pathname) {
  return Object.entries(VIEW_PATHS).find(([, path]) => path === pathname)?.[0] || "home";
}

export default function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [passwordRecovery, setPasswordRecovery] = useState(
    () => window.location.pathname === "/reset-password",
  );
  const [emailConfirmed, setEmailConfirmed] = useState(
    () => window.location.pathname === "/auth/confirmed",
  );
  const [questions, setQuestions] = useState([]);
  const [papers, setPapers] = useState([]);
  const [state, setState] = useState(loadLocalState);
  const [view, setViewState] = useState(() => viewFromPath(window.location.pathname));
  const [theme, setTheme] = useState(
    () => localStorage.getItem("tracepg_theme") || localStorage.getItem("medprep_theme") || "light",
  );
  const [activeTest, setActiveTest] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [syncStatus, setSyncStatus] = useState("Local only");
  const [hydrated, setHydrated] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [dataError, setDataError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStatus, setAdminStatus] = useState("checking");
  const [accessLoading, setAccessLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessInfo, setAccessInfo] = useState({ priceInr: 1000, currency: "INR" });
  const [accessError, setAccessError] = useState("");
  const legalPage = getLegalPage(window.location.pathname);
  const publicSupportPage = getSupportPage(window.location.pathname);

  const setView = (nextView, options = {}) => {
    if (nextView === "menu") {
      setViewState("menu");
      return;
    }
    const nextPath = VIEW_PATHS[nextView] || "/";
    if (window.location.pathname !== nextPath) {
      const method = options.replace ? "replaceState" : "pushState";
      window.history[method]({ view: nextView }, "", nextPath);
    }
    setViewState(nextView);
  };

  useEffect(() => {
    const handlePopState = () => setViewState(viewFromPath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return undefined;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user || null);
        setAuthLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setUser(session?.user || null);
        if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
      }
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user || !supabase) {
      setIsAdmin(false);
      setAdminStatus("ready");
      return undefined;
    }
    let mounted = true;
    setAdminStatus("checking");
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (!token) {
        if (mounted) {
          setIsAdmin(false);
          setAdminStatus("ready");
        }
        return;
      }
      fetch("/api/admin/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => response.ok)
        .then((allowed) => {
          if (mounted) {
            setIsAdmin(allowed);
            setAdminStatus("ready");
          }
        })
        .catch(() => {
          if (mounted) {
            setIsAdmin(false);
            setAdminStatus("ready");
          }
        });
    });
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !supabase) {
      setAccessLoading(false);
      setHasAccess(false);
      setAccessError("");
      return undefined;
    }
    let mounted = true;
    setAccessLoading(true);
    setAccessError("");
    authHeaders()
      .then((headers) => fetch("/api/access", { headers }))
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "Unable to check purchase access.");
        return payload;
      })
      .then((payload) => {
        if (!mounted) return;
        setHasAccess(Boolean(payload.hasAccess));
        setAccessInfo(payload);
        if (payload.isAdmin) setIsAdmin(true);
      })
      .catch((error) => {
        if (mounted) {
          setHasAccess(false);
          setAccessError(error.message || "Unable to check purchase access.");
        }
      })
      .finally(() => {
        if (mounted) setAccessLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user || (!hasAccess && !isAdmin)) {
      setQuestions([]);
      setPapers([]);
      setDataReady(true);
      setDataError("");
      return undefined;
    }
    let mounted = true;
    setDataReady(false);
    Promise.all([
      authHeaders().then((headers) => fetch("/api/questions?type=questions&v=20260907", { headers })).then(readQuestionResponse),
      authHeaders().then((headers) => fetch("/api/questions?type=pyqs&v=20260907", { headers })).then(readQuestionResponse),
    ])
      .then(([questionData, paperData]) => {
        if (!mounted) return;
        setQuestions(questionData.items);
        setPapers(paperData.items);
        setDataReady(true);
        setDataError("");
      })
      .catch((error) => {
        if (mounted) setDataError(error.message || "Unable to load the question bank.");
      });
    return () => {
      mounted = false;
    };
  }, [user, hasAccess, isAdmin]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("tracepg_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!user) {
      setHydrated(false);
      return undefined;
    }
    let mounted = true;
    getRemoteState()
      .then((payload) => {
        if (!mounted) return;
        if (payload.data)
          setState((current) => mergeState(current, payload.data));
        setSyncStatus("Cloud ready");
      })
      .catch(() => {
        if (mounted) setSyncStatus("Local only");
      })
      .finally(() => {
        if (mounted) setHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!hydrated || !user) return undefined;
    saveLocalState(state);
    const timer = setTimeout(() => {
      putRemoteState(state)
        .then(() => setSyncStatus("Synced"))
        .catch(() => setSyncStatus("Saved locally"));
    }, 900);
    return () => clearTimeout(timer);
  }, [state, hydrated, user]);

  if (legalPage) {
    return <LegalPage policy={legalPage} />;
  }

  if (publicSupportPage && !user) {
    return <SupportPage page={publicSupportPage} />;
  }

  if (authLoading) {
    return <LoadingScreen label="Checking your account…" />;
  }

  if (passwordRecovery && supabase) {
    return (
      <ResetPasswordScreen
        onComplete={() => {
          window.history.replaceState({}, document.title, "/");
          setPasswordRecovery(false);
        }}
      />
    );
  }

  if (emailConfirmed && supabase) {
    return (
      <ConfirmEmailScreen
        onContinue={() => {
          window.history.replaceState({}, document.title, "/");
          setEmailConfirmed(false);
        }}
      />
    );
  }

  if (!isSupabaseConfigured || !user) {
    return <AuthScreen onPasswordRecovery={() => setPasswordRecovery(true)} />;
  }

  const updateState = (updater) => setState((current) => updater(current));
  const toggleBookmark = (id) =>
    updateState((current) => ({
      ...current,
      bookmarks: current.bookmarks.includes(id)
        ? current.bookmarks.filter((item) => item !== id)
        : [...current.bookmarks, id],
    }));
  const saveNote = (id, note) =>
    updateState((current) => ({
      ...current,
      notes: { ...current.notes, [id]: note },
    }));
  const startTest = (questions, title) => {
    setActiveTest({ questions, title });
    setView("test");
  };
  const startAdaptive = () => {
    const weak = getSubjectStats(questions, state)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5)
      .map((item) => item.subject);
    const pool = questions.filter((question) =>
      weak.includes(question.subject),
    );
    if (pool.length)
      startTest(shuffle(pool).slice(0, 30), "Smart Adaptive Test");
  };
  const submitTest = (test) => {
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;
    const details = test.questions.map((question) => {
      const answer = test.answers[question.id];
      const isCorrect = answer !== undefined && answer === question.a;
      if (answer === undefined) unattempted += 1;
      else if (isCorrect) correct += 1;
      else wrong += 1;
      return {
        id: question.id,
        answer,
        correct: isCorrect,
        question: {
          id: question.id,
          subject: question.subject,
          chapter: question.chapter,
          difficulty: question.difficulty,
          q: question.q,
          o: question.o,
          a: question.a,
          e: question.e,
        },
      };
    });
    const score = correct * 4 - wrong;
    updateState((current) => {
      const attempts = { ...current.attempts };
      const revision = { ...current.revision };
      const wrongIds = [...current.wrong];
      test.questions.forEach((question) => {
        const answer = test.answers[question.id];
        if (answer !== undefined) {
          attempts[question.id] = {
            n: (attempts[question.id]?.n || 0) + 1,
            correct: answer === question.a,
          };
          revision[question.id] =
            Date.now() + (answer === question.a ? 3 : 1) * 86400000;
          if (answer !== question.a && !wrongIds.includes(question.id))
            wrongIds.push(question.id);
        }
      });
      return {
        ...current,
        attempts,
        revision,
        wrong: wrongIds,
        history: [
          {
            date: new Date().toISOString(),
            title: test.title,
            total: test.questions.length,
            correct,
            wrong,
            unattempted,
            score,
            secondsSpent: test.secondsSpent || 0,
            details,
          },
          ...current.history,
        ],
      };
    });
    const result = {
      date: new Date().toISOString(),
      title: test.title,
      total: test.questions.length,
      correct,
      wrong,
      unattempted,
      score,
      secondsSpent: test.secondsSpent || 0,
      details,
    };
    setLastResult(result);
    setActiveTest(null);
    setView("result");
  };

  const content = (() => {
    if (dataError)
      return (
        <div className="grid min-h-[60vh] place-items-center px-6">
          <div className="max-w-md text-center">
            <div className="text-4xl">⚠️</div>
            <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
              Question bank unavailable
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {dataError}
            </p>
            <button
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      );
    if (!hydrated || !dataReady)
      return (
        <div className="grid min-h-[60vh] place-items-center">
          <div className="text-center">
            <div className="text-4xl">🩺</div>
            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading your study workspace…
            </p>
          </div>
        </div>
      );
    if (activeTest)
      return <TestRunner test={activeTest} onSubmit={submitTest} />;
    if (view === "result" && lastResult)
      return <TestResult result={lastResult} onReview={(result) => { setLastResult(result); setView("review"); }} onNavigate={setView} />;
    if (view === "review" && lastResult)
      return <TestReview result={lastResult} state={state} onSaveNote={saveNote} onBack={() => setView("result", { replace: true })} />;
    if (view === "admin" && adminStatus === "checking")
      return <div className="grid min-h-[60vh] place-items-center text-sm font-semibold text-slate-500">Checking administrator access…</div>;
    if (view === "admin" && !isAdmin)
      return <div className="surface-card mx-auto mt-10 max-w-lg text-center"><div className="text-4xl">🔒</div><h2 className="mt-3 text-xl font-black">Admin access required</h2><p className="mt-2 text-sm text-slate-500">Your account is not configured as a TracePG administrator.</p><p className="mt-3 break-all text-xs font-semibold text-slate-400">Signed in as: {user?.email || "unknown email"}</p><button className="primary-button mt-5" onClick={() => setView("home")}>Back to dashboard</button></div>;
    if (view === "admin") return <AdminPanel onBack={() => setView("home")} />;
    if (view === "help") return <SupportPage page={getSupportPage("/help-support")} onNavigate={setView} />;
    if (view === "qa") return <SupportPage page={getSupportPage("/qa")} onNavigate={setView} />;
    if (accessLoading)
      return <div className="grid min-h-[60vh] place-items-center text-sm font-semibold text-slate-500">Checking TracePG access…</div>;
    if (!hasAccess && !isAdmin)
      return <PremiumAccessScreen user={user} priceInr={accessInfo.priceInr || 1000} trialRemaining={accessInfo.trialRemaining || 0} error={accessError} onTrialStarted={(trial) => { setAccessInfo((current) => ({ ...current, trialRemaining: trial.remaining, trialUsed: trial.trialNumber })); setActiveTest({ questions: trial.items, title: `Free Trial Test ${trial.trialNumber}` }); setView("test"); }} onUnlocked={() => { setHasAccess(true); setAccessError(""); setView("home", { replace: true }); }} />;
    const props = {
      questions,
      state,
      onNavigate: setView,
      onBookmark: toggleBookmark,
      onStart: startTest,
    };
    if (view === "bank") return <QuestionBank {...props} />;
    if (view === "test") return <CreateTest {...props} />;
    if (view === "wrong") return <WrongQuestions {...props} />;
    if (view === "history") return <History history={state.history} onReview={(result) => { setLastResult(result); setView("review"); }} />;
    if (view === "analytics")
      return <Analytics questions={questions} state={state} />;
    if (view === "revision") return <Revision {...props} onStart={startTest} />;
    if (view === "papers")
      return <Papers papers={papers} onStart={startTest} />;
    if (view === "notes")
      return <Notes questions={questions} state={state} onSave={saveNote} />;
    return (
      <Dashboard
        questions={questions}
        state={state}
        onNavigate={setView}
        onStartAdaptive={startAdaptive}
      />
    );
  })();

  return (
    <AppShell
      view={view}
      setView={setView}
      theme={theme}
      setTheme={setTheme}
      syncStatus={syncStatus}
      user={user}
      isAdmin={isAdmin}
      onSignOut={() => supabase.auth.signOut()}
    >
      {content}
    </AppShell>
  );
}

function LoadingScreen({ label }) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="text-4xl">🩺</div>
        <p className="mt-3 text-sm font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

async function readQuestionResponse(response) {
  if (!response.ok)
    throw new Error(`Question bank request failed: ${response.status}`);
  return response.json();
}
