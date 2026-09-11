"use client";

import React, { useState, useEffect } from "react";
import { DeliveryRun, DeliveryStop } from "@/src/modules/delivery/delivery-schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DeliveryClient() {
  const [activeSociety, setActiveSociety] = useState<string>("All");
  const [run, setRun] = useState<DeliveryRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStopForFail, setSelectedStopForFail] = useState<DeliveryStop | null>(null);
  const [failReason, setFailReason] = useState<string>("Flat locked / No answer");

  const fetchRun = async () => {
    try {
      const res = await fetch("/api/delivery/run?runId=run_2026-09-12_lunch_drv_ramesh");
      const data = (await res.json()) as { success: boolean; data?: DeliveryRun };
      if (data.success && data.data) {
        setRun(data.data);
      }
    } catch (err) {
      console.error("Failed to load delivery run:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRun();
  }, []);

  if (loading || !run) {
    return (
      <div className="min-h-screen py-12 px-4 max-w-lg mx-auto flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-sm">Loading delivery run sheet from Neon database...</p>
      </div>
    );
  }

  const societies = ["All", ...Array.from(new Set(run.stops.map((s) => s.society)))];

  const handleDeliver = async (stopId: string) => {
    try {
      await fetch("/api/delivery/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: run.id,
          stopId,
          action: "DELIVER",
          assetCollected: 1,
          assetDelivered: 1,
        }),
      });
      await fetchRun();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmFail = async () => {
    if (!selectedStopForFail) return;
    try {
      await fetch("/api/delivery/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: run.id,
          stopId: selectedStopForFail.id,
          action: "FAIL",
          failureReason: failReason,
        }),
      });
      await fetchRun();
    } catch (err) {
      console.error(err);
    } finally {
      setSelectedStopForFail(null);
    }
  };

  const filteredStops =
    activeSociety === "All"
      ? run.stops
      : run.stops.filter((s) => s.society === activeSociety);

  return (
    <div className="min-h-screen pb-20 max-w-lg mx-auto px-4 pt-4 space-y-4">
      {/* Top Driver Bar */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider text-primary border-primary/40">
                  Live Run Sheet
                </Badge>
              </div>
              <h1 className="text-xl font-black text-foreground">{run.driverName}</h1>
              <p className="text-xs text-muted-foreground font-mono">
                {run.shift} Shift • {run.date}
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-foreground font-mono">
                {run.completedStops}/{run.totalStops - run.skippedStops}
              </span>
              <span className="text-[10px] text-muted-foreground block">Deliveries Done</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{
                width: `${
                  ((run.completedStops + run.failedStops) /
                    Math.max(1, run.totalStops - run.skippedStops)) *
                  100
                }%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Society Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {societies.map((soc) => (
          <Button
            key={soc}
            variant={activeSociety === soc ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSociety(soc)}
            className="text-xs font-bold rounded-xl whitespace-nowrap"
          >
            {soc}
          </Button>
        ))}
      </div>

      {/* Stops Sequence (Elevator Order) */}
      <div className="space-y-3">
        {filteredStops.map((stop, index) => {
          const isSkipped = stop.status === "SKIPPED";
          const isDelivered = stop.status === "DELIVERED";
          const isFailed = stop.status === "FAILED";

          return (
            <Card
              key={stop.id}
              className={`border transition-colors ${
                isSkipped
                  ? "bg-muted/20 border-border opacity-50"
                  : isDelivered
                  ? "bg-primary/5 border-primary/40"
                  : isFailed
                  ? "bg-destructive/5 border-destructive/40"
                  : "bg-card border-border shadow-sm"
              }`}
            >
              <CardContent className="p-4">
                {/* Header: Sequence, Flat & Tower */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-mono font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-base font-black text-foreground">{stop.flat}</span>
                      <span className="text-xs text-muted-foreground ml-2 font-mono">
                        {stop.tower} (Floor {stop.floor})
                      </span>
                    </div>
                  </div>

                  <div>
                    <Badge
                      variant={
                        isDelivered
                          ? "default"
                          : isSkipped
                          ? "outline"
                          : isFailed
                          ? "destructive"
                          : "secondary"
                      }
                      className={`text-[10px] font-black uppercase ${isSkipped ? "line-through text-muted-foreground" : ""}`}
                    >
                      {stop.status}
                    </Badge>
                  </div>
                </div>

                {/* Customer & Package Details */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground font-semibold">{stop.customerName}</span>
                    <a
                      href={`tel:${stop.customerPhone}`}
                      className="text-primary font-mono font-semibold hover:underline"
                    >
                      📞 Call
                    </a>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">{stop.serviceName}</span>
                    <span className="text-muted-foreground font-mono ml-1">x{stop.quantity}</span>
                  </div>
                  {stop.notes && (
                    <p className="text-[11px] text-secondary-foreground bg-secondary/20 p-2 rounded-lg border border-secondary/40 mt-1">
                      📌 {stop.notes}
                    </p>
                  )}
                  {isDelivered && (
                    <p className="text-[11px] text-primary font-mono mt-1">
                      ✓ Delivered at {stop.deliveredAt} • 1 Dabba returned
                    </p>
                  )}
                  {isFailed && (
                    <p className="text-[11px] text-destructive font-mono mt-1">
                      ✕ Failed: {stop.failureReason}
                    </p>
                  )}
                </div>

                {/* Big 1-Tap Action Controls (Only for PENDING stops) */}
                {!isSkipped && !isDelivered && !isFailed && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                    <Button
                      onClick={() => handleDeliver(stop.id)}
                      className="col-span-2 font-black text-sm"
                    >
                      ✓ DELIVERED
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setSelectedStopForFail(stop)}
                      className="col-span-1 text-xs font-bold hover:text-destructive hover:border-destructive/50"
                    >
                      ✕ FAILED
                    </Button>
                  </div>
                )}

                {isSkipped && (
                  <div className="text-[11px] text-muted-foreground italic mt-1 text-center bg-muted/40 py-1.5 rounded-lg border border-border">
                    🚫 Order cancelled by customer before cutoff. Do not deliver.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Failed Modal */}
      {selectedStopForFail && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-xs w-full shadow-2xl border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Why couldn&apos;t you deliver?</CardTitle>
              <p className="text-xs text-muted-foreground">
                {selectedStopForFail.flat} ({selectedStopForFail.customerName})
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <select
                value={failReason}
                onChange={(e) => setFailReason(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="Flat locked / No answer">Flat locked / No answer</option>
                <option value="Customer phone unreachable">Customer phone unreachable</option>
                <option value="Gate security refused entry">Gate security refused entry</option>
                <option value="Wrong flat number / Address">Wrong flat number / Address</option>
              </select>

              <div className="space-y-2">
                <Button
                  variant="destructive"
                  onClick={handleConfirmFail}
                  className="w-full text-xs font-bold"
                >
                  Confirm Delivery Failure
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedStopForFail(null)}
                  className="w-full text-xs"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
