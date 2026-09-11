"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"CUSTOMER" | "VENDOR_ADMIN" | "DELIVERY_STAFF">("CUSTOMER");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = (await res.json()) as { success?: boolean; data?: { message?: string }; error?: { message?: string } };

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to request OTP");
      }

      setStep("OTP");
      setMessage(data.data?.message || "OTP sent successfully to your number.");
    } catch (err: any) {
      setError(err.message || "Failed to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp, role }),
      });

      const data = (await res.json()) as { success?: boolean; error?: { message?: string } };

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Invalid OTP code");
      }

      setMessage("Authenticated successfully! Redirecting...");
      setTimeout(() => {
        if (role === "VENDOR_ADMIN") {
          router.push("/vendor");
        } else {
          router.push("/");
        }
      }, 800);
    } catch (err: any) {
      setError(err.message || "Verification failed. Please check your code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20">
            R
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Sign In to RUXS
          </h1>
          <p className="text-xs text-slate-400">
            Passwordless mobile access to your household operations
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-black/40 p-1 border border-white/5 text-xs">
          <button
            type="button"
            onClick={() => setRole("CUSTOMER")}
            className={`rounded-lg py-2 font-semibold transition ${
              role === "CUSTOMER"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Household
          </button>
          <button
            type="button"
            onClick={() => setRole("VENDOR_ADMIN")}
            className={`rounded-lg py-2 font-semibold transition ${
              role === "VENDOR_ADMIN"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Vendor Hub
          </button>
          <button
            type="button"
            onClick={() => setRole("DELIVERY_STAFF")}
            className={`rounded-lg py-2 font-semibold transition ${
              role === "DELIVERY_STAFF"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Driver
          </button>
        </div>

        {/* Step 1: Request OTP Form */}
        {step === "PHONE" ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="phone-input" className="text-xs font-semibold text-slate-300">
                Indian Mobile Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm font-semibold text-slate-400">
                  +91
                </span>
                <input
                  id="phone-input"
                  type="tel"
                  required
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-3 pl-14 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || phone.trim().length < 10}
              className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? "Requesting OTP..." : "Continue with OTP →"}
            </button>
          </form>
        ) : (
          /* Step 2: Verify OTP Form */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="otp-input" className="font-semibold text-slate-300">
                  Enter 6-Digit OTP
                </label>
                <button
                  type="button"
                  onClick={() => setStep("PHONE")}
                  className="text-emerald-400 hover:underline"
                >
                  Change number
                </button>
              </div>

              <input
                id="otp-input"
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-3 px-4 text-center tracking-[0.4em] font-mono text-lg font-bold text-white placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {message && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-400">
                {error}
              </div>
            )}

            <div className="text-[11px] text-slate-500 text-center">
              💡 Development Tip: Use test code <strong className="text-emerald-400">123456</strong>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? "Verifying..." : "Verify & Sign In ✓"}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-slate-400">
          By continuing, you agree to the RUXS{" "}
          <Link href="/docs/security/privacy" className="text-emerald-400 hover:underline">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
