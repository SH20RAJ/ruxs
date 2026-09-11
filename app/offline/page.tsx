import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Offline Mode | RUXS — Everyday Life on Autopilot",
  description:
    "You are currently offline. RUXS Progressive Web App cached shell remains operational for viewing local schedules.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center text-2xl mb-4">
        📶
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">You&apos;re Currently Offline</h1>
      <p className="text-xs text-muted-foreground max-w-sm mb-6">
        RUXS is running in offline mode. Your app shell is cached locally, but live WhatsApp polls and digital Khata settlements require an active connection.
      </p>
      <Link href="/" className={buttonVariants({ className: "font-bold text-xs" })}>
        Retry Connection ↻
      </Link>
    </div>
  );
}
