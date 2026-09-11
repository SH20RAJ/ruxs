"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminVendorProfile, PlatformAuditLog } from "@/src/modules/admin/admin-schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

export default function AdminClient() {
  const [vendors, setVendors] = useState<AdminVendorProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<PlatformAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [vendorsRes, auditRes] = await Promise.all([
        fetch("/api/admin/vendors"),
        fetch("/api/admin/audit"),
      ]);
      const vendorsData = (await vendorsRes.json()) as { success: boolean; data?: AdminVendorProfile[] };
      const auditData = (await auditRes.json()) as { success: boolean; data?: PlatformAuditLog[] };

      if (vendorsData.success && vendorsData.data) {
        setVendors(vendorsData.data);
      }
      if (auditData.success && auditData.data) {
        setAuditLogs(auditData.data);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyVendor = async (vendorId: string) => {
    try {
      await fetch("/api/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          action: "VERIFY",
          adminUser: { userId: "usr_admin_ops", email: "ops@ruxs.in" },
        }),
      });
      await fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTierChange = async (vendorId: string, newTier: "STARTER" | "GROWTH" | "PRO") => {
    try {
      await fetch("/api/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          action: "CHANGE_TIER",
          tier: newTier,
          adminUser: { userId: "usr_admin_ops", email: "ops@ruxs.in" },
        }),
      });
      await fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 max-w-6xl mx-auto flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-sm">Loading platform dashboard from Neon database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="destructive" className="text-[10px] font-black uppercase tracking-wider">
                Platform Admin Console
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Environment: Production • ruxs.in</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Global Platform Oversight</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vendor approvals, SaaS plan subscriptions, and immutable audit logs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/vendor/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Vendor Portal
            </Link>
            <Link href="/disputes" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Dispute Queue
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-muted-foreground">Active Vendors</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-foreground font-mono">18</span>
              <span className="text-xs text-primary font-medium">verified</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">1 pending review</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-muted-foreground">Active Subscribers</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-primary font-mono">1,420</span>
              <span className="text-[10px] text-muted-foreground">flats</span>
            </div>
            <p className="text-[10px] text-primary mt-1">● 98.2% monthly renewal</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-muted-foreground">Today Fulfillments</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-foreground font-mono">1,294</span>
              <span className="text-xs text-muted-foreground">drops</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">0 lost items recorded</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-muted-foreground">Monthly GMV Transacted</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-primary font-mono">₹18.4L</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Auto-settled through UPI</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Vendor Verification Directory & Immutable Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Directory */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                🏪 Local Vendor Network & Approvals
              </CardTitle>
              <Badge variant="secondary" className="text-xs font-mono">
                {vendors.length} vendors registered
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {vendors.map((vendor) => {
              const isPending = vendor.status === "PENDING_VERIFICATION";
              const isVerified = vendor.status === "VERIFIED";

              return (
                <div
                  key={vendor.id}
                  className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">
                        {vendor.businessName}
                      </span>
                      <Badge
                        variant={isVerified ? "default" : isPending ? "secondary" : "destructive"}
                        className="text-[10px] font-black uppercase"
                      >
                        {vendor.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-0.5">
                      {vendor.phone} • Categories:{" "}
                      <span className="text-foreground font-medium">
                        {vendor.serviceCategories.join(", ")}
                      </span>
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground font-mono">
                      <span>Societies: {vendor.coveredSocieties.join(", ")}</span>
                      <span>• Subscribers: {vendor.subscriberCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Tier Selector */}
                    <div>
                      <select
                        value={vendor.tier}
                        onChange={(e) =>
                          handleTierChange(
                            vendor.id,
                            e.target.value as "STARTER" | "GROWTH" | "PRO"
                          )
                        }
                        className="bg-background border border-input text-xs text-foreground rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="STARTER">Starter Tier</option>
                        <option value="GROWTH">Growth Tier</option>
                        <option value="PRO">Pro Tier</option>
                      </select>
                    </div>

                    {isPending && (
                      <Button
                        size="sm"
                        onClick={() => handleVerifyVendor(vendor.id)}
                        className="font-bold text-xs"
                      >
                        ✓ Verify Vendor
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Immutable Audit Log */}
        <Card className="lg:col-span-1 bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                📜 Platform Audit Trail
              </CardTitle>
              <Badge variant="outline" className="text-[10px] text-primary border-primary/40 font-mono">
                ● Tamper-evident
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-muted/30 border border-border rounded-xl p-3 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] font-black uppercase">
                    {log.action.replace("_", " ")}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">{log.createdAt}</span>
                </div>
                <p className="text-foreground leading-snug mt-1">{log.details}</p>
                <span className="text-[10px] text-muted-foreground block">by {log.adminEmail}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
