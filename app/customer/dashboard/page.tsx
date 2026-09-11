"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatINR, Paise } from "@/src/shared/types/money";

interface FulfillmentItem {
  id: string;
  subscriptionId: string;
  serviceId: string;
  serviceDate: string;
  quantity: number;
  unitPricePaise: number;
  totalPricePaise: number;
  status: string;
  cutoffTime?: string;
  notes?: string;
}

interface SubscriptionItem {
  id: string;
  serviceId: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  quantity: number;
  unitPricePaise: number;
  cadence: string;
  startDate: string;
}

interface KhataStatement {
  tenantId: string;
  customerId: string;
  runningBalancePaise: number;
  entries: Array<{
    id: string;
    entryType: string;
    direction: "DEBIT" | "CREDIT";
    amountPaise: number;
    runningBalancePaise: number;
    description: string;
    createdAt: string;
  }>;
}

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  billingMonth: string;
  totalAmountPaise: number;
  paidAmountPaise: number;
  status: "DRAFT" | "ISSUED" | "PAID" | "OVERDUE";
  dueDate: string;
}

export default function CustomerDashboardPage() {
  const [customerId] = useState("usr_priya");
  const [tenantId] = useState("ten_sharma_tiffin");
  const [loading, setLoading] = useState(true);

  // State
  const [todayFulfillment, setTodayFulfillment] = useState<FulfillmentItem | null>({
    id: "ful_today_1",
    subscriptionId: "sub_priya_tiffin",
    serviceId: "Executive Veg Lunch Thali",
    serviceDate: new Date().toISOString().split("T")[0],
    quantity: 1,
    unitPricePaise: 12000,
    totalPricePaise: 12000,
    status: "CONFIRMED",
    cutoffTime: "10:00 AM",
    notes: "Packed with 4 rotis, no onion salad",
  });

  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([
    {
      id: "sub_priya_tiffin",
      serviceId: "Executive Veg Lunch Thali",
      status: "ACTIVE",
      quantity: 1,
      unitPricePaise: 12000,
      cadence: "WEEKDAYS (Mon-Fri)",
      startDate: "2026-09-01",
    },
    {
      id: "sub_priya_water",
      serviceId: "Bisleri 20L Water Jar",
      status: "ACTIVE",
      quantity: 1,
      unitPricePaise: 9000,
      cadence: "ALTERNATE_DAYS",
      startDate: "2026-09-05",
    },
  ]);

  const [khataStatement, setKhataStatement] = useState<KhataStatement>({
    tenantId: "ten_sharma_tiffin",
    customerId: "usr_priya",
    runningBalancePaise: 12000,
    entries: [
      {
        id: "kh_101",
        entryType: "FULFILLMENT_DELIVERED",
        direction: "DEBIT",
        amountPaise: 12000,
        runningBalancePaise: 12000,
        description: "Delivered: Executive Veg Lunch Thali (Today)",
        createdAt: "Today 12:30 PM",
      },
      {
        id: "kh_102",
        entryType: "FULFILLMENT_DELIVERED",
        direction: "DEBIT",
        amountPaise: 12000,
        runningBalancePaise: 24000,
        description: "Delivered: Executive Veg Lunch Thali (Yesterday)",
        createdAt: "Yesterday 12:45 PM",
      },
      {
        id: "kh_103",
        entryType: "PAYMENT_RECEIVED",
        direction: "CREDIT",
        amountPaise: 24000,
        runningBalancePaise: 0,
        description: "UPI Payment Received (Ref #UPI893472)",
        createdAt: "2 days ago",
      },
    ],
  });

  const [invoices] = useState<InvoiceItem[]>([
    {
      id: "inv_2026_09_001",
      invoiceNumber: "INV-2026-09-0014",
      billingMonth: "2026-09",
      totalAmountPaise: 24000,
      paidAmountPaise: 12000,
      status: "ISSUED",
      dueDate: "2026-09-15",
    },
  ]);

  const [upiModal, setUpiModal] = useState<{
    open: boolean;
    intentUri: string;
    amountPaise: number;
  }>({
    open: false,
    intentUri: "",
    amountPaise: 0,
  });

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Fetch initial data if available
    const loadData = async () => {
      try {
        const khataRes = await fetch(`/api/khata?tenantId=${tenantId}&customerId=${customerId}`);
        const khataData = (await khataRes.json()) as { success: boolean; data?: KhataStatement };
        if (khataData.success && khataData.data?.entries && khataData.data.entries.length > 0) {
          setKhataStatement(khataData.data);
        }
      } catch (err) {
        console.error("Using local fallback", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tenantId, customerId]);

  // Handle Today's Skip / Confirm
  const handleToggleToday = async (newAction: "CONFIRM" | "SKIP") => {
    if (!todayFulfillment) return;
    setActionLoading(true);
    try {
      if (newAction === "SKIP") {
        setTodayFulfillment({ ...todayFulfillment, status: "SKIPPED" });
      } else {
        setTodayFulfillment({ ...todayFulfillment, status: "CONFIRMED" });
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Pause / Resume Subscription
  const handleToggleSubscription = async (subId: string, currentStatus: string) => {
    const nextAction = currentStatus === "ACTIVE" ? "pause" : "resume";
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === subId
          ? { ...s, status: nextAction === "pause" ? "PAUSED" : "ACTIVE" }
          : s
      )
    );
  };

  // Handle Instant UPI Pay
  const handlePayUPI = async (amountPaise: number) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          customerId,
          amountPaise,
          upiId: "sharmatiffin@okaxis",
          merchantName: "Sharma Tiffin Services",
        }),
      });
      const data = (await res.json()) as {
        success: boolean;
        data?: { upiIntentUri: string; amountPaise: number };
      };
      if (data.success && data.data) {
        setUpiModal({
          open: true,
          intentUri: data.data.upiIntentUri,
          amountPaise: data.data.amountPaise,
        });
      } else {
        // Fallback simulated UPI URI
        setUpiModal({
          open: true,
          intentUri: `upi://pay?pa=sharmatiffin@okaxis&pn=Sharma+Tiffin&am=${amountPaise / 100}&cu=INR`,
          amountPaise,
        });
      }
    } catch {
      setUpiModal({
        open: true,
        intentUri: `upi://pay?pa=sharmatiffin@okaxis&pn=Sharma+Tiffin&am=${amountPaise / 100}&cu=INR`,
        amountPaise,
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm font-mono">
        Loading RUXS domestic portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 max-w-4xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-md">
              Household Member
            </span>
            <span className="text-xs text-slate-400 font-mono">Sobha Classic, B-402</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Priya Sundaram</h1>
          <p className="text-xs text-slate-400 mt-0.5">Automated Everyday Operations</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/subscribe"
            className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition-all"
          >
            + Add Service
          </Link>
          <button
            onClick={() => handlePayUPI(khataStatement.runningBalancePaise || 12000)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10"
          >
            ⚡ Pay Khata via UPI
          </button>
        </div>
      </div>

      {/* TODAY'S DELIVERY CARD (HERO ACTION) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-emerald-950/30 border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                Today&apos;s Meal Delivery
              </span>
              <span className="text-xs text-slate-400 font-mono">Lunch Shift</span>
            </div>
            <h2 className="text-xl font-bold text-white">Executive Veg Lunch Thali</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cutoff: <span className="text-amber-400 font-mono">10:00 AM</span> (Standard Free Skip allowed)
            </p>
          </div>

          <div className="text-right">
            <span
              className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
                todayFulfillment?.status === "CONFIRMED"
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-700"
                  : todayFulfillment?.status === "SKIPPED"
                  ? "bg-rose-950/80 text-rose-300 border-rose-800"
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              {todayFulfillment?.status || "SCHEDULED"}
            </span>
            <span className="text-xs text-slate-400 font-mono block mt-1">
              {formatINR((todayFulfillment?.totalPricePaise || 12000) as Paise)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleToggleToday("CONFIRM")}
            disabled={actionLoading || todayFulfillment?.status === "CONFIRMED"}
            className={`flex-1 min-w-[140px] font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 ${
              todayFulfillment?.status === "CONFIRMED"
                ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/60 cursor-default"
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10"
            }`}
          >
            <span>✓</span> Deliver Today
          </button>

          <button
            onClick={() => handleToggleToday("SKIP")}
            disabled={actionLoading || todayFulfillment?.status === "SKIPPED"}
            className={`flex-1 min-w-[140px] font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 ${
              todayFulfillment?.status === "SKIPPED"
                ? "bg-rose-900/40 text-rose-300 border border-rose-700/60 cursor-default"
                : "bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-700"
            }`}
          >
            <span>✕</span> Skip Today (₹0 charge)
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mt-3 italic">
          💡 You can also reply directly with &quot;SKIP&quot; on WhatsApp before 10:00 AM.
        </p>
      </div>

      {/* Grid: Subscriptions + Digital Khata Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Subscriptions Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
              📦 My Active Subscriptions
            </h3>
            <span className="text-xs text-slate-500">{subscriptions.length} active</span>
          </div>

          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{sub.serviceId}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{sub.cadence}</p>
                    <span className="text-[11px] text-emerald-400 font-mono font-bold block mt-1">
                      {formatINR(sub.unitPricePaise as Paise)} / delivery
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      sub.status === "ACTIVE"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                        : "bg-amber-950 text-amber-400 border border-amber-800/60"
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                  <button
                    onClick={() => handleToggleSubscription(sub.id, sub.status)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all"
                  >
                    {sub.status === "ACTIVE" ? "⏸ Pause" : "▶ Resume"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Khata Ledger Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
                📖 Transparent Digital Khata
              </h3>
              <p className="text-[11px] text-slate-400">Append-only delivery ledger</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Balance Due</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {formatINR(khataStatement.runningBalancePaise as Paise)}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {khataStatement.entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs"
              >
                <div>
                  <p className="font-semibold text-white">{entry.description}</p>
                  <span className="text-[10px] text-slate-500">{entry.createdAt}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`font-mono font-bold ${
                      entry.direction === "DEBIT" ? "text-slate-300" : "text-emerald-400"
                    }`}
                  >
                    {entry.direction === "DEBIT" ? "+" : "-"}
                    {formatINR(entry.amountPaise as Paise)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Sharma Tiffin Services</span>
            <button
              onClick={() => handlePayUPI(khataStatement.runningBalancePaise || 12000)}
              className="text-emerald-400 hover:text-emerald-300 font-bold"
            >
              Pay Now &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Invoice History Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
            🧾 Monthly Invoices
          </h3>
          <span className="text-xs text-slate-500">Auto-aggregated 1st of every month</span>
        </div>

        <div className="space-y-2">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{inv.invoiceNumber}</span>
                  <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded-md font-bold">
                    {inv.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Due by {inv.dueDate} • Month: {inv.billingMonth}
                </p>
              </div>

              <div className="flex items-center gap-4 justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-sm font-black text-white font-mono block">
                    {formatINR(inv.totalAmountPaise as Paise)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Remaining: {formatINR((inv.totalAmountPaise - inv.paidAmountPaise) as Paise)}
                  </span>
                </div>
                <button
                  onClick={() => handlePayUPI(inv.totalAmountPaise - inv.paidAmountPaise)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10"
                >
                  Pay via UPI
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UPI Intent Payment Modal */}
      {upiModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="text-center">
              <span className="text-2xl block mb-1">⚡</span>
              <h3 className="text-lg font-bold text-white">Instant UPI Settlement</h3>
              <p className="text-xs text-slate-400 mt-1">
                Zero processing fees • Directly to Sharma Tiffin Services
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-500 block">Payable Amount</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">
                {formatINR(upiModal.amountPaise as Paise)}
              </span>
            </div>

            <div className="space-y-2">
              <a
                href={upiModal.intentUri}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                Open GPay / PhonePe / Paytm
              </a>
              <button
                onClick={() => setUpiModal({ open: false, intentUri: "", amountPaise: 0 })}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition-all"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
