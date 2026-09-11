"use client";

import React, { useState } from "react";
import { DeliveryRun, DeliveryStop } from "@/src/modules/delivery/delivery-schema";

export default function DriverDeliveryPortalPage() {
  const [activeSociety, setActiveSociety] = useState<string>("All");

  const [run, setRun] = useState<DeliveryRun>({
    id: "run_2026-09-12_lunch_drv_ramesh",
    tenantId: "ten_sharma_tiffin",
    driverId: "drv_ramesh",
    driverName: "Ramesh Kumar",
    date: new Date().toISOString().split("T")[0],
    shift: "LUNCH",
    totalStops: 4,
    completedStops: 1,
    skippedStops: 1,
    failedStops: 0,
    status: "IN_PROGRESS",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stops: [
      {
        id: "stop_1",
        fulfillmentId: "ful_01",
        tenantId: "ten_sharma_tiffin",
        customerId: "usr_amit",
        customerName: "Amit Shah",
        customerPhone: "+91 98765 43211",
        society: "Sobha Classic",
        tower: "Tower B",
        floor: 12,
        flat: "B-1201",
        serviceName: "Executive Veg Lunch",
        quantity: 1,
        status: "DELIVERED",
        dropPreference: "DOORSTEP",
        deliveredAt: "12:15 PM",
        assetCollected: 1,
        assetDelivered: 1,
      },
      {
        id: "stop_2",
        fulfillmentId: "ful_02",
        tenantId: "ten_sharma_tiffin",
        customerId: "usr_priya",
        customerName: "Priya Sundaram",
        customerPhone: "+91 98765 43210",
        society: "Sobha Classic",
        tower: "Tower B",
        floor: 4,
        flat: "B-402",
        serviceName: "Executive Veg Lunch",
        quantity: 1,
        status: "PENDING",
        dropPreference: "DOORSTEP",
        notes: "Leave dabba on wooden shoerack outside door",
      },
      {
        id: "stop_3",
        fulfillmentId: "ful_03",
        tenantId: "ten_sharma_tiffin",
        customerId: "usr_vikram",
        customerName: "Vikram Malhotra",
        customerPhone: "+91 98765 43216",
        society: "Sobha Classic",
        tower: "Tower A",
        floor: 3,
        flat: "A-301",
        serviceName: "Executive Veg Lunch",
        quantity: 1,
        status: "SKIPPED",
        dropPreference: "DOORSTEP",
        notes: "Customer skipped via WhatsApp before 10 AM",
      },
      {
        id: "stop_4",
        fulfillmentId: "ful_04",
        tenantId: "ten_sharma_tiffin",
        customerId: "usr_rahul",
        customerName: "Rahul Verma",
        customerPhone: "+91 98765 43212",
        society: "Purva Fairmont",
        tower: "Tower A",
        floor: 1,
        flat: "A-101",
        serviceName: "Executive Veg Lunch (x2)",
        quantity: 2,
        status: "PENDING",
        dropPreference: "HANDOVER",
        notes: "Ring bell twice, grandmother at home",
      },
    ],
  });

  const [selectedStopForFail, setSelectedStopForFail] = useState<DeliveryStop | null>(null);
  const [failReason, setFailReason] = useState<string>("Flat locked / No answer");

  const societies = ["All", ...Array.from(new Set(run.stops.map((s) => s.society)))];

  const handleDeliver = (stopId: string) => {
    setRun((prev) => {
      const updatedStops = prev.stops.map((s) =>
        s.id === stopId
          ? {
              ...s,
              status: "DELIVERED" as const,
              deliveredAt: "Just now",
              assetDelivered: 1,
              assetCollected: 1,
            }
          : s
      );
      const completed = updatedStops.filter((s) => s.status === "DELIVERED").length;
      return {
        ...prev,
        stops: updatedStops,
        completedStops: completed,
      };
    });
  };

  const handleConfirmFail = () => {
    if (!selectedStopForFail) return;
    setRun((prev) => {
      const updatedStops = prev.stops.map((s) =>
        s.id === selectedStopForFail.id
          ? {
              ...s,
              status: "FAILED" as const,
              failureReason: failReason,
            }
          : s
      );
      const failed = updatedStops.filter((s) => s.status === "FAILED").length;
      return {
        ...prev,
        stops: updatedStops,
        failedStops: failed,
      };
    });
    setSelectedStopForFail(null);
  };

  const filteredStops =
    activeSociety === "All"
      ? run.stops
      : run.stops.filter((s) => s.society === activeSociety);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 max-w-lg mx-auto px-4 pt-4">
      {/* Top Driver Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Live Run Sheet
              </span>
            </div>
            <h1 className="text-xl font-black text-white">{run.driverName}</h1>
            <p className="text-xs text-slate-400 font-mono">
              {run.shift} Shift • {run.date}
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-white font-mono">
              {run.completedStops}/{run.totalStops - run.skippedStops}
            </span>
            <span className="text-[10px] text-slate-400 block">Deliveries Done</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{
              width: `${
                ((run.completedStops + run.failedStops) /
                  Math.max(1, run.totalStops - run.skippedStops)) *
                100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Society Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {societies.map((soc) => (
          <button
            key={soc}
            onClick={() => setActiveSociety(soc)}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeSociety === soc
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            {soc}
          </button>
        ))}
      </div>

      {/* Stops Sequence (Elevator Order) */}
      <div className="space-y-3">
        {filteredStops.map((stop, index) => {
          const isSkipped = stop.status === "SKIPPED";
          const isDelivered = stop.status === "DELIVERED";
          const isFailed = stop.status === "FAILED";

          return (
            <div
              key={stop.id}
              className={`rounded-2xl p-4 border transition-all ${
                isSkipped
                  ? "bg-slate-900/30 border-slate-800/40 opacity-50"
                  : isDelivered
                  ? "bg-emerald-950/20 border-emerald-800/40"
                  : isFailed
                  ? "bg-rose-950/20 border-rose-800/40"
                  : "bg-slate-900 border-slate-800 shadow-md"
              }`}
            >
              {/* Header: Sequence, Flat & Tower */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <span className="text-base font-black text-white">{stop.flat}</span>
                    <span className="text-xs text-slate-400 ml-2 font-mono">
                      {stop.tower} (Floor {stop.floor})
                    </span>
                  </div>
                </div>

                <div>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      isDelivered
                        ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                        : isSkipped
                        ? "bg-slate-800 text-slate-400 border-slate-700 line-through"
                        : isFailed
                        ? "bg-rose-950 text-rose-300 border-rose-800"
                        : "bg-amber-950 text-amber-300 border-amber-800"
                    }`}
                  >
                    {stop.status}
                  </span>
                </div>
              </div>

              {/* Customer & Package Details */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">{stop.customerName}</span>
                  <a
                    href={`tel:${stop.customerPhone}`}
                    className="text-emerald-400 font-mono font-semibold"
                  >
                    📞 Call
                  </a>
                </div>
                <div className="text-xs text-slate-400">
                  <span className="text-white font-medium">{stop.serviceName}</span>
                  <span className="text-slate-500 font-mono ml-1">x{stop.quantity}</span>
                </div>
                {stop.notes && (
                  <p className="text-[11px] text-amber-300/90 bg-amber-950/40 p-2 rounded-lg border border-amber-900/50 mt-1">
                    📌 {stop.notes}
                  </p>
                )}
                {isDelivered && (
                  <p className="text-[11px] text-emerald-400 font-mono mt-1">
                    ✓ Delivered at {stop.deliveredAt} • 1 Dabba returned
                  </p>
                )}
                {isFailed && (
                  <p className="text-[11px] text-rose-400 font-mono mt-1">
                    ✕ Failed: {stop.failureReason}
                  </p>
                )}
              </div>

              {/* Big 1-Tap Action Controls (Only for PENDING stops) */}
              {!isSkipped && !isDelivered && !isFailed && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleDeliver(stop.id)}
                    className="col-span-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/20"
                  >
                    <span>✓</span> DELIVERED
                  </button>

                  <button
                    onClick={() => setSelectedStopForFail(stop)}
                    className="col-span-1 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 active:scale-95 text-slate-300 font-bold py-3 rounded-xl text-xs transition-all border border-slate-700 flex items-center justify-center"
                  >
                    ✕ FAILED
                  </button>
                </div>
              )}

              {isSkipped && (
                <div className="text-[11px] text-slate-500 italic mt-1 text-center bg-slate-950/40 py-1.5 rounded-lg border border-slate-900">
                  🚫 Order cancelled by customer before cutoff. Do not deliver.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Failed Modal */}
      {selectedStopForFail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-xs w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Why couldn&apos;t you deliver?</h3>
            <p className="text-xs text-slate-400">
              {selectedStopForFail.flat} ({selectedStopForFail.customerName})
            </p>

            <select
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none"
            >
              <option value="Flat locked / No answer">Flat locked / No answer</option>
              <option value="Customer phone unreachable">Customer phone unreachable</option>
              <option value="Gate security refused entry">Gate security refused entry</option>
              <option value="Wrong flat number / Address">Wrong flat number / Address</option>
            </select>

            <div className="space-y-2">
              <button
                onClick={handleConfirmFail}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
              >
                Confirm Delivery Failure
              </button>
              <button
                onClick={() => setSelectedStopForFail(null)}
                className="w-full bg-slate-800 text-slate-400 py-2 rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
