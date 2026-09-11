"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client error with correlation
    console.error("RUXS Client Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          Operational Glitch Detected
        </h2>
        <p className="text-sm leading-relaxed text-slate-400">
          Something unexpected happened while syncing your household operations. Your financial ledger and active subscriptions remain completely secure.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 active:scale-95"
        >
          Retry Operation
        </button>
        <a
          href="/"
          className="rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 active:scale-95"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}
