"use client";

import React, { useState } from "react";
import Link from "next/link";

interface VendorCreatedState {
  id: string;
  businessName: string;
  slug: string;
  phone: string;
  upiId: string;
  primaryCategory: string;
  inviteUrl: string;
  coveredSocieties: string[];
}

export default function VendorOnboardClient() {
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");
  const [category, setCategory] = useState("TIFFIN");
  const [locality, setLocality] = useState("");
  const [societyInput, setSocietyInput] = useState("");
  const [societies, setSocieties] = useState<string[]>(["Sobha Classic", "Purva Fairmont"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdVendor, setCreatedVendor] = useState<VendorCreatedState | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAddSociety = () => {
    const trimmed = societyInput.trim();
    if (trimmed && !societies.includes(trimmed)) {
      setSocieties([...societies, trimmed]);
      setSocietyInput("");
    }
  };

  const handleRemoveSociety = (name: string) => {
    setSocieties(societies.filter((s) => s !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/vendor/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          phone,
          upiId,
          primaryCategory: category,
          locality,
          city: "Bengaluru",
          coveredSocieties: societies,
        }),
      });

      const data = (await res.json()) as { success: boolean; data?: VendorCreatedState; error?: { message: string } };
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to onboard vendor");
      }

      setCreatedVendor(data.data!);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to onboard vendor");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (createdVendor) {
      navigator.clipboard.writeText(createdVendor.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-xs text-primary hover:underline flex items-center gap-1 mb-3">
          ← Back to RUXS Home
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-full">
          Vendor SaaS Registration
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold mt-2 text-foreground">Launch Your Operations on RUXS</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Automate daily fulfillment, cutoffs, WhatsApp morning polls, and monthly Khata payments for your society route.
        </p>
      </div>

      {createdVendor ? (
        <div className="bg-card border border-primary/40 rounded-2xl p-6 shadow-xl text-card-foreground">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Registration Complete!</h2>
              <p className="text-xs text-muted-foreground">Your business is live on RUXS operating system.</p>
            </div>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-4 mb-5 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Business:</span>
              <span className="text-foreground font-medium">{createdVendor.businessName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Category:</span>
              <span className="text-primary font-medium">{createdVendor.primaryCategory}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">UPI ID:</span>
              <span className="text-foreground font-mono">{createdVendor.upiId}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Societies Served:</span>
              <span className="text-foreground">{createdVendor.coveredSocieties.join(", ")}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Your Direct Society Customer Invite Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdVendor.inviteUrl}
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground font-mono outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="bg-primary hover:opacity-90 text-primary-foreground font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <Link
                href="/vendor/services"
                className="flex-1 text-center bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 rounded-xl text-xs transition-all shadow-md"
              >
                Configure Products & Cutoffs →
              </Link>
              <Link
                href="/vendor/dashboard"
                className="flex-1 text-center border border-border hover:bg-muted text-foreground font-semibold py-3 rounded-xl text-xs transition-all"
              >
                Kitchen Dashboard
              </Link>
            </div>
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
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Business / Kitchen / Depot Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sharma Tiffin Services, Annapurna Milk"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Primary Phone Number
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

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  UPI ID for Direct Payouts
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sharmatiffin@okaxis"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Service Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-ring"
                >
                  <option value="TIFFIN">🍱 Tiffin & Meals</option>
                  <option value="WATER">💧 20L Water Jars</option>
                  <option value="MILK">🥛 Milk & Dairy</option>
                  <option value="FLOWERS">🌸 Pooja Flowers</option>
                  <option value="NEWSPAPERS">📰 Newspapers</option>
                  <option value="LAUNDRY">🧺 Laundry & Dhobi</option>
                  <option value="CAR_CLEANING">🚗 Car & Bike Wash</option>
                  <option value="DRY_WASTE">📦 Scrap & Carton Collection</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Hub Locality / Base Area
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bellandur / HSR Layout"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Covered Societies / Apartment Layouts
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Type society name and press Add"
                  value={societyInput}
                  onChange={(e) => setSocietyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSociety();
                    }
                  }}
                  className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
                />
                <button
                  type="button"
                  onClick={handleAddSociety}
                  className="bg-muted hover:bg-muted/80 text-foreground border border-border font-semibold px-4 py-2 rounded-xl text-xs"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {societies.map((soc) => (
                  <span
                    key={soc}
                    className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary px-3 py-1 rounded-full text-xs"
                  >
                    {soc}
                    <button
                      type="button"
                      onClick={() => handleRemoveSociety(soc)}
                      className="hover:opacity-75 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg disabled:opacity-50 mt-4"
          >
            {loading ? "Registering Business..." : "Create Vendor Account & Get Invite Link ✓"}
          </button>
        </form>
      )}
    </div>
  );
}
