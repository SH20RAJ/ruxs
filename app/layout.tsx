import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ruxs.in"),
  title: {
    default: "RUXS — Everyday Life, on Autopilot",
    template: "%s | RUXS",
  },
  description:
    "The hyper-local operating system for recurring household services in India. Seamlessly coordinating tiffin, water, milk, newspapers, and laundry with digital Khata and automated cutoffs.",
  keywords: [
    "RUXS",
    "ruxs.in",
    "household operating system",
    "recurring services",
    "tiffin subscription",
    "20L water delivery",
    "digital khata",
    "autopilot fulfillment",
    "hyperlocal operations",
  ],
  authors: [{ name: "RUXS Engineering Core", url: "https://ruxs.in" }],
  creator: "RUXS",
  publisher: "RUXS",
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://ruxs.in",
    title: "RUXS — Everyday Life, on Autopilot",
    description:
      "The hyper-local operating system for recurring household essentials. 1-Tap daily coordination, transparent digital Khata, and zero food waste.",
    siteName: "RUXS",
  },
  twitter: {
    card: "summary_large_image",
    title: "RUXS — Everyday Life, on Autopilot",
    description: "The digital operating layer for hyper-local recurring services.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col bg-[#090d16] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 pb-20 sm:pb-0">
        {/* Global Desktop & Tablet Header */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090d16]/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 shadow-lg shadow-emerald-500/20 transition group-hover:scale-105">
                <span className="text-base font-black tracking-wider text-slate-950">R</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white">RUXS</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Autopilot
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 -mt-0.5">ruxs.in</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
              <Link href="#services" className="transition hover:text-emerald-400">
                Services
              </Link>
              <Link href="#how-it-works" className="transition hover:text-emerald-400">
                How It Works
              </Link>
              <Link href="#khata" className="transition hover:text-emerald-400">
                Digital Khata
              </Link>
              <Link href="#simulator" className="transition hover:text-emerald-400">
                Live Demo
              </Link>
              <Link href="/docs" className="transition hover:text-emerald-400">
                Specs
              </Link>
            </nav>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 sm:inline-flex"
              >
                Customer Portal
              </Link>
              <Link
                href="/vendor"
                className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-95"
              >
                Vendor Hub
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">{children}</main>

        {/* Global Footer */}
        <footer className="border-t border-white/10 bg-[#060910] py-12 text-slate-400 text-xs">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="col-span-2 md:col-span-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-black text-xs">
                    R
                  </div>
                  <span className="font-bold text-white text-sm tracking-wide">RUXS</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-400">
                  The digital operating layer for hyper-local recurring household services. Everyday life on autopilot.
                </p>
                <div className="text-[11px] text-slate-500">
                  Domain: <span className="text-slate-300 font-mono">ruxs.in</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">
                  Initial Services
                </h4>
                <ul className="space-y-2">
                  <li>Tiffin Kitchens</li>
                  <li>20L Water Jars</li>
                  <li>Fresh Milk & Dairy</li>
                  <li>Daily Car Cleaning</li>
                  <li>Morning Newspapers</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">
                  Core Modules
                </h4>
                <ul className="space-y-2">
                  <li>Digital Khata Ledger</li>
                  <li>Asset & Jar Holding</li>
                  <li>Cutoff Locking Engine</li>
                  <li>WhatsApp Cloud API</li>
                  <li>Consolidated Billing</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">
                  Architecture & Docs
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/docs/product/mvp" className="hover:text-emerald-400 transition">
                      MVP Scope
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/architecture/overview" className="hover:text-emerald-400 transition">
                      Edge Topology
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/decisions/ADR-001-initial-architecture" className="hover:text-emerald-400 transition">
                      ADR-001
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/checklists/MASTER" className="hover:text-emerald-400 transition">
                      Roadmap Master
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
              <p className="text-slate-500 text-[11px]">
                © {new Date().getFullYear()} RUXS (`ruxs.in`). All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Deployed on Cloudflare Edge Runtime
              </div>
            </div>
          </div>
        </footer>

        {/* Mobile Bottom Navigation Bar (App Shell) */}
        <nav
          aria-label="Mobile Navigation"
          className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-white/10 bg-[#090d16]/95 px-2 backdrop-blur-lg sm:hidden"
        >
          <Link href="/" className="flex flex-col items-center gap-1 text-slate-200 hover:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link href="#services" className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="text-[10px] font-medium">Services</span>
          </Link>
          <Link href="#simulator" className="flex flex-col items-center gap-1 text-emerald-400">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 -mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold">Autopilot</span>
          </Link>
          <Link href="#khata" className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-medium">Khata</span>
          </Link>
          <Link href="/vendor" className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-medium">Vendor</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}
