"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Household, HouseholdMember } from "@/src/modules/households/household-schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function HouseholdClient() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [sharedServiceSkipped, setSharedServiceSkipped] = useState(false);

  const fetchHousehold = async () => {
    try {
      const res = await fetch("/api/households?householdId=hh_sobha_b402");
      const data = (await res.json()) as { success: boolean; data?: Household };
      if (data.success && data.data) {
        setHousehold(data.data);
      }
    } catch (err) {
      console.error("Failed to load household:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHousehold();
  }, []);

  if (loading || !household) {
    return (
      <div className="min-h-screen py-12 px-4 max-w-4xl mx-auto flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-sm">Loading household account from Neon database...</p>
      </div>
    );
  }

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberPhone || !household) return;

    try {
      await fetch("/api/households/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdId: household.id,
          invitedByUserId: household.primaryOwnerId,
          name: newMemberName,
          phone: newMemberPhone.startsWith("+91") ? newMemberPhone : `+91 ${newMemberPhone}`,
          role: "MEMBER",
          canManageSubscriptions: false,
          canSkipDeliveries: true,
        }),
      });
      await fetchHousehold();
    } catch (err) {
      console.error(err);
    } finally {
      setNewMemberName("");
      setNewMemberPhone("");
      setInviteModalOpen(false);
    }
  };

  const handleRemoveMember = (userId: string) => {
    setHousehold((prev) =>
      prev ? { ...prev, members: prev.members.filter((m) => m.userId !== userId) } : prev
    );
  };

  return (
    <div className="min-h-screen py-6 px-4 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider text-primary border-primary/40">
                Shared Domestic Account
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {household.societyName}, {household.towerWing} - {household.flatNumber}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{household.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Primary Owner & Billing Liable:{" "}
              <span className="text-foreground font-semibold">Priya Sundaram</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/customer/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
              &larr; Personal Portal
            </Link>
            <Button
              size="sm"
              onClick={() => setInviteModalOpen(true)}
              className="font-bold shadow-md"
            >
              + Invite Flatmate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shared Services Card with Delegated 1-Tap Skip */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase text-primary">
                  Shared Domestic Services
                </span>
                <span className="text-xs text-muted-foreground">• Visible to all 3 flatmates</span>
              </div>
              <CardTitle className="text-lg font-bold">Daily Shared Water & Milk</CardTitle>
            </div>

            <Button
              variant={sharedServiceSkipped ? "destructive" : "outline"}
              size="sm"
              onClick={() => setSharedServiceSkipped(!sharedServiceSkipped)}
              className="text-xs font-bold"
            >
              {sharedServiceSkipped
                ? "🚫 Water & Milk Skipped for Tomorrow"
                : "✈️ All Flatmates Away? Skip Tomorrow"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0">
          <div className="bg-muted/30 border border-border rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-foreground">Bisleri 20L Water Jar</p>
              <span className="text-[11px] text-muted-foreground">Alternate Days • Doorstep delivery</span>
              <p className="text-[10px] text-primary mt-1">● Current dabba balance: 1 jar held</p>
            </div>
            <Badge variant="outline" className="text-xs font-mono font-bold text-primary border-primary/40">
              ₹90 / jar
            </Badge>
          </div>

          <div className="bg-muted/30 border border-border rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-foreground">Nandini Pure Toned Milk</p>
              <span className="text-[11px] text-muted-foreground">Daily 6:30 AM • 2 Packets (1 Liter)</span>
              <p className="text-[10px] text-primary mt-1">● Delivered to doorstep bag</p>
            </div>
            <Badge variant="outline" className="text-xs font-mono font-bold text-primary border-primary/40">
              ₹48 / day
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Household Roommates & Permissions List */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold uppercase tracking-wider text-muted-foreground">
              👥 Household Flatmates & Permissions
            </CardTitle>
            <Badge variant="secondary" className="text-xs font-mono">
              {household.members.length} Members
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {household.members.map((member) => (
            <div
              key={member.id}
              className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-sm">{member.name}</span>
                  <Badge
                    variant={member.role === "PRIMARY_OWNER" ? "default" : "secondary"}
                    className="text-[10px] font-black uppercase"
                  >
                    {member.role.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{member.phone}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  <span className="text-primary block font-medium">
                    ✓ Delegated 1-Tap Skip
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    {member.canManageSubscriptions ? "Subscription Admin" : "View-only billing"}
                  </span>
                </div>

                {member.role !== "PRIMARY_OWNER" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.userId)}
                    className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2.5"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-sm w-full shadow-2xl border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Invite Flatmate to Household</CardTitle>
              <p className="text-xs text-muted-foreground">
                They will be able to see daily deliveries and tap Skip when away from home.
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleInviteSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Flatmate Name</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Indian Mobile Number</Label>
                  <Input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <Button type="submit" className="w-full text-xs font-bold">
                    Send Invite Link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInviteModalOpen(false)}
                    className="w-full text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
