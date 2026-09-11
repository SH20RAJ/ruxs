"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Subscription } from "@/src/modules/subscriptions/subscription-schema";

export default function SubscribePage() {
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
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <Link href="/customer/dashboard" className="text-xs text-emerald-400 hover:underline mb-1 block">
            ← Back to Customer Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">Household Recurring Subscriptions</h1>
          <p className="text-xs text-slate-400">
            Automate daily delivery cadences, pause for vacations, and inspect monthly spend.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
            User: Priya Sundaram
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <h2 className="text-base font-bold text-white mb-3">Set Up Recurring Delivery</h2>

          {error && (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-2.5 rounded-xl mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateSubscription} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Choose Service / Plan</label>
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
                        ? "bg-emerald-950/60 border-emerald-500 text-white"
                        : "bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="font-mono text-emerald-400 font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery Cadence</label>
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
                        ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                        : "bg-slate-950/40 border-slate-800 text-slate-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Qty</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Autopilot Mode</label>
                <select
                  value={autopilotDefault}
                  onChange={(e) => setAutopilotDefault(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white"
                >
                  <option value="CONFIRMED">Auto-Deliver</option>
                  <option value="SKIPPED">Ask Daily</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md mt-2"
            >
              {submitting ? "Activating Subscription..." : "Activate Subscription on Autopilot →"}
            </button>
          </form>
        </div>

        {/* Right List: Active Subscriptions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Your Subscriptions</h2>
            <span className="text-xs text-slate-400">{subscriptions.length} recurring contracts</span>
          </div>

          {loading ? (
            <div className="text-xs text-slate-500 p-8 text-center">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-sm text-slate-400 mb-1">No active subscriptions yet.</p>
              <p className="text-xs text-slate-600">
                Activate your first service on the left to put your daily household deliveries on autopilot.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className={`bg-slate-900/80 border rounded-2xl p-4 transition-all ${
                    sub.status === "ACTIVE"
                      ? "border-emerald-500/30 hover:border-emerald-500/60"
                      : "border-slate-800 opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            sub.status === "ACTIVE"
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                              : "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                          }`}
                        >
                          {sub.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {sub.cadence}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1.5">{sub.productName}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Qty: {sub.defaultQuantity} • Autopilot: {sub.autopilotDefault}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-emerald-400">
                        ₹{(sub.unitPricePaise / 100).toFixed(0)}
                      </div>
                      <span className="text-[10px] text-slate-400">per unit</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Started: {sub.startDate}
                    </span>

                    <div className="flex gap-2">
                      {sub.status === "ACTIVE" ? (
                        <button
                          type="button"
                          onClick={() => handleAction(sub.id, "pause")}
                          className="text-[11px] bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 px-2.5 py-1 rounded-lg"
                        >
                          Pause
                        </button>
                      ) : sub.status === "PAUSED" ? (
                        <button
                          type="button"
                          onClick={() => handleAction(sub.id, "resume")}
                          className="text-[11px] bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 px-2.5 py-1 rounded-lg"
                        >
                          Resume
                        </button>
                      ) : null}

                      {sub.status !== "CANCELLED" && (
                        <button
                          type="button"
                          onClick={() => handleAction(sub.id, "cancel")}
                          className="text-[11px] bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-900/40 px-2.5 py-1 rounded-lg"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
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
