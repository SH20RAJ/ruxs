"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HouseholdExpense } from "@/src/modules/expenses/expense-schema";
import { formatINR, Paise } from "@/src/shared/types/money";

export default function RoommateExpenseSplittingPage() {
  const [currentUserId] = useState("usr_ananya");

  const [expenses, setExpenses] = useState<HouseholdExpense[]>([
    {
      id: "exp_sept_water_milk",
      householdId: "hh_sobha_b402",
      invoiceId: "inv_2026_09_0014",
      description: "September Shared Water & Milk Invoice",
      totalAmountPaise: 36000, // ₹360.00
      paidByUserId: "usr_priya",
      paidByName: "Priya Sundaram",
      paidByUpi: "priya@okaxis",
      strategy: "EQUAL",
      isFullySettled: false,
      createdAt: "2026-09-10T11:00:00Z",
      updatedAt: "2026-09-10T11:00:00Z",
      participants: [
        {
          userId: "usr_priya",
          name: "Priya Sundaram",
          phone: "+91 98765 43210",
          sharePaise: 12000,
          isSettled: true,
          settledAt: "2026-09-10T11:00:00Z",
          upiId: "priya@okaxis",
        },
        {
          userId: "usr_ananya",
          name: "Ananya Deshmukh (You)",
          phone: "+91 98765 43217",
          sharePaise: 12000,
          isSettled: false,
          upiId: "ananya@oksbi",
        },
        {
          userId: "usr_sneha",
          name: "Sneha Reddy",
          phone: "+91 98765 43218",
          sharePaise: 12000,
          isSettled: true,
          settledAt: "2026-09-11T14:20:00Z",
          upiId: "sneha@okhdfc",
        },
      ],
    },
  ]);

  const handleMarkSettled = (expenseId: string, participantUserId: string) => {
    setExpenses((prev) =>
      prev.map((exp) => {
        if (exp.id !== expenseId) return exp;
        const updatedParticipants = exp.participants.map((p) =>
          p.userId === participantUserId
            ? { ...p, isSettled: true, settledAt: "Just now" }
            : p
        );
        return {
          ...exp,
          participants: updatedParticipants,
          isFullySettled: updatedParticipants.every((p) => p.isSettled),
        };
      })
    );
  };

  const myShareInSept = expenses[0].participants.find((p) => p.userId === currentUserId);
  const owesPriya = !myShareInSept?.isSettled ? (myShareInSept?.sharePaise || 12000) : 0;

  const upiDeepLink = `upi://pay?pa=priya@okaxis&pn=Priya%20Sundaram&am=${(owesPriya / 100).toFixed(
    2
  )}&cu=INR&tn=Sobha%20B-402%20Water%20Milk%20Split`;

  return (
    <div className="min-h-screen py-6 px-4 max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-md">
              Splitwise Layer
            </span>
            <span className="text-xs text-slate-400 font-mono">Sobha Classic, B-402</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Roommate Expense Splitting</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic division of cleared monthly service bills with zero penny drift
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/household"
            className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition-all"
          >
            &larr; Household Members
          </Link>
          <Link
            href="/customer/dashboard"
            className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition-all"
          >
            Personal Portal
          </Link>
        </div>
      </div>

      {/* Net Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 border border-rose-500/30 rounded-3xl p-5 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400">You Owe Flatmates</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-rose-400 font-mono">
              {formatINR(owesPriya as Paise)}
            </span>
            <span className="text-xs text-slate-400">to Priya Sundaram</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Priya covered the RUXS monthly invoice</p>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-5 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400">Flatmates Owe You</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-emerald-400 font-mono">₹0.00</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">All personal expenses are balanced</p>
        </div>
      </div>

      {/* Itemized Expenses Feed */}
      <div className="space-y-4">
        {expenses.map((exp) => (
          <div
            key={exp.id}
            className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                    Verified RUXS Invoice
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{exp.invoiceId}</span>
                </div>
                <h2 className="text-lg font-bold text-white">{exp.description}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paid upfront by <span className="text-white font-semibold">{exp.paidByName}</span>{" "}
                  via UPI (<span className="text-emerald-400 font-mono">{exp.paidByUpi}</span>)
                </p>
              </div>

              <div className="text-right">
                <span className="text-xl font-black text-white font-mono block">
                  {formatINR(exp.totalAmountPaise as Paise)}
                </span>
                <span className="text-xs text-slate-500">Split 3 ways (₹120.00 each)</span>
              </div>
            </div>

            {/* Roommate Breakdown List */}
            <div className="space-y-2.5">
              {exp.participants.map((p) => {
                const isMe = p.userId === currentUserId;
                const isPayer = p.userId === exp.paidByUserId;

                return (
                  <div
                    key={p.userId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{p.name}</span>
                        {isPayer && (
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                            Payer
                          </span>
                        )}
                        {p.isSettled ? (
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded font-bold">
                            ✓ Settled
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded font-bold">
                            Pending Payment
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                        {p.phone}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <span className="text-sm font-black text-white font-mono">
                        {formatINR(p.sharePaise as Paise)}
                      </span>

                      {!p.isSettled && isMe && (
                        <div className="flex gap-2">
                          <a
                            href={upiDeepLink}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-emerald-500/10 transition-all"
                          >
                            ⚡ Pay Priya via UPI
                          </a>
                          <button
                            onClick={() => handleMarkSettled(exp.id, p.userId)}
                            className="border border-slate-700 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                          >
                            Mark Paid
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Architecture Invariant Callout */}
            <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-xl text-xs text-slate-400 flex items-start gap-2">
              <span>🛡️</span>
              <p className="text-[11px] leading-relaxed">
                <strong className="text-white">Clean Architectural Invariant:</strong> The vendor
                (Sharma Tiffin & Bisleri Water) has already been fully credited and cleared.
                Roommate expense splitting runs as an independent peer-to-peer ledger without any
                liability on the local vendor.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
