export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute h-12 w-12 animate-ping rounded-full bg-emerald-500/20" />
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
      <p className="text-sm font-medium tracking-wide text-slate-400 animate-pulse">
        Loading RUXS Autopilot...
      </p>
    </div>
  );
}
