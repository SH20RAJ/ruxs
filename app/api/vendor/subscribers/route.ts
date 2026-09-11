import { db, isTestEnv } from "@/src/shared/db";
import {
  subscriptions,
  users,
  products,
  households,
  dailyFulfillments,
  khataEntries,
} from "@/src/shared/db/schema";
import { eq, and } from "drizzle-orm";
import { createSuccessResponse, createErrorResponse } from "@/src/shared/errors";
import { SubscriptionEngine } from "@/src/modules/subscriptions/subscription-engine";
import { KhataLedgerService } from "@/src/modules/khata/khata-ledger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId") || "ten_sharma_tiffin";
    const todayStr = searchParams.get("date") || new Date().toISOString().split("T")[0];

    if (!isTestEnv) {
      // Query active subscriptions joined with customer, product, and household
      const subRows = await db
        .select({
          sub: subscriptions,
          user: users,
          product: products,
          household: households,
        })
        .from(subscriptions)
        .leftJoin(users, eq(subscriptions.customerId, users.id))
        .leftJoin(products, eq(subscriptions.productId, products.id))
        .leftJoin(households, eq(subscriptions.householdId, households.id))
        .where(eq(subscriptions.tenantId, tenantId));

      // Query today's fulfillments to get current live status
      const fulRows = await db
        .select()
        .from(dailyFulfillments)
        .where(
          and(
            eq(dailyFulfillments.tenantId, tenantId),
            eq(dailyFulfillments.serviceDate, todayStr)
          )
        );

      const fulMap = new Map<string, string>();
      for (const f of fulRows) {
        fulMap.set(f.customerId, f.status);
      }

      // Query khata balances
      const khataRows = await db
        .select({
          customerId: khataEntries.customerId,
          amountPaise: khataEntries.amountPaise,
          direction: khataEntries.direction,
        })
        .from(khataEntries)
        .where(eq(khataEntries.tenantId, tenantId));

      const balanceMap = new Map<string, number>();
      for (const k of khataRows) {
        const cur = balanceMap.get(k.customerId) || 0;
        const change = k.direction === "DEBIT" ? k.amountPaise : -k.amountPaise;
        balanceMap.set(k.customerId, cur + change);
      }

      const subscriberList = subRows.map((r) => {
        const custId = r.sub.customerId;
        const liveStatus = fulMap.get(custId) || r.sub.status;
        const balancePaise = balanceMap.get(custId) || 0;

        return {
          id: custId,
          subscriptionId: r.sub.id,
          name: r.user?.fullName || "Subscriber",
          phone: r.user?.phone || "",
          plan: r.product?.name || "Daily Service",
          flat: r.household
            ? `${r.household.societyName}, ${r.household.towerWing}-${r.household.flatNumber}`
            : "Bengaluru",
          balance: Math.round(balancePaise / 100),
          status: liveStatus,
        };
      });

      return Response.json(createSuccessResponse(subscriberList));
    }

    // In test environment fallback
    const subs = await SubscriptionEngine.listByTenant(tenantId);
    const testList = await Promise.all(
      subs.map(async (s) => {
        const stmt = await KhataLedgerService.getCustomerStatement(tenantId, s.customerId);
        return {
          id: s.customerId,
          subscriptionId: s.id,
          name: "Test Customer",
          phone: "+91 99999 00000",
          plan: s.productName,
          flat: "Flat 101",
          balance: Math.round(stmt.currentBalancePaise / 100),
          status: s.status,
        };
      })
    );

    return Response.json(createSuccessResponse(testList));
  } catch (err) {
    console.error("Failed to fetch vendor subscribers from DB:", err);
    return Response.json(
      createErrorResponse(
        "INTERNAL_SERVER_ERROR",
        err instanceof Error ? err.message : "Failed to fetch subscribers"
      ),
      { status: 500 }
    );
  }
}
