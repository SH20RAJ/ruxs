"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Subscription } from "@/src/modules/subscriptions/subscription-schema";

export default function SubscribeClient() {
  const [customerId] = useState("usr_priya");
  const [tenantId] = useState("ten_sharma_tiffin");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [productName, setProductName] = useState("Standard Veg Thali");
  const [productId, setProductId] = useState("prd_thali");
  const [unitPricePaise, setUnitPricePaise] = useState(12000);
  const [cadence, setCadence] = useState<"DAILY" | "WEEKDAYS" | "ALTERNATE_DAYS">("DAILY");
  const [quantity, setQuantity] = useState(1);
  const [autopilotDefault, setAutopilotDefault] = useState<"CONFIRMED" | "SKIPPED">("CONFIRMED");

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch(`/api/subscriptions?customerId=${customerId}`);
      const data = (await res.json()) as { success: boolean; data?: Subscription[] };
      if (data.success && data.data) {
        setSubscriptions(data.data);
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [customerId]);

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          customerId,
          productId,
          productName,
          unitPricePaise,
          cadence,
          defaultQuantity: Number(quantity),
          autopilotDefault,
          startDate: todayStr,
        }),
      });

      const data = (await res.json()) as { success: boolean; data?: Subscription; error?: { message: string } };
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to create subscription");
      }

      await fetchSubscriptions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create subscription");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id: string, action: "pause" | "resume" | "cancel") => {
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json()) as { success: boolean };
      if (data.success) {
        await fetchSubscriptions();
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div>
          <Link href="/customer/dashboard" className="text-xs text-primary hover:underline mb-1 block">
            ← Back to Customer Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Household Recurring Subscriptions</h1>
          <p className="text-xs text-muted-foreground">
            Automate daily delivery cadences, pause for vacations, and inspect monthly spend.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-lg">
            User: Priya Sundaram
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-5 shadow-lg text-card-foreground">
          <h2 className="text-base font-bold text-foreground mb-3">Set Up Recurring Delivery</h2>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs p-2.5 rounded-xl mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateSubscription} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Choose Service / Plan</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: "prd_thali",
                    name: "Standard Veg Thali (Lunch)",
                    price: 12000,
                    label: "₹120 / meal",
                  },
                  {
                    id: "prd_water",
                    name: "20L Mineral Water Jar",
                    price: 4000,
                    label: "₹40 / jar",
                  },
                  {
                    id: "prd_milk",
                    name: "1L Pure Cow Milk (Morning)",
                    price: 6500,
                    label: "₹65 / L",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setProductId(item.id);
                      setProductName(item.name);
                      setUnitPricePaise(item.price);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs flex justify-between items-center ${
                      productId === item.id
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-background border-border text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="font-mono text-primary font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Delivery Cadence</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "DAILY", label: "Every Day" },
                  { id: "WEEKDAYS", label: "Mon - Fri" },
                  { id: "ALTERNATE_DAYS", label: "Alt Days" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCadence(item.id as any)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-medium transition-all ${
                      cadence === item.id
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Daily Qty</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Autopilot Mode</label>
                <select
                  value={autopilotDefault}
                  onChange={(e) => setAutopilotDefault(e.target.value as any)}
                  className="w-full bg-background border border-input rounded-xl px-2 py-2 text-xs text-foreground"
                >
                  <option value="CONFIRMED">Auto-Deliver</option>
                  <option value="SKIPPED">Ask Daily</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 rounded-xl text-xs transition-all shadow-md disabled:opacity-50"
            >
              {submitting ? "Creating Subscription..." : "+ Start Subscription"}
            </button>
          </form>
        </div>

        {/* Right Active Subscriptions List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-foreground">Your Active Subscriptions</h2>
            <span className="text-xs text-muted-foreground">{subscriptions.length} active</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-foreground">No active subscriptions yet</p>
              <p className="text-xs text-muted-foreground">
                Set up your first subscription on the left to start recurring deliveries.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-card-foreground shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground text-sm">{sub.productName}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sub.status === "ACTIVE"
                            ? "bg-primary/10 text-primary border border-primary/30"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>Cadence: <strong className="text-foreground">{sub.cadence}</strong></span>
                      <span>• Qty: <strong className="text-foreground">{sub.defaultQuantity}</strong></span>
                      <span>• ₹{(sub.unitPricePaise / 100).toFixed(2)}/unit</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {sub.status === "ACTIVE" ? (
                      <button
                        onClick={() => handleAction(sub.id, "pause")}
                        className="text-xs px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-foreground transition-all"
                      >
                        ⏸ Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(sub.id, "resume")}
                        className="text-xs px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:opacity-90"
                      >
                        ▶ Resume
                      </button>
                    )}

                    <button
                      onClick={() => handleAction(sub.id, "cancel")}
                      className="text-xs px-2.5 py-1.5 rounded-xl border border-destructive/30 hover:bg-destructive/10 text-destructive transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
