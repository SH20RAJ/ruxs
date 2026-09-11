"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ServiceDefinition } from "@/src/modules/services/service-schema";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function VendorServicesClient() {
  const [tenantId] = useState("ten_sharma_tiffin");
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("Daily Executive Veg Lunch");
  const [category, setCategory] = useState("TIFFIN");
  const [productName, setProductName] = useState("Standard Veg Thali");
  const [unitType, setUnitType] = useState("MEAL");
  const [priceInRupees, setPriceInRupees] = useState(120);
  const [cutoffTimeStr, setCutoffTimeStr] = useState("10:00");
  const [pollTimeStr, setPollTimeStr] = useState("08:30");
  const [requiresAssetTracking, setRequiresAssetTracking] = useState(true);
  const [lateCancellationFeePercent, setLateCancellationFeePercent] = useState(50);

  const fetchServices = async () => {
    try {
      const res = await fetch(`/api/vendor/services?tenantId=${tenantId}`);
      const data = (await res.json()) as { success: boolean; data?: ServiceDefinition[] };
      if (data.success && data.data) {
        setServices(data.data);
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [tenantId]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/vendor/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          name,
          category,
          productName,
          unitType,
          priceInRupees: Number(priceInRupees),
          cutoffTimeStr,
          pollTimeStr,
          requiresAssetTracking,
          lateCancellationFeePercent: Number(lateCancellationFeePercent),
        }),
      });

      const data = (await res.json()) as { success: boolean; data?: ServiceDefinition; error?: { message: string } };
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to create service");
      }

      await fetchServices();
      setName("");
      setProductName("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create service");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <Link href="/vendor/dashboard" className="text-xs text-primary hover:underline mb-1 inline-block">
            ← Back to Kitchen Counter
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Service Catalog & Pricing</h1>
          <p className="text-xs text-muted-foreground">
            Define daily recurring products, cutoff deadlines, and container deposits.
          </p>
        </div>
        <div>
          <Badge variant="outline" className="font-mono text-[11px]">
            Tenant: {tenantId}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Add New Service */}
        <Card className="lg:col-span-5 bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Add Recurring Service</CardTitle>
            <CardDescription className="text-xs">
              Configure daily subscription offering parameters
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="border border-destructive/50 bg-destructive/10 text-destructive text-xs p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Service Category</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="TIFFIN">🍱 Tiffin / Daily Meals</option>
                  <option value="WATER">💧 20L Water Jars</option>
                  <option value="MILK">🥛 Fresh Milk Delivery</option>
                  <option value="FLOWERS">🌸 Pooja Flowers</option>
                  <option value="NEWSPAPER">📰 Newspapers</option>
                  <option value="LAUNDRY">🧺 Laundry & Dhobi</option>
                  <option value="CAR_CLEANING">🚗 Daily Car Cleaning</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Service Display Name</Label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Daily North Indian Lunch"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Default Product</Label>
                  <Input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Standard Thali"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Price (₹ INR)</Label>
                  <Input
                    type="number"
                    required
                    min="1"
                    value={priceInRupees}
                    onChange={(e) => setPriceInRupees(Number(e.target.value))}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">WhatsApp Poll</Label>
                  <Input
                    type="text"
                    value={pollTimeStr}
                    onChange={(e) => setPollTimeStr(e.target.value)}
                    placeholder="08:30"
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Hard Cutoff</Label>
                  <Input
                    type="text"
                    value={cutoffTimeStr}
                    onChange={(e) => setCutoffTimeStr(e.target.value)}
                    placeholder="10:00"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresAssetTracking}
                    onChange={(e) => setRequiresAssetTracking(e.target.checked)}
                    className="accent-primary rounded"
                  />
                  Track returnable containers (Tiffin / Jar)
                </label>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Late skip fee:</span>
                  <span className="font-semibold text-foreground">{lateCancellationFeePercent}%</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full text-xs font-bold"
              >
                {submitting ? "Saving..." : "+ Save Service Offering"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right List: Active Services */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Active Service Offerings</h2>
            <Badge variant="secondary" className="text-xs">
              {services.length} configured
            </Badge>
          </div>

          {loading ? (
            <div className="text-xs text-muted-foreground p-8 text-center">Loading service catalog...</div>
          ) : services.length === 0 ? (
            <Card className="p-8 text-center bg-card border-border">
              <p className="text-sm text-foreground mb-1">No services registered yet.</p>
              <p className="text-xs text-muted-foreground">
                Use the form on the left to create your first recurring offering.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {services.map((svc) => (
                <Card
                  key={svc.id}
                  className="bg-card border-border hover:border-primary/40 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-primary border-primary/40">
                          {svc.category}
                        </Badge>
                        <h3 className="text-sm font-bold text-foreground mt-2">{svc.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          WhatsApp Poll: {svc.pollTimeStr} AM • Cutoff: {svc.cutoffTimeStr} AM
                        </p>
                      </div>
                      <div className="text-right">
                        {svc.products.map((p) => (
                          <div key={p.id} className="text-sm font-bold font-mono text-primary">
                            ₹{(p.basePricePaise / 100).toFixed(0)}
                            <span className="text-[11px] font-normal text-muted-foreground"> / {p.unitType.toLowerCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {svc.requiresAssetTracking ? "📦 Container tracking ON" : "🚫 Single-use"}
                      </span>
                      <span className="text-primary font-medium">● Active</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
