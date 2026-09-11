"use client";

import React, { useState } from "react";
import Link from "next/link";

interface CustomerCreatedState {
  userId: string;
  fullName: string;
  phone: string;
  householdId: string;
  societyName: string;
  flatNumber: string;
  deliveryDropPreference: string;
}

export default function CustomerOnboardPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [societyName, setSocietyName] = useState("");
  const [towerWing, setTowerWing] = useState("");
  const [floor, setFloor] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [dropPreference, setDropPreference] = useState<"DOOR_BAG" | "SECURITY_GATE" | "RING_BELL">("DOOR_BAG");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCustomer, setCreatedCustomer] = useState<CustomerCreatedState | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/customer/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          whatsappOptIn,
          societyName,
          towerWing,
          floor,
          flatNumber,
          deliveryDropPreference: dropPreference,
          deliveryNotes,
        }),
      });

      const data = (await res.json()) as { success: boolean; data?: CustomerCreatedState; error?: { message: string } };
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to complete setup");
      }

      setCreatedCustomer(data.data!);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to onboard customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 max-w-xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 mb-3">
          ← Back to RUXS Home
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
          Household Profile Setup
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold mt-2 text-white">Everyday Services on Autopilot</h1>
        <p className="text-sm text-slate-400 mt-1">
          Set up your doorstep delivery address once. Manage all tiffin, milk, water, and dhobi seamlessly.
        </p>
      </div>

      {createdCustomer ? (
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Welcome, {createdCustomer.fullName}!</h2>
              <p className="text-xs text-slate-400">Household ID: {createdCustomer.householdId}</p>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-5 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Doorstep Drop:</span>
              <span className="text-white font-medium">
                {createdCustomer.societyName}, Flat {createdCustomer.flatNumber}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Drop Instruction:</span>
              <span className="text-emerald-400 capitalize">
                {createdCustomer.deliveryDropPreference.replace("_", " ").toLowerCase()}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">WhatsApp Daily Alerts:</span>
              <span className="text-emerald-400 font-medium">Active (8:30 AM Cutoff Prompts)</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/customer/dashboard"
              className="w-full text-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2.5 rounded-xl text-sm transition-all"
            >
              Open Customer Dashboard & Subscriptions →
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4"
        >
          {error && (
            <div className="bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Priya Sundaram"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-start gap-3">
            <input
              type="checkbox"
              id="whatsappOptIn"
              checked={whatsappOptIn}
              onChange={(e) => setWhatsappOptIn(e.target.checked)}
              className="mt-1 accent-emerald-500 rounded"
            />
            <label htmlFor="whatsappOptIn" className="text-xs text-slate-300 cursor-pointer">
              <span className="font-semibold text-white block">Enable WhatsApp 1-Tap Daily Polls</span>
              Receive a quick morning prompt (e.g., &quot;Delivering lunch today? Tap Skip or Confirm&quot;) before the vendor cutoff.
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Society / Apartment Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Sobha Classic or Purva Fairmont"
              value={societyName}
              onChange={(e) => setSocietyName(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tower / Wing *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Tower B"
                value={towerWing}
                onChange={(e) => setTowerWing(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Floor *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., 4"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Flat No. *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., 402"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Doorstep Delivery Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "DOOR_BAG", label: "Door Bag / Handle", icon: "🚪" },
                { id: "SECURITY_GATE", label: "Security Gate", icon: "🛡️" },
                { id: "RING_BELL", label: "Ring Bell", icon: "🔔" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDropPreference(item.id as any)}
                  className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                    dropPreference === item.id
                      ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="text-base mb-1">{item.icon}</div>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Delivery Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Leave in the red bag hanging on the door grill"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 mt-2"
          >
            {loading ? "Setting Up Address..." : "Save Address & Proceed →"}
          </button>
        </form>
      )}
    </div>
  );
}
