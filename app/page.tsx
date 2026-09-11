import Link from "next/link";
import OperationsSimulator from "./components/OperationsSimulator";

export const revalidate = 300;

export default function Home() {
  return (
    <div className="space-y-24 py-10 sm:py-16">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          The Operating System for Everyday Household Life
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl text-white">
            Your everyday life,{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              on autopilot.
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300">
            India already has hyper-local services everywhere—tiffin, water cans, milk, newspapers, laundry. RUXS provides the digital operating layer underneath: 1-tap WhatsApp coordination, strict cutoff locks, and an immutable Digital Khata.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="#simulator"
            className="rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/25 transition hover:bg-emerald-400 hover:scale-105 active:scale-95"
          >
            Launch Live Demo 🚀
          </a>
          <Link
            href="/vendor"
            className="rounded-2xl border border-white/15 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 hover:border-white/25 active:scale-95"
          >
            Vendor Command Center →
          </Link>
          <Link
            href="/docs"
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 active:scale-95"
          >
            Engineering Specs 📖
          </Link>
        </div>

        {/* Operational Highlights Ticker */}
        <div className="mx-auto max-w-5xl pt-8">
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-6 md:grid-cols-4">
            <div className="space-y-1">
              <div className="text-2xl font-black text-white">1-Tap</div>
              <div className="text-xs text-slate-400">WhatsApp Morning Polls</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-emerald-400">10:00 AM</div>
              <div className="text-xs text-slate-400">Strict Cutoff Locking</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-white">100%</div>
              <div className="text-xs text-slate-400">Auditable Digital Khata</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-indigo-400">Zero</div>
              <div className="text-xs text-slate-400">Lost Water Cans or Dabbas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Simulator Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <OperationsSimulator />
      </section>

      {/* 9 Service Categories Grid */}
      <section id="services" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Modular Service Architecture
          </h2>
          <h3 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Initial Service Categories
          </h3>
          <p className="mx-auto max-w-xl text-sm text-slate-400">
            One common operating layer powers every recurring domestic need without messy custom code paths.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Tiffin */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🍱</span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                MVP Beachhead
              </span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Tiffin Services</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Homestyle breakfast, lunch, and dinner meal plans with 10:00 AM cutoffs, Jain options, extra rotis, and stainless steel dabba swaps.
              </p>
            </div>
          </div>

          {/* 2. Water */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl">💧</span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                MVP Beachhead
              </span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">20L RO Water Jars</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Scheduled alternate-day drops and 1-tap SOS reorders with doorstep container exchange, holding balance tracking, and security deposit accounting.
              </p>
            </div>
          </div>

          {/* 3. Milk */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🥛</span>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                Phase 2
              </span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Fresh Milk & Dairy</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Early morning pouch and bottle deliveries (Cow, Buffalo, A2) supporting decimal quantities (0.5L, 1.0L, 1.5L) and temporary guest add-ons.
              </p>
            </div>
          </div>

          {/* 4. Car Cleaning */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🚗</span>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                Phase 2
              </span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Daily Car & Bike Wash</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Apartment basement daily dusting and exterior cleaning with vacation hold pause and optional timestamped proof of completion.
              </p>
            </div>
          </div>

          {/* 5. Newspapers */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl">📰</span>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                Phase 2
              </span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Newspapers & Periodicals</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Daily dawn publication delivery with automated vacation billing pause that prevents paper bundles piling outside locked flats.
              </p>
            </div>
          </div>

          {/* 6. Pooja Flowers */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🌸</span>
              <span className="rounded-full bg-slate-700/50 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 border border-white/10">
                Phase 3
              </span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Temple Pooja Flowers</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Morning fresh marigold and jasmine garlands delivered in reusable cloth pouches with festival volume adjustments.
              </p>
            </div>
          </div>

          {/* 7. Bakery */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🍞</span>
              <span className="rounded-full bg-slate-700/50 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 border border-white/10">
                Phase 3
              </span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Bakery & Breakfast</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Fresh bread loaves, farm eggs, and pav bundled alongside early morning milk deliveries.
              </p>
            </div>
          </div>

          {/* 8. Laundry */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl">👔</span>
              <span className="rounded-full bg-slate-700/50 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 border border-white/10">
                Phase 4
              </span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Laundry & Dhobi</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Two-way pickup, in-hub piece count verification, iron and return with numbered bag tracking and itemized Khata billing.
              </p>
            </div>
          </div>

          {/* 9. Scrap */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl">📦</span>
              <span className="rounded-full bg-slate-700/50 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 border border-white/10">
                Phase 4
              </span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Dry Waste & Scrap Collection</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Carton and plastic scrap collection that credits the customer&apos;s Khata directly, offsetting their monthly milk and tiffin bills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Seamless Coordination
          </h2>
          <h3 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            The 4-Step Operational Flow
          </h3>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
              1
            </div>
            <h4 className="font-bold text-white">Subscription Default</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Set your cadence once (e.g. 1 meal every weekday, or 1 jar every 3 days). The service runs on autopilot.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
              2
            </div>
            <h4 className="font-bold text-white">1-Tap WhatsApp Poll</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Receive a morning button prompt: [DELIVER], [SKIP], [+EXTRA]. Ignore it and your autopilot default delivers safely.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
              3
            </div>
            <h4 className="font-bold text-white">Strict Cutoff Lock</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              At 10:00 AM, the kitchen counter locks. The chef knows exact prep quantities. Drivers get tower-sequenced run sheets.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
              4
            </div>
            <h4 className="font-bold text-white">Khata & UPI Pay</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Every delivery appends an immutable transaction. On the 1st of the month, receive a transparent statement payable via UPI.
            </p>
          </div>
        </div>
      </section>

      {/* Digital Khata Section */}
      <section id="khata" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/20 p-8 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                Zero-Argument Transparency
              </div>
              <h3 className="text-3xl font-black text-white sm:text-4xl">
                The Digital Khata
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                Traditional paper diaries and door calendars lead to painful end-of-month arguments: <em className="text-slate-400">&quot;Uncle, I skipped milk on Diwali!&quot;</em> vs. <em className="text-slate-400">&quot;Beta, it is not marked in my book.&quot;</em>
              </p>
              <p className="text-sm leading-relaxed text-slate-300">
                RUXS records every single day as an immutable ledger transaction with exact millisecond timestamps and driver proof. At month-end, the invoice is self-evident and crystal clear.
              </p>
              <div className="pt-2">
                <Link
                  href="/docs/features/khata"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  Read the Double-Entry Ledger Specification →
                </Link>
              </div>
            </div>

            {/* Mock Khata Statement */}
            <div className="rounded-2xl border border-white/10 bg-[#090d16] p-5 shadow-2xl font-mono text-xs space-y-3">
              <div className="flex justify-between border-b border-white/10 pb-3 text-slate-400 text-[11px]">
                <span>STATEMENT: OCT 2026</span>
                <span className="text-emerald-400 font-bold">#INV-2026-10-842</span>
              </div>
              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span>01 Oct • Lunch Delivered (1 Meal)</span>
                  <span className="text-white">+₹90.00</span>
                </div>
                <div className="flex justify-between">
                  <span>02 Oct • Lunch Delivered (1 Meal)</span>
                  <span className="text-white">+₹90.00</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>03 Oct • Skipped at 09:14 AM</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>04 Oct • Lunch + 2 Extra Rotis</span>
                  <span className="text-white">+₹110.00</span>
                </div>
                <div className="flex justify-between text-emerald-400 border-t border-white/5 pt-2">
                  <span>05 Oct • UPI Payment (Ref: 62819)</span>
                  <span>-₹290.00</span>
                </div>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 font-bold text-sm">
                <span className="text-white">OUTSTANDING BALANCE</span>
                <span className="text-emerald-400">₹0.00 (Cleared)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Footer Call to Action */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h3 className="text-3xl font-black text-white sm:text-4xl">
          Are you a local kitchen, dairy, or water distributor?
        </h3>
        <p className="mx-auto max-w-xl text-sm text-slate-400">
          Eliminate daily WhatsApp chaos, stop food waste, and automate customer payment collection in 15 minutes.
        </p>
        <div className="pt-2">
          <Link
            href="/vendor"
            className="rounded-2xl bg-emerald-500 px-8 py-4 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/25 transition hover:bg-emerald-400 hover:scale-105 active:scale-95 inline-block"
          >
            Get Started on Free Starter Tier →
          </Link>
        </div>
      </section>
    </div>
  );
}
