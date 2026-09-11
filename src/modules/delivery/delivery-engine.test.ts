import { describe, it, expect } from "bun:test";
import { DeliveryEngine } from "./delivery-engine";

describe("Delivery Operations & Driver Run Sheets", () => {
  it("generates a sequence-ordered run sheet clustered by society, tower, and elevator floor descending", () => {
    const run = DeliveryEngine.generateRunSheet({
      tenantId: "ten_sharma_tiffin",
      driverId: "drv_ramesh",
      driverName: "Ramesh Kumar",
      date: "2026-09-12",
      shift: "LUNCH",
      items: [
        {
          fulfillmentId: "ful_01",
          customerId: "usr_1",
          customerName: "Priya Sundaram",
          customerPhone: "+919876543210",
          society: "Sobha Classic",
          tower: "Tower B",
          floor: 4,
          flat: "B-402",
          serviceName: "Executive Veg Lunch",
          quantity: 1,
        },
        {
          fulfillmentId: "ful_02",
          customerId: "usr_2",
          customerName: "Amit Shah",
          customerPhone: "+919876543211",
          society: "Sobha Classic",
          tower: "Tower B",
          floor: 12,
          flat: "B-1201",
          serviceName: "Executive Veg Lunch",
          quantity: 1,
        },
        {
          fulfillmentId: "ful_03",
          customerId: "usr_3",
          customerName: "Rahul Verma",
          customerPhone: "+919876543212",
          society: "Purva Fairmont",
          tower: "Tower A",
          floor: 1,
          flat: "A-101",
          serviceName: "Executive Veg Lunch",
          quantity: 2,
        },
      ],
    });

    expect(run.totalStops).toBe(3);
    expect(run.status).toBe("NOT_STARTED");

    // Purva Fairmont comes before Sobha Classic alphabetically
    expect(run.stops[0].society).toBe("Purva Fairmont");
    expect(run.stops[0].flat).toBe("A-101");

    // For Sobha Classic Tower B, Floor 12 should come before Floor 4 (top-down elevator path)
    expect(run.stops[1].society).toBe("Sobha Classic");
    expect(run.stops[1].floor).toBe(12);
    expect(run.stops[1].flat).toBe("B-1201");

    expect(run.stops[2].society).toBe("Sobha Classic");
    expect(run.stops[2].floor).toBe(4);
    expect(run.stops[2].flat).toBe("B-402");
  });

  it("visually flags cancelled/skipped orders with SKIPPED status so drivers do not knock", () => {
    const run = DeliveryEngine.generateRunSheet({
      tenantId: "ten_sharma_tiffin",
      driverId: "drv_ramesh",
      driverName: "Ramesh Kumar",
      date: "2026-09-12",
      shift: "LUNCH",
      items: [
        {
          fulfillmentId: "ful_10",
          customerId: "usr_active",
          customerName: "Sunita Patel",
          customerPhone: "+919876543215",
          society: "Sobha Classic",
          tower: "Tower A",
          floor: 2,
          flat: "A-201",
          serviceName: "Executive Veg Lunch",
          quantity: 1,
          isSkipped: false,
        },
        {
          fulfillmentId: "ful_11",
          customerId: "usr_skipped",
          customerName: "Vikram Malhotra",
          customerPhone: "+919876543216",
          society: "Sobha Classic",
          tower: "Tower A",
          floor: 3,
          flat: "A-301",
          serviceName: "Executive Veg Lunch",
          quantity: 1,
          isSkipped: true, // Cutoff skip confirmed
        },
      ],
    });

    expect(run.totalStops).toBe(2);
    expect(run.skippedStops).toBe(1);

    const skippedStop = run.stops.find((s) => s.customerId === "usr_skipped");
    expect(skippedStop).toBeDefined();
    expect(skippedStop!.status).toBe("SKIPPED");

    // Attempting to deliver a skipped stop should throw error
    expect(
      DeliveryEngine.completeStop({
        runId: run.id,
        stopId: skippedStop!.id,
      })
    ).rejects.toThrow("Cannot mark a skipped stop as delivered");
  });

  it("completes delivery in 1 tap, tracking timestamps and container exchanges", async () => {
    const run = DeliveryEngine.generateRunSheet({
      tenantId: "ten_sharma_tiffin",
      driverId: "drv_ramesh",
      driverName: "Ramesh Kumar",
      date: "2026-09-12",
      shift: "LUNCH",
      items: [
        {
          fulfillmentId: "ful_20",
          customerId: "usr_20",
          customerName: "Kavita Rao",
          customerPhone: "+919876543220",
          society: "Sobha Classic",
          tower: "Tower C",
          floor: 5,
          flat: "C-501",
          serviceName: "Executive Veg Lunch",
          quantity: 1,
        },
      ],
    });

    const stopId = run.stops[0].id;
    const { run: updatedRun, stop: updatedStop } = await DeliveryEngine.completeStop({
      runId: run.id,
      stopId,
      assetCollected: 1, // Collected yesterday's empty dabba
      assetDelivered: 1, // Dropped today's warm meal
      notes: "Left at doorstep shoerack as requested",
    });

    expect(updatedStop.status).toBe("DELIVERED");
    expect(updatedStop.deliveredAt).toBeDefined();
    expect(updatedStop.assetCollected).toBe(1);
    expect(updatedStop.assetDelivered).toBe(1);

    expect(updatedRun.completedStops).toBe(1);
    expect(updatedRun.status).toBe("COMPLETED");
  });

  it("handles delivery failure with reason", () => {
    const run = DeliveryEngine.generateRunSheet({
      tenantId: "ten_sharma_tiffin",
      driverId: "drv_ramesh",
      driverName: "Ramesh Kumar",
      date: "2026-09-12",
      shift: "LUNCH",
      items: [
        {
          fulfillmentId: "ful_30",
          customerId: "usr_30",
          customerName: "Ananya Roy",
          customerPhone: "+919876543230",
          society: "Sobha Classic",
          tower: "Tower A",
          floor: 1,
          flat: "A-102",
          serviceName: "Executive Veg Lunch",
          quantity: 1,
        },
      ],
    });

    const stopId = run.stops[0].id;
    const { run: updatedRun, stop: updatedStop } = DeliveryEngine.failStop({
      runId: run.id,
      stopId,
      failureReason: "Flat locked and phone unreachable after 3 calls",
    });

    expect(updatedStop.status).toBe("FAILED");
    expect(updatedStop.failureReason).toBe("Flat locked and phone unreachable after 3 calls");
    expect(updatedRun.failedStops).toBe(1);
    expect(updatedRun.status).toBe("COMPLETED");
  });
});
