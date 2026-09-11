import {
  CreateSubscriptionSchema,
  Subscription,
  SubscriptionCadenceEnum,
} from "./subscription-schema";
import { Paise } from "../../shared/types/money";
import { db, isTestEnv } from "../../shared/db";
import {
  subscriptions as subscriptionsTable,
  products as productsTable,
} from "../../shared/db/schema";
import { eq } from "drizzle-orm";

const subscriptionsStore = new Map<string, Subscription>();

export class SubscriptionEngine {
  /**
   * Creates a new recurring subscription
   */
  static async createSubscription(rawInput: unknown): Promise<Subscription> {
    const validated = CreateSubscriptionSchema.parse(rawInput);

    const subscriptionId = `sub_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date().toISOString();

    const subscription: Subscription = {
      id: subscriptionId,
      tenantId: validated.tenantId,
      customerId: validated.customerId,
      householdId: validated.householdId,
      productId: validated.productId,
      productName: validated.productName,
      unitPricePaise: validated.unitPricePaise as Paise,
      cadence: validated.cadence,
      selectedDays: validated.selectedDays,
      defaultQuantity: validated.defaultQuantity,
      autopilotDefault: validated.autopilotDefault,
      status: "ACTIVE",
      startDate: validated.startDate,
      endDate: validated.endDate,
      createdAt: now,
      updatedAt: now,
    };

    subscriptionsStore.set(subscriptionId, subscription);

    if (!isTestEnv) {
      try {
        await db.insert(subscriptionsTable).values({
          id: subscriptionId,
          tenantId: validated.tenantId,
          customerId: validated.customerId,
          householdId: validated.householdId || null,
          productId: validated.productId,
          cadence: validated.cadence,
          selectedDays: validated.selectedDays ? validated.selectedDays.join(",") : null,
          defaultQuantity: validated.defaultQuantity,
          autopilotDefault: validated.autopilotDefault,
          status: "ACTIVE",
          startDate: validated.startDate,
          endDate: validated.endDate || null,
        });
      } catch (err) {
        console.error("Failed to insert subscription into Neon DB:", err);
      }
    }

    return subscription;
  }

  /**
   * Evaluates whether a subscription is scheduled for delivery on a given date (YYYY-MM-DD)
   */
  static isScheduledOnDate(sub: Subscription, dateStr: string): boolean {
    if (sub.status !== "ACTIVE") {
      return false;
    }

    if (dateStr < sub.startDate) {
      return false;
    }

    if (sub.endDate && dateStr > sub.endDate) {
      return false;
    }

    const date = new Date(dateStr + "T00:00:00Z");
    // ISO Day of week: 1 = Monday, 7 = Sunday
    const dayOfWeek = date.getUTCDay() === 0 ? 7 : date.getUTCDay();

    switch (sub.cadence) {
      case "DAILY":
        return true;

      case "WEEKDAYS":
        return dayOfWeek >= 1 && dayOfWeek <= 5;

      case "SELECTED_DAYS":
        return !!sub.selectedDays?.includes(dayOfWeek);

      case "ALTERNATE_DAYS": {
        const start = new Date(sub.startDate + "T00:00:00Z");
        const diffDays = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays % 2 === 0;
      }

      default:
        return false;
    }
  }

  /**
   * Pause an active subscription
   */
  static async pauseSubscription(id: string): Promise<Subscription> {
    let sub = subscriptionsStore.get(id);
    if (!sub && !isTestEnv) {
      sub = (await this.getById(id)) || undefined;
    }
    if (!sub) throw new Error("Subscription not found");
    if (sub.status !== "ACTIVE") throw new Error(`Cannot pause subscription in ${sub.status} state`);

    sub.status = "PAUSED";
    sub.updatedAt = new Date().toISOString();
    subscriptionsStore.set(id, sub);

    if (!isTestEnv) {
      try {
        await db
          .update(subscriptionsTable)
          .set({ status: "PAUSED" })
          .where(eq(subscriptionsTable.id, id));
      } catch (err) {
        console.error("Failed to update subscription in Neon DB:", err);
      }
    }

    return sub;
  }

  /**
   * Resume a paused subscription
   */
  static async resumeSubscription(id: string): Promise<Subscription> {
    let sub = subscriptionsStore.get(id);
    if (!sub && !isTestEnv) {
      sub = (await this.getById(id)) || undefined;
    }
    if (!sub) throw new Error("Subscription not found");
    if (sub.status !== "PAUSED") throw new Error(`Cannot resume subscription in ${sub.status} state`);

    sub.status = "ACTIVE";
    sub.updatedAt = new Date().toISOString();
    subscriptionsStore.set(id, sub);

    if (!isTestEnv) {
      try {
        await db
          .update(subscriptionsTable)
          .set({ status: "ACTIVE" })
          .where(eq(subscriptionsTable.id, id));
      } catch (err) {
        console.error("Failed to update subscription in Neon DB:", err);
      }
    }

    return sub;
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(id: string): Promise<Subscription> {
    let sub = subscriptionsStore.get(id);
    if (!sub && !isTestEnv) {
      sub = (await this.getById(id)) || undefined;
    }
    if (!sub) throw new Error("Subscription not found");

    sub.status = "CANCELLED";
    sub.updatedAt = new Date().toISOString();
    subscriptionsStore.set(id, sub);

    if (!isTestEnv) {
      try {
        await db
          .update(subscriptionsTable)
          .set({ status: "CANCELLED" })
          .where(eq(subscriptionsTable.id, id));
      } catch (err) {
        console.error("Failed to update subscription in Neon DB:", err);
      }
    }

    return sub;
  }

  /**
   * Retrieve by ID
   */
  static async getById(id: string): Promise<Subscription | null> {
    const memory = subscriptionsStore.get(id);
    if (memory) return memory;

    if (!isTestEnv) {
      try {
        const rows = await db
          .select({
            sub: subscriptionsTable,
            productName: productsTable.name,
            productPrice: productsTable.basePricePaise,
          })
          .from(subscriptionsTable)
          .leftJoin(productsTable, eq(subscriptionsTable.productId, productsTable.id))
          .where(eq(subscriptionsTable.id, id));

        if (rows.length > 0) {
          const row = rows[0];
          return {
            id: row.sub.id,
            tenantId: row.sub.tenantId,
            customerId: row.sub.customerId,
            householdId: row.sub.householdId || undefined,
            productId: row.sub.productId,
            productName: row.productName || "Product",
            unitPricePaise: (row.productPrice || 0) as Paise,
            cadence: row.sub.cadence as any,
            selectedDays: row.sub.selectedDays ? row.sub.selectedDays.split(",").map(Number) : undefined,
            defaultQuantity: row.sub.defaultQuantity,
            autopilotDefault: row.sub.autopilotDefault as any,
            status: row.sub.status as any,
            startDate: row.sub.startDate,
            endDate: row.sub.endDate || undefined,
            createdAt: row.sub.createdAt ? row.sub.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: row.sub.createdAt ? row.sub.createdAt.toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.error("Failed to fetch subscription by ID from Neon DB:", err);
      }
    }

    return null;
  }

  /**
   * List subscriptions for a customer or tenant
   */
  static async listByCustomer(customerId: string): Promise<Subscription[]> {
    if (!isTestEnv) {
      try {
        const rows = await db
          .select({
            sub: subscriptionsTable,
            productName: productsTable.name,
            productPrice: productsTable.basePricePaise,
          })
          .from(subscriptionsTable)
          .leftJoin(productsTable, eq(subscriptionsTable.productId, productsTable.id))
          .where(eq(subscriptionsTable.customerId, customerId));

        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.sub.id,
            tenantId: r.sub.tenantId,
            customerId: r.sub.customerId,
            householdId: r.sub.householdId || undefined,
            productId: r.sub.productId,
            productName: r.productName || "Subscription Service",
            unitPricePaise: (r.productPrice || 0) as Paise,
            cadence: r.sub.cadence as any,
            selectedDays: r.sub.selectedDays ? r.sub.selectedDays.split(",").map(Number) : undefined,
            defaultQuantity: r.sub.defaultQuantity,
            autopilotDefault: r.sub.autopilotDefault as any,
            status: r.sub.status as any,
            startDate: r.sub.startDate,
            endDate: r.sub.endDate || undefined,
            createdAt: r.sub.createdAt ? r.sub.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: r.sub.createdAt ? r.sub.createdAt.toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.error("Failed to list subscriptions for customer from Neon DB:", err);
      }
    }

    return Array.from(subscriptionsStore.values()).filter((s) => s.customerId === customerId);
  }

  static async listByTenant(tenantId: string): Promise<Subscription[]> {
    if (!isTestEnv) {
      try {
        const rows = await db
          .select({
            sub: subscriptionsTable,
            productName: productsTable.name,
            productPrice: productsTable.basePricePaise,
          })
          .from(subscriptionsTable)
          .leftJoin(productsTable, eq(subscriptionsTable.productId, productsTable.id))
          .where(eq(subscriptionsTable.tenantId, tenantId));

        if (rows.length > 0) {
          return rows.map((r) => ({
            id: r.sub.id,
            tenantId: r.sub.tenantId,
            customerId: r.sub.customerId,
            householdId: r.sub.householdId || undefined,
            productId: r.sub.productId,
            productName: r.productName || "Subscription Service",
            unitPricePaise: (r.productPrice || 0) as Paise,
            cadence: r.sub.cadence as any,
            selectedDays: r.sub.selectedDays ? r.sub.selectedDays.split(",").map(Number) : undefined,
            defaultQuantity: r.sub.defaultQuantity,
            autopilotDefault: r.sub.autopilotDefault as any,
            status: r.sub.status as any,
            startDate: r.sub.startDate,
            endDate: r.sub.endDate || undefined,
            createdAt: r.sub.createdAt ? r.sub.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: r.sub.createdAt ? r.sub.createdAt.toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.error("Failed to list subscriptions for tenant from Neon DB:", err);
      }
    }

    return Array.from(subscriptionsStore.values()).filter((s) => s.tenantId === tenantId);
  }

  static clearStore(): void {
    subscriptionsStore.clear();
  }
}

