"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatINR, Paise } from "@/src/shared/types/money";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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

export default function CustomerDashboardClient() {
  const [customerId] = useState("usr_priya");
  const [tenantId] = useState("ten_sharma_tiffin");
  const [loading, setLoading] = useState(true);

  // Dynamic state loaded strictly from Neon DB via API
  const [todayFulfillment, setTodayFulfillment] = useState<FulfillmentItem | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [khataStatement, setKhataStatement] = useState<KhataStatement>({
    tenantId: "ten_sharma_tiffin",
    customerId: "usr_priya",
    runningBalancePaise: 0,
    entries: [],
  });
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);

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
    const loadData = async () => {
      try {
        const [fulRes, subRes, khataRes, invRes] = await Promise.all([
          fetch(`/api/fulfillments?customerId=${customerId}`),
          fetch(`/api/subscriptions?customerId=${customerId}`),
          fetch(`/api/khata?tenantId=${tenantId}&customerId=${customerId}`),
          fetch(`/api/billing/invoices?customerId=${customerId}`),
        ]);

        const fulData = (await fulRes.json()) as { success: boolean; data?: any[] };
        if (fulData.success && Array.isArray(fulData.data) && fulData.data.length > 0) {
          const todayStr = new Date().toISOString().split("T")[0];
          const match = fulData.data.find((f: any) => f.serviceDate === todayStr) || fulData.data[0];
          setTodayFulfillment({
            id: match.id,
            subscriptionId: match.subscriptionId,
            serviceId: match.items?.[0]?.productName || "Standard Lunch Service",
            serviceDate: match.serviceDate,
            quantity: match.items?.[0]?.quantity || 1,
            unitPricePaise: match.items?.[0]?.unitPricePaise || match.totalPricePaise,
            totalPricePaise: match.totalPricePaise,
            status: match.status,
            cutoffTime: match.cutoffTime || "10:00 AM",
            notes: match.notes,
          });
        }

        const subData = (await subRes.json()) as { success: boolean; data?: any[] };
        if (subData.success && Array.isArray(subData.data)) {
          setSubscriptions(
            subData.data.map((s: any) => ({
              id: s.id,
              serviceId: s.productName || "Recurring Service",
              status: s.status,
              quantity: s.defaultQuantity || 1,
              unitPricePaise: s.unitPricePaise,
              cadence: s.cadence,
              startDate: s.startDate,
            }))
          );
        }

        const khataData = (await khataRes.json()) as { success: boolean; data?: KhataStatement };
        if (khataData.success && khataData.data) {
          setKhataStatement(khataData.data);
        }

        const invData = (await invRes.json()) as { success: boolean; data?: any[] };
        if (invData.success && Array.isArray(invData.data)) {
          setInvoices(
            invData.data.map((i: any) => ({
              id: i.id,
              invoiceNumber: i.invoiceNumber,
              billingMonth: (i.periodStart || "").substring(0, 7) || "2026-09",
              totalAmountPaise: i.totalAmountDuePaise || i.subtotalPaise || 0,
              paidAmountPaise: i.amountPaidPaise || 0,
              status: i.status,
              dueDate: i.dueDate,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load customer data from Neon DB:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tenantId, customerId]);

  const handleToggleToday = async (newAction: "CONFIRM" | "SKIP") => {
    if (!todayFulfillment) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/fulfillments/${todayFulfillment.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: newAction }),
      });
      const data = (await res.json()) as { success: boolean; data?: { status: string } };
      if (data.success && data.data) {
        setTodayFulfillment((prev) => (prev ? { ...prev, status: data.data!.status } : null));
      } else {
        setTodayFulfillment((prev) =>
          prev ? { ...prev, status: newAction === "SKIP" ? "SKIPPED" : "CONFIRMED" } : null
        );
      }
    } catch (err) {
      console.error("Failed to transition fulfillment:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSubscription = async (subId: string, currentStatus: string) => {
    const nextAction = currentStatus === "ACTIVE" ? "pause" : "resume";
    try {
      const res = await fetch(`/api/subscriptions/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextAction }),
      });
      const data = (await res.json()) as { success: boolean; data?: { status: "ACTIVE" | "PAUSED" | "CANCELLED" } };
      if (data.success && data.data) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === subId ? { ...s, status: data.data!.status } : s))
        );
      } else {
        setSubscriptions((prev) =>
          prev.map((s) =>
            s.id === subId
              ? { ...s, status: nextAction === "pause" ? "PAUSED" : "ACTIVE" }
              : s
          )
        );
      }
    } catch (err) {
      console.error("Failed to update subscription:", err);
    }
  };

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
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm font-mono">
        Loading RUXS domestic portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 max-w-4xl mx-auto space-y-6">
      {/* Top Header Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider text-primary border-primary/40">
                Household Member
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Sobha Classic, B-402</span>
            </div>
            <h1 className="text-2xl font-black text-foreground">Priya Sundaram</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Automated Everyday Operations</p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/subscribe" className={buttonVariants({ variant: "outline", size: "sm" })}>
              + Add Service
            </Link>
            <Button
              size="sm"
              onClick={() => handlePayUPI(khataStatement.runningBalancePaise || 12000)}
              className="font-bold shadow-md"
            >
              ⚡ Pay Khata via UPI
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TODAY'S DELIVERY CARD (HERO ACTION) */}
      <Card className="border-primary/40 bg-card shadow-lg relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider text-primary">
                  Today&apos;s Meal Delivery
                </span>
                <span className="text-xs text-muted-foreground font-mono">Lunch Shift</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {todayFulfillment?.serviceId || "No active fulfillment scheduled for today"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cutoff: <span className="text-secondary font-mono font-bold">{todayFulfillment?.cutoffTime || "10:00 AM"}</span> (Standard Free Skip allowed)
              </p>
            </div>

            <div className="text-right">
              <Badge
                variant={todayFulfillment?.status === "CONFIRMED" ? "default" : "secondary"}
                className="text-xs font-black uppercase"
              >
                {todayFulfillment?.status || "NO SCHEDULE"}
              </Badge>
              {todayFulfillment && (
                <span className="text-xs text-muted-foreground font-mono block mt-1">
                  {formatINR(todayFulfillment.totalPricePaise as Paise)}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => handleToggleToday("CONFIRM")}
              disabled={actionLoading || !todayFulfillment || todayFulfillment.status === "CONFIRMED"}
              className="flex-1 min-w-[140px] font-bold text-xs"
            >
              ✓ Deliver Today
            </Button>

            <Button
              variant="outline"
              onClick={() => handleToggleToday("SKIP")}
              disabled={actionLoading || !todayFulfillment || todayFulfillment.status === "SKIPPED"}
              className="flex-1 min-w-[140px] font-bold text-xs hover:text-destructive hover:border-destructive/50"
            >
              ✕ Skip Today (₹0 charge)
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground mt-3 italic">
            💡 You can also reply directly with &quot;SKIP&quot; on WhatsApp before 10:00 AM.
          </p>
        </CardContent>
      </Card>

      {/* Grid: Subscriptions + Digital Khata Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Subscriptions Card */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                📦 My Active Subscriptions
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {subscriptions.length} active
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {subscriptions.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No active recurring subscriptions found.
              </div>
            ) : (
              subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-muted/30 border border-border rounded-xl p-3.5 flex flex-col justify-between gap-3 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{sub.serviceId}</h4>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{sub.cadence}</p>
                      <span className="text-[11px] text-primary font-mono font-bold block mt-1">
                        {formatINR(sub.unitPricePaise as Paise)} / delivery
                      </span>
                    </div>
                    <Badge variant={sub.status === "ACTIVE" ? "default" : "secondary"} className="text-[10px] font-bold">
                      {sub.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleSubscription(sub.id, sub.status)}
                      className="text-xs h-7 px-2.5"
                    >
                      {sub.status === "ACTIVE" ? "⏸ Pause" : "▶ Resume"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Digital Khata Ledger Card */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  📖 Transparent Digital Khata
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">Append-only delivery ledger</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Balance Due</span>
                <span className="text-base font-black text-primary font-mono">
                  {formatINR(khataStatement.runningBalancePaise as Paise)}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-2.5">
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {khataStatement.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border text-xs"
                >
                  <div>
                    <p className="font-semibold text-foreground">{entry.description}</p>
                    <span className="text-[10px] text-muted-foreground">{entry.createdAt}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-bold ${
                        entry.direction === "DEBIT" ? "text-foreground" : "text-primary"
                      }`}
                    >
                      {entry.direction === "DEBIT" ? "+" : "-"}
                      {formatINR(entry.amountPaise as Paise)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Sharma Tiffin Services</span>
              <button
                type="button"
                onClick={() => handlePayUPI(khataStatement.runningBalancePaise || 12000)}
                className="text-primary hover:underline font-bold"
              >
                Pay Now &rarr;
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice History Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              🧾 Monthly Invoices
            </CardTitle>
            <span className="text-xs text-muted-foreground">Auto-aggregated 1st of every month</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {invoices.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No monthly invoices generated yet. Statements are generated on the 1st of each month.
            </div>
          ) : (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">{inv.invoiceNumber}</span>
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {inv.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Due by {inv.dueDate} • Month: {inv.billingMonth}
                  </p>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-sm font-black text-foreground font-mono block">
                      {formatINR(inv.totalAmountPaise as Paise)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Remaining: {formatINR((inv.totalAmountPaise - inv.paidAmountPaise) as Paise)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handlePayUPI(inv.totalAmountPaise - inv.paidAmountPaise)}
                    className="font-bold text-xs"
                  >
                    Pay via UPI
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* UPI Intent Payment Modal */}
      {upiModal.open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-sm w-full shadow-2xl border-border bg-card">
            <CardHeader className="text-center pb-2">
              <span className="text-2xl block mb-1">⚡</span>
              <CardTitle className="text-lg font-bold">Instant UPI Settlement</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Zero processing fees • Directly to Sharma Tiffin Services
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/40 p-4 text-center">
                <span className="text-xs text-muted-foreground block">Payable Amount</span>
                <span className="text-3xl font-black text-primary font-mono">
                  {formatINR(upiModal.amountPaise as Paise)}
                </span>
              </div>

              <div className="space-y-2">
                <a href={upiModal.intentUri} className={buttonVariants({ className: "w-full text-xs font-bold" })}>
                  Open GPay / PhonePe / Paytm
                </a>
                <Button
                  variant="outline"
                  onClick={() => setUpiModal({ open: false, intentUri: "", amountPaise: 0 })}
                  className="w-full text-xs"
                >
                  Done / Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
