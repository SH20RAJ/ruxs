"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { KitchenPrepBatch } from "@/src/modules/cutoff/cutoff-engine";
import { formatINR, Paise } from "@/src/shared/types/money";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface VendorSubscriber {
  id: string;
  subscriptionId?: string;
  name: string;
  phone: string;
  plan: string;
  flat: string;
  balance: number;
  status: string;
}

export default function VendorDashboardClient() {
  const [tenantId] = useState("ten_sharma_tiffin");
  const [batch, setBatch] = useState<KitchenPrepBatch | null>(null);
  const [customers, setCustomers] = useState<VendorSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchBatchCounter = async () => {
    try {
      const [batchRes, custRes] = await Promise.all([
        fetch(`/api/vendor/kitchen-counter?tenantId=${tenantId}&date=${todayStr}&shift=LUNCH`),
        fetch(`/api/vendor/subscribers?tenantId=${tenantId}&date=${todayStr}`),
      ]);
      const batchData = (await batchRes.json()) as { success: boolean; data?: KitchenPrepBatch };
      if (batchData.success && batchData.data) {
        setBatch(batchData.data);
      }
      const custData = (await custRes.json()) as { success: boolean; data?: VendorSubscriber[] };
      if (custData.success && Array.isArray(custData.data)) {
        setCustomers(custData.data);
      }
    } catch (err) {
      console.error("Failed to load operational data from DB:", err);
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

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.flat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.plan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenuePaise = Object.values(batch?.skuBreakdown || {}).reduce(
    (acc, curr) => acc + (curr.totalPaise || 0),
    0
  );

  return (
    <div className="min-h-screen py-6 px-4 max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider text-primary border-primary/40">
              Live Operations
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Today: {todayStr} (Lunch Shift)</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Kitchen Prep & Delivery Counter</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/vendor/services" className={buttonVariants({ variant: "outline", size: "sm" })}>
            ⚙️ Services & Pricing
          </Link>
          <Link href="/vendor/onboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
            🔗 Invite Link / QR
          </Link>
          <Button
            size="sm"
            onClick={handleLockCutoff}
            disabled={locking}
            className="font-bold shadow-md"
          >
            {locking ? "Locking..." : "🔒 Lock Cutoff Now"}
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-muted-foreground">Total Cooking Demand</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-foreground font-mono">
                {(batch?.totalConfirmed || 0) + (batch?.totalInPrep || 0)}
              </span>
              <span className="text-xs text-primary font-medium">meals to pack</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Zero excess cooking waste</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-muted-foreground">Cutoff Window</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-secondary font-mono">
                {batch?.cutoffTimeStr || "10:00 AM"}
              </span>
              <span className="text-[10px] text-muted-foreground">IST</span>
            </div>
            <p className="text-[10px] text-primary mt-1">● WhatsApp 8:30 AM poll completed</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-muted-foreground">Today Skipped</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-muted-foreground font-mono">
                {batch?.totalSkipped || 0}
              </span>
              <span className="text-xs text-muted-foreground">subscribers</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Excluded before groceries opened</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-muted-foreground">Today&apos;s Revenue</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-primary font-mono">
                {totalRevenuePaise > 0 ? formatINR(totalRevenuePaise as Paise) : "₹0"}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Auto-credited into Khata</p>
          </CardContent>
        </Card>
      </div>

      {/* SKU Breakdown & Live Kitchen Counter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              🥘 Kitchen Production List
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.keys(batch?.skuBreakdown || {}).length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No active orders scheduled for this shift yet.
              </p>
            ) : (
              Object.entries(batch!.skuBreakdown).map(([skuId, item]) => (
                <div
                  key={skuId}
                  className="flex justify-between items-center bg-muted/40 border border-border p-3 rounded-xl"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">{item.productName}</p>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatINR(item.totalPaise as Paise)} total
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-primary font-mono">{item.quantity}</span>
                    <span className="text-[10px] text-muted-foreground block">packs</span>
                  </div>
                </div>
              ))
            )}

            <Separator className="my-2" />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subscribers:</span>
              <span className="text-foreground font-medium">{customers.length} total active</span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Roster & Quick Actions */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                📋 Subscriber Run Sheet & Khata
              </CardTitle>
              <Input
                type="text"
                placeholder="Search by name or apartment flat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 text-xs"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {filteredCustomers.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                No matching subscribers found.
              </p>
            ) : (
              filteredCustomers.map((cust) => (
                <div
                  key={cust.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border hover:border-primary/40 transition-colors text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{cust.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{cust.flat}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{cust.plan}</p>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-primary">
                        ₹{cust.balance}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">Khata balance</span>
                    </div>
                    <Badge
                      variant={
                        cust.status === "CONFIRMED"
                          ? "default"
                          : cust.status === "IN_PREPARATION"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px] font-bold uppercase"
                    >
                      {cust.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
