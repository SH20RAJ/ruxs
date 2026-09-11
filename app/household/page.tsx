"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Household, HouseholdMember } from "@/src/modules/households/household-schema";

export default function HouseholdPortalPage() {
  const [household, setHousehold] = useState<Household>({
    id: "hh_sobha_b402",
    name: "Sobha B-402 Flatmates",
    primaryOwnerId: "usr_priya",
    societyName: "Sobha Classic",
    towerWing: "Tower B",
    floor: "4",
    flatNumber: "B-402",
    city: "Bengaluru",
    createdAt: "2026-09-01T10:00:00Z",
    updatedAt: "2026-09-11T12:00:00Z",
    members: [
      {
        id: "hm_1",
        householdId: "hh_sobha_b402",
        userId: "usr_priya",
        name: "Priya Sundaram",
        phone: "+91 98765 43210",
        role: "PRIMARY_OWNER",
        canManageSubscriptions: true,
        canSkipDeliveries: true,
        joinedAt: "2026-09-01T10:00:00Z",
      },
      {
        id: "hm_2",
        householdId: "hh_sobha_b402",
        userId: "usr_ananya",
        name: "Ananya Deshmukh",
        phone: "+91 98765 43217",
        role: "MEMBER",
        canManageSubscriptions: false,
        canSkipDeliveries: true,
        joinedAt: "2026-09-02T14:30:00Z",
      },
      {
        id: "hm_3",
        householdId: "hh_sobha_b402",
        userId: "usr_sneha",
        name: "Sneha Reddy",
        phone: "+91 98765 43218",
        role: "MEMBER",
        canManageSubscriptions: false,
        canSkipDeliveries: true,
        joinedAt: "2026-09-05T09:15:00Z",
      },
    ],
  });

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [sharedServiceSkipped, setSharedServiceSkipped] = useState(false);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberPhone) return;

    const newMember: HouseholdMember = {
      id: `hm_${Date.now()}`,
      householdId: household.id,
      userId: `usr_${Date.now()}`,
      name: newMemberName,
      phone: newMemberPhone.startsWith("+91") ? newMemberPhone : `+91 ${newMemberPhone}`,
      role: "MEMBER",
      canManageSubscriptions: false,
      canSkipDeliveries: true,
      joinedAt: new Date().toISOString(),
    };

    setHousehold((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));

    setNewMemberName("");
    setNewMemberPhone("");
    setInviteModalOpen(false);
  };

  const handleRemoveMember = (userId: string) => {
    setHousehold((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.userId !== userId),
    }));
  };

  return (
    <div className="min-h-screen py-6 px-4 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-md">
              Shared Domestic Account
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {household.societyName}, {household.towerWing} - {household.flatNumber}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">{household.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Primary Owner & Billing Liable:{" "}
            <span className="text-white font-semibold">Priya Sundaram</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/customer/dashboard"
            className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition-all"
          >
            &larr; My Personal Portal
          </Link>
          <button
            onClick={() => setInviteModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10"
          >
            + Invite Flatmate
          </button>
        </div>
      </div>

      {/* Shared Services Card with Delegated 1-Tap Skip */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase text-emerald-400">
                Shared Domestic Services
              </span>
              <span className="text-xs text-slate-500">• Visible to all 3 flatmates</span>
            </div>
            <h2 className="text-lg font-bold text-white">Daily Shared Water & Milk</h2>
          </div>

          <button
            onClick={() => setSharedServiceSkipped(!sharedServiceSkipped)}
            className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
              sharedServiceSkipped
                ? "bg-rose-950 text-rose-300 border-rose-800"
                : "bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border-slate-700"
            }`}
          >
            {sharedServiceSkipped
              ? "🚫 Water & Milk Skipped for Tomorrow"
              : "✈️ All Flatmates Away? Skip Tomorrow"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-white">Bisleri 20L Water Jar</p>
              <span className="text-[11px] text-slate-400">Alternate Days • Doorstep delivery</span>
              <p className="text-[10px] text-emerald-400 mt-1">● Current dabba balance: 1 jar held</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
              ₹90 / jar
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-white">Nandini Pure Toned Milk</p>
              <span className="text-[11px] text-slate-400">Daily 6:30 AM • 2 Packets (1 Liter)</span>
              <p className="text-[10px] text-emerald-400 mt-1">● Delivered to doorstep bag</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
              ₹48 / day
            </span>
          </div>
        </div>
      </div>

      {/* Household Roommates & Permissions List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-slate-300">
            👥 Household Flatmates & Permissions
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {household.members.length} Members
          </span>
        </div>

        <div className="space-y-3">
          {household.members.map((member) => (
            <div
              key={member.id}
              className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{member.name}</span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      member.role === "PRIMARY_OWNER"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {member.role.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{member.phone}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  <span className="text-emerald-400 block font-medium">
                    ✓ Delegated 1-Tap Skip
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    {member.canManageSubscriptions ? "Subscription Admin" : "View-only billing"}
                  </span>
                </div>

                {member.role !== "PRIMARY_OWNER" && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="text-xs text-rose-400 hover:text-rose-300 border border-rose-950 bg-rose-950/20 hover:bg-rose-950/50 px-2.5 py-1 rounded-xl transition-all"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Invite Flatmate to Household</h3>
            <p className="text-xs text-slate-400">
              They will be able to see daily deliveries and tap Skip when away from home.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Flatmate Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Indian Mobile Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10"
                >
                  Send Invite Link
                </button>
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="w-full bg-slate-800 text-slate-400 py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
