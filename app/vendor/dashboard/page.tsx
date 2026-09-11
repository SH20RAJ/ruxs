"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { KitchenPrepBatch } from "@/src/modules/cutoff/cutoff-engine";

export default function VendorDashboardPage() {
  const [tenantId] = useState("ten_sharma_tiffin");
  const [batch, setBatch] = useState<KitchenPrepBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchBatchCounter = async () => {
    try {
      const res = await fetch(`/api/vendor/kitchen-counter?tenantId=${tenantId}&date=${todayStr}&shift=LUNCH`);
      const data = (await res.json()) as { success: boolean; data?: KitchenPrepBatch };
      if (data.success && data.data) {
        setBatch(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchCounter();
    const interval = setInterval(fetchBatchCounter, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, [tenantId]);

  const handleLockCutoff = async () => {
    setLocking(true);
    try {
      await fetch("/api/cutoff/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, serviceDate: todayStr }),
      });
      await fetchBatchCounter();
    } catch (err) {
      console.error(err);
    } finally {
      setLocking(false);
    }
  };

  const mockCustomers = [
    {
      id: "usr_priya",
      name: "Priya Sundaram",
      phone: "+91 98765 43210",
      plan: "Executive Veg Lunch",
      flat: "Sobha Classic, B-402",
      balance: 120,
      status: "CONFIRMED",
    },
    {
      id: "usr_rahul",
      name: "Rahul Verma",
      phone: "+91 98765 43211",
      plan: "Executive Veg Lunch (x2)",
      flat: "Purva Fairmont, A-101",
      balance: 240,
      status: "IN_PREPARATION",
    },
    {
      id: "usr_siddharth",
      name: "Siddharth Joshi",
      phone: "+91 98765 43212",
      plan: "Executive Veg Lunch",
      flat: "Sobha Classic, C-903",
      balance: 0,
      status: "SKIPPED",
    },
  ];

  const filteredCustomers = mockCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.flat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen py-6 px-4 max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-md">
              Live Operations
            </span>
            <span className="text-xs text-slate-400 font-mono">Today: {todayStr} (Lunch Shift)</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Kitchen Prep & Delivery Counter</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/vendor/services"
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition-all"
          >
            ⚙️ Services & Pricing
          </Link>
          <Link
            href="/vendor/onboard"
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition-all"
          >
            🔗 Invite Link / QR
          </Link>
          <button
            onClick={handleLockCutoff}
            disabled={locking}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10"
          >
            {locking ? "Locking..." : "🔒 Lock Cutoff Now"}
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-4 backdrop-blur-md">
          <span className="text-[11px] font-semibold text-slate-400">Total Cooking Demand</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-white font-mono">
              {(batch?.totalConfirmed || 0) + (batch?.totalInPrep || 0) || 105}
            </span>
            <span className="text-xs text-emerald-400 font-medium">meals to pack</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Zero excess cooking waste</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <span className="text-[11px] font-semibold text-slate-400">Cutoff Window</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-amber-400 font-mono">10:00 AM</span>
            <span className="text-[10px] text-slate-400">IST</span>
          </div>
          <p className="text-[10px] text-emerald-400 mt-1">● WhatsApp 8:30 AM poll completed</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <span className="text-[11px] font-semibold text-slate-400">Today Skipped</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-slate-400 font-mono">
              {batch?.totalSkipped || 14}
            </span>
            <span className="text-xs text-slate-500">subscribers</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Excluded before groceries opened</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <span className="text-[11px] font-semibold text-slate-400">Today&apos;s Revenue</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-emerald-400 font-mono">₹12,600</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Auto-credited into Khata</p>
        </div>
      </div>

      {/* SKU Breakdown & Live Kitchen Counter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
            🥘 Kitchen Production List
          </h2>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
              <div>
                <p className="text-xs font-bold text-white">Standard Veg Thali</p>
                <span className="text-[10px] text-slate-400">4 Roti, Dal, Sabzi, Rice</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-400 font-mono">85</span>
                <span className="text-[10px] text-slate-500 block">packs</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
              <div>
                <p className="text-xs font-bold text-white">No-Onion / Jain Thali</p>
                <span className="text-[10px] text-slate-400">Special prep tray</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-amber-400 font-mono">20</span>
                <span className="text-[10px] text-slate-500 block">packs</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
            <span>Dabba Return Check:</span>
            <span className="text-white font-medium">92 empty collected today</span>
          </div>
        </div>

        {/* Customer Roster & Quick Actions */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
              📋 Subscriber Run Sheet & Khata
            </h2>
            <input
              type="text"
              placeholder="Search by name or apartment flat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            {filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{cust.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{cust.flat}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{cust.plan}</p>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ₹{cust.balance}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Khata balance</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      cust.status === "CONFIRMED"
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                        : cust.status === "IN_PREPARATION"
                        ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                        : "bg-slate-900 text-slate-500 border border-slate-800"
                    }`}
                  >
                    {cust.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
