"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Dispute } from "@/src/modules/disputes/dispute-schema";
import { formatINR, Paise } from "@/src/shared/types/money";

export default function DisputesPortalPage() {
  const [activeTab, setActiveTab] = useState<string>("All");

  const [disputes, setDisputes] = useState<Dispute[]>([
    {
      id: "dsp_missing_meal_402",
      tenantId: "ten_sharma_tiffin",
      customerId: "usr_priya",
      customerName: "Priya Sundaram",
      customerPhone: "+91 98765 43210",
      fulfillmentId: "ful_2026_09_11_lunch_priya",
      reason: "NOT_DELIVERED",
      disputedAmountPaise: 12000, // ₹120.00
      status: "OPEN",
      createdAt: "Today 12:45 PM",
      updatedAt: "Today 12:45 PM",
      evidence: {
        driverDeliveredAt: "Today 12:15 PM",
        driverDropNotes: "Left outside flat B-402 on wooden shoerack",
        customerComment:
          "I was home the whole time. The shoerack is empty and doorbell was never rung.",
      },
    },
    {
      id: "dsp_spilled_dal_101",
      tenantId: "ten_sharma_tiffin",
      customerId: "usr_rahul",
      customerName: "Rahul Verma",
      customerPhone: "+91 98765 43212",
      fulfillmentId: "ful_2026_09_10_lunch_rahul",
      reason: "DAMAGED_OR_LEAKING",
      disputedAmountPaise: 12000,
      status: "REFUNDED",
      createdAt: "Yesterday 1:10 PM",
      updatedAt: "Yesterday 1:30 PM",
      evidence: {
        driverDeliveredAt: "Yesterday 12:50 PM",
        customerComment: "Tiffin container lid was loose; dal completely leaked into bag.",
      },
      resolution: {
        decision: "FULL_REFUND",
        refundPaise: 12000,
        resolutionNotes: "Apologies for damaged packaging. Full ₹120 credited to Khata.",
        resolvedBy: "Sharma Tiffin Operations",
        resolvedAt: "Yesterday 1:30 PM",
      },
    },
  ]);

  const handleResolve = (
    disputeId: string,
    decision: "FULL_REFUND" | "UPHELD_NO_REFUND",
    refundPaise: number,
    notes: string
  ) => {
    setDisputes((prev) =>
      prev.map((d) => {
        if (d.id !== disputeId) return d;
        return {
          ...d,
          status: decision === "FULL_REFUND" ? "REFUNDED" : "REJECTED",
          resolution: {
            decision,
            refundPaise,
            resolutionNotes: notes,
            resolvedBy: "Sharma (Owner)",
            resolvedAt: "Just now",
          },
        };
      })
    );
  };

  const filteredDisputes =
    activeTab === "All"
      ? disputes
      : disputes.filter((d) => d.status === activeTab);

  return (
    <div className="min-h-screen py-6 px-4 max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-md">
              Arbitration & Quality
            </span>
            <span className="text-xs text-slate-400 font-mono">Sharma Tiffin Services</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Dispute & Claim Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fair evidence arbitration with automatic compensating Digital Khata refunds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/vendor/dashboard"
            className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition-all"
          >
            &larr; Kitchen Dashboard
          </Link>
          <Link
            href="/customer/dashboard"
            className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition-all"
          >
            Customer View
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["All", "OPEN", "REFUNDED", "REJECTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === tab
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Disputes Feed */}
      <div className="space-y-4">
        {filteredDisputes.map((dispute) => {
          const isOpen = dispute.status === "OPEN";
          const isRefunded = dispute.status === "REFUNDED";
          const isRejected = dispute.status === "REJECTED";

          return (
            <div
              key={dispute.id}
              className={`rounded-3xl p-6 border transition-all ${
                isOpen
                  ? "bg-slate-900/90 border-amber-500/40 shadow-xl"
                  : isRefunded
                  ? "bg-slate-900/60 border-emerald-800/40"
                  : "bg-slate-900/40 border-slate-800/50 opacity-70"
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        isOpen
                          ? "bg-amber-950 text-amber-300 border-amber-700"
                          : isRefunded
                          ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                          : "bg-rose-950 text-rose-300 border-rose-800"
                      }`}
                    >
                      {dispute.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Reason: <strong className="text-white">{dispute.reason}</strong>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {dispute.customerName} ({dispute.customerPhone})
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Order Ref: {dispute.fulfillmentId} • Filed: {dispute.createdAt}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-rose-400 font-mono block">
                    {formatINR(dispute.disputedAmountPaise as Paise)}
                  </span>
                  <span className="text-xs text-slate-500">Contested Amount</span>
                </div>
              </div>

              {/* Evidence Timeline */}
              <div className="py-4 space-y-3">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    🔍 Delivery & Complaint Evidence Timeline
                  </span>

                  {dispute.evidence.driverDeliveredAt && (
                    <div className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-slate-500 font-mono">
                        {dispute.evidence.driverDeliveredAt}:
                      </span>
                      <span>
                        Driver marked delivered.{" "}
                        <em className="text-slate-400">&quot;{dispute.evidence.driverDropNotes}&quot;</em>
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-amber-400 font-mono">Customer:</span>
                    <span className="text-amber-200">
                      &quot;{dispute.evidence.customerComment}&quot;
                    </span>
                  </div>
                </div>

                {/* Resolution Notice if resolved */}
                {dispute.resolution && (
                  <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">
                        ✓ Resolution: {dispute.resolution.decision}
                      </span>
                      <span className="text-slate-500 font-mono">
                        by {dispute.resolution.resolvedBy}
                      </span>
                    </div>
                    <p className="text-slate-300">{dispute.resolution.resolutionNotes}</p>
                    {isRefunded && (
                      <p className="text-[11px] text-emerald-400 font-mono mt-1">
                        ⚡ Compensating Credit of {formatINR(dispute.resolution.refundPaise as Paise)}{" "}
                        appended to Customer Digital Khata.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons (Only when OPEN) */}
              {isOpen && (
                <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      handleResolve(
                        dispute.id,
                        "FULL_REFUND",
                        dispute.disputedAmountPaise,
                        "Driver dropped at wrong floor. Full refund issued to customer Khata."
                      )
                    }
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition-all"
                  >
                    <span>⚡</span> Approve Full Refund ({formatINR(dispute.disputedAmountPaise as Paise)})
                  </button>

                  <button
                    onClick={() =>
                      handleResolve(
                        dispute.id,
                        "UPHELD_NO_REFUND",
                        0,
                        "Driver geotag and photo verified at doorstep. Charge upheld."
                      )
                    }
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs border border-slate-700 transition-all"
                  >
                    Reject Claim & Uphold Charge
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
