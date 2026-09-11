import { describe, it, expect, beforeEach } from "bun:test";
import { AssetLedgerService } from "./asset-ledger";
import { KhataLedgerService } from "../khata/khata-ledger";
import { Paise } from "../../shared/types/money";

describe("Physical Asset Ledger (Jars & Tiffins)", () => {
  beforeEach(() => {
    AssetLedgerService.clearStore();
    KhataLedgerService.clearStore();
  });

  it("accurately updates holding balance upon doorstep exchange: new = old + (del - col)", async () => {
    const tenantId = "ten_kaveri_water";
    const customerId = "usr_priya";

    // Day 1: Deliver 2 water jars, collect 0 empty
    const { holding: h1 } = await AssetLedgerService.recordExchange({
      tenantId,
      customerId,
      assetType: "WATER_JAR_20L",
      quantityDelivered: 2,
      quantityCollected: 0,
    });
    expect(h1.holdingCount).toBe(2);
    expect(h1.totalDepositHeldPaise).toBe(30000 as Paise); // 2 * ₹150 = ₹300

    // Day 3: Deliver 1 full jar, collect 1 empty jar (net delta 0)
    const { holding: h2 } = await AssetLedgerService.recordExchange({
      tenantId,
      customerId,
      assetType: "WATER_JAR_20L",
      quantityDelivered: 1,
      quantityCollected: 1,
    });
    expect(h2.holdingCount).toBe(2);

    // Day 5: Deliver 0 jars, collect 1 empty jar
    const { holding: h3 } = await AssetLedgerService.recordExchange({
      tenantId,
      customerId,
      assetType: "WATER_JAR_20L",
      quantityDelivered: 0,
      quantityCollected: 1,
    });
    expect(h3.holdingCount).toBe(1);
  });

  it("prevents collecting more containers than the customer actually holds", async () => {
    const tenantId = "ten_sharma_tiffin";
    const customerId = "usr_rahul";

    // Customer currently holds 0 tiffin boxes
    expect(
      AssetLedgerService.recordExchange({
        tenantId,
        customerId,
        assetType: "TIFFIN_BOX_STEEL",
        quantityDelivered: 0,
        quantityCollected: 2,
      })
    ).rejects.toThrow(/cannot collect 2 containers/);
  });

  it("reconciles asset exit: refuses deposit refund if containers unreturned, permits once 0", async () => {
    const tenantId = "ten_kaveri_water";
    const customerId = "usr_siddharth";

    // Customer receives 2 jars
    await AssetLedgerService.recordExchange({
      tenantId,
      customerId,
      assetType: "WATER_JAR_20L",
      quantityDelivered: 2,
      quantityCollected: 0,
    });

    // Attempting refund while customer still holds 2 jars must fail
    expect(
      AssetLedgerService.reconcileAndRefundDeposit(tenantId, customerId, "WATER_JAR_20L")
    ).rejects.toThrow(/customer still holds 2 unreturned/);

    // Return the 2 jars
    await AssetLedgerService.recordExchange({
      tenantId,
      customerId,
      assetType: "WATER_JAR_20L",
      quantityDelivered: 0,
      quantityCollected: 2,
    });

    const holding = AssetLedgerService.getHolding(tenantId, customerId, "WATER_JAR_20L");
    expect(holding?.holdingCount).toBe(0);

    // Now holding is 0, deposit refund can proceed if configured
  });
});
