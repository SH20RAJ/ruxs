import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl mb-4">
        📶
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">You&apos;re Currently Offline</h1>
      <p className="text-xs text-slate-400 max-w-sm mb-6">
        RUXS is running in offline mode. Your app shell is cached locally, but live WhatsApp polls and digital Khata settlements require an active connection.
      </p>
      <Link
        href="/"
        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all"
      >
        Retry Connection ↻
      </Link>
    </div>
  );
}
