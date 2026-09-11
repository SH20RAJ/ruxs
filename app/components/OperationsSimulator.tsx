"use client";

import React, { useState } from "react";

type ActionState = "PENDING" | "DELIVER" | "SKIP" | "EXTRA";

export default function OperationsSimulator() {
  const [action, setAction] = useState<ActionState>("PENDING");
  const [kitchenCount, setKitchenCount] = useState(84);
  const [khataBalance, setKhataBalance] = useState(3600); // in Rupees
  const [jarsHeld, setJarsHeld] = useState(2);

  const handleAction = (type: ActionState) => {
    setAction(type);
    if (type === "DELIVER") {
      setKitchenCount(85);
      setKhataBalance(3690);
    } else if (type === "SKIP") {
      setKitchenCount(84);
      setKhataBalance(3600);
    } else if (type === "EXTRA") {
      setKitchenCount(86);
      setKhataBalance(3710);
    }
  };

  const resetSimulator = () => {
    setAction("PENDING");
    setKitchenCount(84);
    setKhataBalance(3600);
    setJarsHeld(2);
  };

  return (
    <div id="simulator" className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Interactive Engine Preview
          </div>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
            The 8:30 AM Coordination Loop
          </h3>
          <p className="text-xs text-slate-400">
            Simulate how a single WhatsApp button tap synchronizes the customer, kitchen, driver, and Khata in real time.
          </p>
        </div>

        <button
          onClick={resetSimulator}
          className="text-xs font-medium text-slate-400 hover:text-emerald-400 transition"
        >
          Reset Simulation ↺
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Mock WhatsApp Interface */}
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0b141a] p-4 sm:p-6 shadow-inner font-sans">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
              RK
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                Sharma Kitchen (via RUXS)
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Official</span>
              </div>
              <div className="text-[11px] text-emerald-400">Cutoff: 10:00 AM Sharp</div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-[#202c33] p-3.5 text-xs text-slate-200 space-y-2 max-w-[90%] shadow">
              <p className="font-medium text-emerald-400">
                Good morning Rahul! Today&apos;s lunch:
              </p>
              <p className="text-slate-300">
                🍱 <strong>Homestyle Thali</strong>: 4 Tawa Phulkas, Dal Tadka, Paneer Bhurji, Jeera Rice.
              </p>
              <p className="text-[11px] text-slate-400 italic">
                Cutoff locks in 45 minutes. Autopilot will deliver if no response.
              </p>
            </div>

            {/* Interactive WhatsApp Quick-Reply Buttons */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Your Action:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAction("DELIVER")}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-xs font-bold transition active:scale-95 ${
                    action === "DELIVER"
                      ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400"
                      : "border border-white/10 bg-[#202c33] text-slate-200 hover:border-emerald-500/40"
                  }`}
                >
                  <span className="text-base mb-1">🍱</span>
                  DELIVER
                  <span className="text-[9px] font-normal opacity-75">+₹90.00</span>
                </button>

                <button
                  onClick={() => handleAction("SKIP")}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-xs font-bold transition active:scale-95 ${
                    action === "SKIP"
                      ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400"
                      : "border border-white/10 bg-[#202c33] text-slate-200 hover:border-amber-500/40"
                  }`}
                >
                  <span className="text-base mb-1">⏸️</span>
                  SKIP TODAY
                  <span className="text-[9px] font-normal opacity-75">₹0 Charge</span>
                </button>

                <button
                  onClick={() => handleAction("EXTRA")}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-xs font-bold transition active:scale-95 ${
                    action === "EXTRA"
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400"
                      : "border border-white/10 bg-[#202c33] text-slate-200 hover:border-indigo-500/40"
                  }`}
                >
                  <span className="text-base mb-1">➕</span>
                  +2 ROTIS
                  <span className="text-[9px] font-normal opacity-75">+₹20.00</span>
                </button>
              </div>
            </div>

            {/* Instant Confirmation Balloon */}
            {action !== "PENDING" && (
              <div className="mt-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 p-3 text-xs text-emerald-300 animate-in fade-in slide-in-from-top-2">
                ✓ Action recorded! {action === "SKIP" ? "Lunch skipped for today. No charge debited." : action === "EXTRA" ? "Extra 2 rotis added to today's prep." : "Lunch confirmed! Driver run sheet updated."}
              </div>
            )}
          </div>
        </div>

        {/* Live Operational State Synchronization */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Kitchen Counter Card */}
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Kitchen Prep Counter
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black tabular-nums text-white">
                  {kitchenCount}
                </span>
                <span className="text-xs text-slate-400">Meals</span>
              </div>
              <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                {action === "DELIVER" ? "Incremented by 1" : action === "SKIP" ? "0 waste: meal decremented" : "Live synchronization"}
              </div>
            </div>

            {/* Digital Khata Card */}
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Customer Khata Balance
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xs text-slate-400">₹</span>
                <span className="text-3xl font-black tabular-nums text-white">
                  {khataBalance}
                </span>
              </div>
              <div className="mt-2 text-[10px] text-slate-400">
                {action === "SKIP" ? "No charge added (₹0)" : action === "EXTRA" ? "+₹110.00 debited" : action === "DELIVER" ? "+₹90.00 debited" : "Unbilled month-to-date"}
              </div>
            </div>
          </div>

          {/* Delivery Run Sheet State Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span>DRIVER RUN SHEET (TOWER A)</span>
              <span className="text-emerald-400 font-mono">12:30 PM Window</span>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-2 border border-white/5">
                <span className="text-slate-300">Flat 1402 — Rahul Sharma</span>
                {action === "SKIP" ? (
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    SKIPPED (DO NOT KNOCK)
                  </span>
                ) : action === "EXTRA" ? (
                  <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                    DELIVER (1 MEAL + 2 ROTIS)
                  </span>
                ) : (
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    DELIVER (1 REGULAR)
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-slate-500">
                <span>Flat 1201 — Priya Verma</span>
                <span className="text-[10px]">Autopilot Confirmed</span>
              </div>
            </div>
          </div>

          {/* Physical Asset Holding */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-white">Physical Asset Balance</div>
              <div className="text-[11px] text-slate-400">20L Water Cans & Tiffins Held</div>
            </div>
            <div className="text-right">
              <div className="text-base font-black text-emerald-400">{jarsHeld} Containers</div>
              <div className="text-[10px] text-slate-400">Deposit: ₹300.00 Held</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
