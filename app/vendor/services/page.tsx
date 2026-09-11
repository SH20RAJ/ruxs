"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ServiceDefinition } from "@/src/modules/services/service-schema";

export default function VendorServicesPage() {
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
    <div className="min-h-screen py-8 px-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <Link href="/vendor/dashboard" className="text-xs text-emerald-400 hover:underline mb-1 block">
            ← Back to Kitchen Counter
          </Link>
          <h1 className="text-2xl font-bold text-white">Service Catalog & Pricing</h1>
          <p className="text-xs text-slate-400">
            Define daily recurring products, cutoff deadlines, and container deposits.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
            Tenant: {tenantId}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Add New Service */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <h2 className="text-base font-bold text-white mb-3">Add Recurring Service</h2>

          {error && (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-2.5 rounded-xl mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateService} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Service Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
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

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Service Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Daily North Indian Lunch"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Default Product</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Standard Thali"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Price (₹ INR)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={priceInRupees}
                  onChange={(e) => setPriceInRupees(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">WhatsApp Poll</label>
                <input
                  type="text"
                  value={pollTimeStr}
                  onChange={(e) => setPollTimeStr(e.target.value)}
                  placeholder="08:30"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hard Cutoff</label>
                <input
                  type="text"
                  value={cutoffTimeStr}
                  onChange={(e) => setCutoffTimeStr(e.target.value)}
                  placeholder="10:00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresAssetTracking}
                  onChange={(e) => setRequiresAssetTracking(e.target.checked)}
                  className="accent-emerald-500 rounded"
                />
                Track returnable containers (Tiffin / Jar)
              </label>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Late skip fee:</span>
                <span className="font-semibold text-white">{lateCancellationFeePercent}%</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md mt-1"
            >
              {submitting ? "Saving..." : "+ Save Service Offering"}
            </button>
          </form>
        </div>

        {/* Right List: Active Services */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Active Service Offerings</h2>
            <span className="text-xs text-slate-400">{services.length} configured</span>
          </div>

          {loading ? (
            <div className="text-xs text-slate-500 p-8 text-center">Loading service catalog...</div>
          ) : services.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-sm text-slate-400 mb-1">No services registered yet.</p>
              <p className="text-xs text-slate-600">
                Use the form on the left to create your first recurring offering.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/40 transition-colors rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                        {svc.category}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1.5">{svc.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        WhatsApp Poll: {svc.pollTimeStr} AM • Cutoff: {svc.cutoffTimeStr} AM
                      </p>
                    </div>
                    <div className="text-right">
                      {svc.products.map((p) => (
                        <div key={p.id} className="text-sm font-bold font-mono text-emerald-400">
                          ₹{(p.basePricePaise / 100).toFixed(0)}
                          <span className="text-[11px] font-normal text-slate-400"> / {p.unitType.toLowerCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {svc.requiresAssetTracking ? "📦 Container tracking ON" : "🚫 Single-use"}
                    </span>
                    <span className="text-emerald-400">● Active</span>
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
