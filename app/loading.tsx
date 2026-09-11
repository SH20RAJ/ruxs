export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-xs font-mono text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <span>Loading...</span>
      </div>
    </div>
  );
}
