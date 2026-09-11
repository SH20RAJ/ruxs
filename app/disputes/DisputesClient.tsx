"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Dispute } from "@/src/modules/disputes/dispute-schema";
import { formatINR, Paise } from "@/src/shared/types/money";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

export default function DisputesClient() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = async () => {
    try {
      const res = await fetch("/api/disputes?tenantId=ten_sharma_tiffin");
      const data = (await res.json()) as { success: boolean; data?: Dispute[] };
      if (data.success && data.data) {
        setDisputes(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch disputes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (
    disputeId: string,
    decision: "FULL_REFUND" | "UPHELD_NO_REFUND",
    refundPaise: number,
    notes: string
  ) => {
    try {
      await fetch(`/api/disputes/${disputeId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          refundPaise: decision === "FULL_REFUND" ? refundPaise : 0,
          resolutionNotes: notes,
          resolvedBy: "Sharma (Owner)",
        }),
      });
      await fetchDisputes();
    } catch (err) {
      console.error("Failed to resolve dispute:", err);
    }
  };

  const filteredDisputes =
    activeTab === "All"
      ? disputes
      : disputes.filter((d) => d.status === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 max-w-4xl mx-auto flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-sm">Loading disputes from Neon database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider text-secondary border-secondary/40">
                Arbitration & Quality
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Sharma Tiffin Services</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Dispute & Claim Management</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fair evidence arbitration with automatic compensating Digital Khata refunds
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/vendor/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
              &larr; Kitchen Dashboard
            </Link>
            <Link href="/customer/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Customer View
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["All", "OPEN", "REFUNDED", "REJECTED"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className="text-xs font-bold"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Disputes Feed */}
      <div className="space-y-4">
        {filteredDisputes.length === 0 && (
          <Card className="bg-card border-border p-8 text-center text-muted-foreground text-sm">
            No disputes found.
          </Card>
        )}
        {filteredDisputes.map((dispute) => {
          const isOpen = dispute.status === "OPEN";
          const isRefunded = dispute.status === "REFUNDED";

          return (
            <Card
              key={dispute.id}
              className={`border transition-colors ${
                isOpen
                  ? "bg-card border-secondary/50 shadow-md"
                  : isRefunded
                  ? "bg-card border-primary/40"
                  : "bg-muted/30 border-border opacity-70"
              }`}
            >
              {/* Header */}
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={isOpen ? "secondary" : isRefunded ? "default" : "destructive"}
                        className="text-[10px] font-black uppercase"
                      >
                        {dispute.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        Reason: <strong className="text-foreground">{dispute.reason}</strong>
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold">
                      {dispute.customerName} ({dispute.customerPhone})
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      Order Ref: {dispute.fulfillmentId} • Filed: {dispute.createdAt}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black text-destructive font-mono block">
                      {formatINR(dispute.disputedAmountPaise as Paise)}
                    </span>
                    <span className="text-xs text-muted-foreground">Contested Amount</span>
                  </div>
                </div>
              </CardHeader>

              {/* Evidence Timeline */}
              <CardContent className="space-y-3 pt-0">
                <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    🔍 Delivery & Complaint Evidence Timeline
                  </span>

                  {dispute.evidence.driverDeliveredAt && (
                    <div className="text-xs text-foreground flex items-start gap-2">
                      <span className="text-muted-foreground font-mono">
                        {dispute.evidence.driverDeliveredAt}:
                      </span>
                      <span>
                        Driver marked delivered.{" "}
                        <em className="text-muted-foreground">&quot;{dispute.evidence.driverDropNotes}&quot;</em>
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-foreground flex items-start gap-2">
                    <span className="text-secondary font-mono font-bold">Customer:</span>
                    <span className="text-secondary-foreground">
                      &quot;{dispute.evidence.customerComment}&quot;
                    </span>
                  </div>
                </div>

                {/* Resolution Notice if resolved */}
                {dispute.resolution && (
                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">
                        ✓ Resolution: {dispute.resolution.decision}
                      </span>
                      <span className="text-muted-foreground font-mono">
                        by {dispute.resolution.resolvedBy}
                      </span>
                    </div>
                    <p className="text-foreground">{dispute.resolution.resolutionNotes}</p>
                    {isRefunded && (
                      <p className="text-[11px] text-primary font-mono mt-1">
                        ⚡ Compensating Credit of {formatINR(dispute.resolution.refundPaise as Paise)}{" "}
                        appended to Customer Digital Khata.
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons (Only when OPEN) */}
                {isOpen && (
                  <div className="pt-3 border-t border-border flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleResolve(
                          dispute.id,
                          "FULL_REFUND",
                          dispute.disputedAmountPaise,
                          "Driver dropped at wrong floor. Full refund issued to customer Khata."
                        )
                      }
                      className="font-bold text-xs"
                    >
                      ⚡ Approve Full Refund ({formatINR(dispute.disputedAmountPaise as Paise)})
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleResolve(
                          dispute.id,
                          "UPHELD_NO_REFUND",
                          0,
                          "Driver geotag and photo verified at doorstep. Charge upheld."
                        )
                      }
                      className="text-xs font-semibold"
                    >
                      Reject Claim & Uphold Charge
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
