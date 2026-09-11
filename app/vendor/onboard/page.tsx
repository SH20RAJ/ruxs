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

export default function VendorOnboardPage() {
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

  const copyInviteLink = () => {
    if (createdVendor?.inviteUrl) {
      navigator.clipboard.writeText(createdVendor.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 max-w-xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 mb-3">
          ← Back to RUXS Home
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
          Vendor SaaS Setup
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold mt-2 text-white">Register Your Service Business</h1>
        <p className="text-sm text-slate-400 mt-1">
          Automate daily recurring orders, WhatsApp cutoffs, and digital Khata collections.
        </p>
      </div>

      {createdVendor ? (
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{createdVendor.businessName} is Live!</h2>
              <p className="text-xs text-slate-400">Portal ID: {createdVendor.id}</p>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-5">
            <label className="text-xs text-slate-400 font-medium block mb-1">
              Your Public Subscriber Invite Link:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={createdVendor.inviteUrl}
                className="bg-slate-900 text-emerald-300 text-xs font-mono p-2.5 rounded-lg border border-slate-700 flex-1 outline-none"
              />
              <button
                type="button"
                onClick={copyInviteLink}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3 py-2 rounded-lg text-xs transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Share this link or QR code on WhatsApp with your customers to onboard them in seconds.
            </p>
          </div>

          <div className="space-y-2 mb-6 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Receiving UPI ID:</span>
              <span className="font-mono text-emerald-400">{createdVendor.upiId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Delivery Societies:</span>
              <span>{createdVendor.coveredSocieties.join(", ")}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Category:</span>
              <span className="capitalize">{createdVendor.primaryCategory.toLowerCase()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/vendor/dashboard"
              className="w-full text-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2.5 rounded-xl text-sm transition-all"
            >
              Go to Live Vendor Kitchen Counter →
            </Link>
            <button
              type="button"
              onClick={() => setCreatedVendor(null)}
              className="text-xs text-slate-400 hover:text-slate-200 py-1"
            >
              Register another business
            </button>
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Business / Service Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Sharma Fresh Tiffin Services"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="TIFFIN">🍱 Tiffin / Meals</option>
                <option value="WATER">💧 Water Jars (20L)</option>
                <option value="MILK">🥛 Fresh Cow / Buffalo Milk</option>
                <option value="FLOWERS">🌸 Pooja Flowers</option>
                <option value="NEWSPAPER">📰 Newspapers & Magazines</option>
                <option value="LAUNDRY">🧺 Laundry & Dhobi</option>
                <option value="CAR_CLEANING">🚗 Daily Car Cleaning</option>
                <option value="WASTE_SCRAP">📦 Dry Waste & Scrap</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Receiving UPI ID *
              </label>
              <input
                type="text"
                required
                placeholder="merchant@okhdfcbank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Base Locality / Area *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., HSR Layout Sector 2"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Covered Societies / Apartment Complexes *
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Type apartment name and press Add"
                value={societyInput}
                onChange={(e) => setSocietyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSociety();
                  }
                }}
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddSociety}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-medium"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {societies.map((soc) => (
                <span
                  key={soc}
                  className="bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                >
                  {soc}
                  <button
                    type="button"
                    onClick={() => handleRemoveSociety(soc)}
                    className="text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 mt-2"
          >
            {loading ? "Creating Vendor Profile..." : "Complete Setup & Generate Portal →"}
          </button>
        </form>
      )}
    </div>
  );
}
