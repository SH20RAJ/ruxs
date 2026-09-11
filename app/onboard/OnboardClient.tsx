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

export default function OnboardClient() {
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
        <Link href="/" className="text-xs text-primary hover:underline flex items-center gap-1 mb-3">
          ← Back to RUXS Home
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-full">
          Household Profile Setup
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold mt-2 text-foreground">Everyday Services on Autopilot</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Set up your doorstep delivery address once. Manage all tiffin, milk, water, and dhobi seamlessly.
        </p>
      </div>

      {createdCustomer ? (
        <div className="bg-card border border-primary/40 rounded-2xl p-6 shadow-xl text-card-foreground">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Welcome, {createdCustomer.fullName}!</h2>
              <p className="text-xs text-muted-foreground">Household ID: {createdCustomer.householdId}</p>
            </div>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-4 mb-5 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Doorstep Drop:</span>
              <span className="text-foreground font-medium">
                {createdCustomer.societyName}, Flat {createdCustomer.flatNumber}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Drop Instruction:</span>
              <span className="text-foreground font-medium uppercase">
                {createdCustomer.deliveryDropPreference.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Registered Phone:</span>
              <span className="text-foreground font-mono">{createdCustomer.phone}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/subscribe"
              className="block w-full text-center bg-primary hover:opacity-90 text-primary-foreground font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg"
            >
              Browse Local Services & Subscribe →
            </Link>
            <Link
              href="/customer/dashboard"
              className="block w-full text-center border border-border hover:bg-muted text-foreground font-semibold py-3 rounded-xl text-xs transition-all"
            >
              Go to Domestic Command Center
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl text-card-foreground"
        >
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-xs">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
              1. Resident Details
            </h2>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sundaram"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Indian Mobile Number
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="whatsapp"
                checked={whatsappOptIn}
                onChange={(e) => setWhatsappOptIn(e.target.checked)}
                className="rounded accent-primary"
              />
              <label htmlFor="whatsapp" className="text-xs text-muted-foreground">
                Receive morning 2-tap delivery polls on WhatsApp
              </label>
            </div>
          </div>

          <div className="border-t border-border pt-5 space-y-4">
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
              2. Domestic Address (Apartment Hierarchy)
            </h2>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Gated Society / Layout Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sobha Classic, Bellandur"
                value={societyName}
                onChange={(e) => setSocietyName(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Tower / Wing
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tower B"
                  value={towerWing}
                  onChange={(e) => setTowerWing(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Floor
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Flat Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B-402"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-5 space-y-4">
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
              3. Delivery Drop Preference
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "DOOR_BAG", label: "Door Bag / Shoe Rack" },
                { id: "SECURITY_GATE", label: "Security Gate" },
                { id: "RING_BELL", label: "Ring Bell & Handover" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setDropPreference(opt.id as any)}
                  className={`p-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    dropPreference === opt.id
                      ? "bg-primary text-primary-foreground border-primary shadow"
                      : "bg-background text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Leave tiffin on right wooden hook"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg disabled:opacity-50 mt-4"
          >
            {loading ? "Registering Household..." : "Complete Setup & Start Autopilot ✓"}
          </button>
        </form>
      )}
    </div>
  );
}
