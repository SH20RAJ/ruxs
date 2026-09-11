import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
        <span className="text-2xl font-black">404</span>
      </div>

      <div className="max-w-md space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          Route Not Found
        </h1>
        <p className="text-sm leading-relaxed text-slate-400">
          The requested operational resource, statement, or household link does not exist or has expired.
        </p>
      </div>

      <Link
        href="/"
        className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 active:scale-95"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
