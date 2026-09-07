import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

if (import.meta.env.PROD) {
  document.documentElement.dataset.tracepgBuild = "2026-09-07-account-isolation";
}

class AppErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("TracePG failed to render", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-slate-900 dark:bg-slate-950 dark:text-white">
          <section className="surface-card max-w-md text-center">
            <h1 className="text-xl font-black">TracePG could not load</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Refresh the page to reconnect to your study workspace.
            </p>
            <button className="primary-button mt-5" onClick={() => window.location.reload()}>
              Refresh TracePG
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <AppErrorBoundary>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </AppErrorBoundary>,
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}
