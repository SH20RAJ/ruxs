"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HouseholdExpense } from "@/src/modules/expenses/expense-schema";
import { formatINR, Paise } from "@/src/shared/types/money";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

export default function HouseholdExpensesClient() {
  const [currentUserId] = useState("usr_ananya");
  const [expenses, setExpenses] = useState<HouseholdExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses?householdId=hh_sobha_b402");
      const data = (await res.json()) as { success: boolean; data?: HouseholdExpense[] };
      if (data.success && data.data) {
        setExpenses(data.data);
      }
    } catch (err) {
      console.error("Failed to load household expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 max-w-4xl mx-auto flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-sm">Loading roommate expenses from Neon database...</p>
      </div>
    );
  }

  const handleMarkSettled = async (expenseId: string, participantUserId: string) => {
    try {
      await fetch("/api/expenses/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseId, participantUserId }),
      });
      await fetchExpenses();
    } catch (err) {
      console.error("Failed to mark settled:", err);
    }
  };

  const firstExpense = expenses.length > 0 ? expenses[0] : null;
  const myShareInSept = firstExpense?.participants.find((p) => p.userId === currentUserId);
  const owesPriya = myShareInSept && !myShareInSept.isSettled ? myShareInSept.sharePaise : 0;
  const payeeUpi = firstExpense?.paidByUpi || "priya@okaxis";
  const payeeName = encodeURIComponent(firstExpense?.paidByName || "Priya Sundaram");

  const upiDeepLink = `upi://pay?pa=${payeeUpi}&pn=${payeeName}&am=${(owesPriya / 100).toFixed(
    2
  )}&cu=INR&tn=Sobha%20B-402%20Expense%20Split`;

  return (
    <div className="min-h-screen py-6 px-4 max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider text-primary border-primary/40">
                Splitwise Layer
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Sobha Classic, B-402</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Roommate Expense Splitting</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automatic division of cleared monthly service bills with zero penny drift
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/household" className={buttonVariants({ variant: "outline", size: "sm" })}>
              &larr; Household Members
            </Link>
            <Link href="/customer/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Personal Portal
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Net Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-muted-foreground">You Owe Flatmates</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-destructive font-mono">
                {formatINR(owesPriya as Paise)}
              </span>
              <span className="text-xs text-muted-foreground">to Priya Sundaram</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Priya covered the RUXS monthly invoice</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-muted-foreground">Flatmates Owe You</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-primary font-mono">₹0.00</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">All personal expenses are balanced</p>
          </CardContent>
        </Card>
      </div>

      {/* Itemized Expenses Feed */}
      <div className="space-y-4">
        {expenses.length === 0 && (
          <Card className="bg-card border-border p-8 text-center text-muted-foreground text-sm">
            No shared domestic expenses found.
          </Card>
        )}
        {expenses.map((exp) => (
          <Card key={exp.id} className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase text-primary border-primary/40">
                      Verified RUXS Invoice
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">{exp.invoiceId}</span>
                  </div>
                  <CardTitle className="text-lg font-bold">{exp.description}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Paid upfront by <span className="text-foreground font-semibold">{exp.paidByName}</span>{" "}
                    via UPI (<span className="text-primary font-mono">{exp.paidByUpi}</span>)
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-foreground font-mono block">
                    {formatINR(exp.totalAmountPaise as Paise)}
                  </span>
                  <span className="text-xs text-muted-foreground">Split 3 ways (₹120.00 each)</span>
                </div>
              </div>
            </CardHeader>

            {/* Roommate Breakdown List */}
            <CardContent className="space-y-3">
              <div className="space-y-2.5">
                {exp.participants.map((p) => {
                  const isMe = p.userId === currentUserId;
                  const isPayer = p.userId === exp.paidByUserId;

                  return (
                    <div
                      key={p.userId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-muted/30 border border-border gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-xs">{p.name}</span>
                          {isPayer && (
                            <Badge variant="outline" className="text-[10px] font-mono">
                              Payer
                            </Badge>
                          )}
                          <Badge
                            variant={p.isSettled ? "default" : "secondary"}
                            className="text-[10px] font-bold"
                          >
                            {p.isSettled ? "✓ Settled" : "Pending Payment"}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
                          {p.phone}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <span className="text-sm font-black text-foreground font-mono">
                          {formatINR(p.sharePaise as Paise)}
                        </span>

                        {!p.isSettled && isMe && (
                          <div className="flex gap-2">
                          <a
                            href={upiDeepLink}
                            className={buttonVariants({ size: "sm", className: "text-xs font-bold" })}
                          >
                            ⚡ Pay Priya via UPI
                          </a>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkSettled(exp.id, p.userId)}
                              className="text-xs"
                            >
                              Mark Paid
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Architecture Invariant Callout */}
              <div className="bg-muted/40 border border-border p-3 rounded-xl text-xs text-muted-foreground flex items-start gap-2 mt-3">
                <span>🛡️</span>
                <p className="text-[11px] leading-relaxed">
                  <strong className="text-foreground">Clean Architectural Invariant:</strong> The vendor
                  (Sharma Tiffin & Bisleri Water) has already been fully credited and cleared.
                  Roommate expense splitting runs as an independent peer-to-peer ledger without any
                  liability on the local vendor.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
