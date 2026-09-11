import { pgTable, varchar, integer, boolean, timestamp, text, index, uniqueIndex } from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// 1. Tenants (Local Vendor Businesses e.g., "Sharma Tiffin Services")
// ---------------------------------------------------------------------------
export const tenants = pgTable(
  "tenants",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    businessName: varchar("business_name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    phone: varchar("phone", { length: 20 }).notNull(),
    email: varchar("email", { length: 255 }),
    upiId: varchar("upi_id", { length: 100 }),
    fssaiNumber: varchar("fssai_number", { length: 50 }),
    planTier: varchar("plan_tier", { length: 20 }).default("STARTER").notNull(),
    address: text("address"),
    status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("tenants_slug_idx").on(table.slug),
    index("tenants_phone_idx").on(table.phone),
  ]
);

// ---------------------------------------------------------------------------
// 2. Users (Customers, Vendor Admins, Delivery Drivers, Platform Admins)
// ---------------------------------------------------------------------------
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).references(() => tenants.id),
    phone: varchar("phone", { length: 20 }).notNull().unique(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    role: varchar("role", { length: 30 }).default("CUSTOMER").notNull(),
    whatsappOptIn: boolean("whatsapp_opt_in").default(true).notNull(),
    status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_phone_idx").on(table.phone),
    index("users_tenant_role_idx").on(table.tenantId, table.role),
  ]
);

// ---------------------------------------------------------------------------
// 3. Households & Household Members
// ---------------------------------------------------------------------------
export const households = pgTable(
  "households",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    primaryOwnerId: varchar("primary_owner_id", { length: 36 }).references(() => users.id).notNull(),
    societyName: varchar("society_name", { length: 255 }).notNull(),
    towerWing: varchar("tower_wing", { length: 50 }).notNull(),
    floor: varchar("floor", { length: 20 }).notNull(),
    flatNumber: varchar("flat_number", { length: 50 }).notNull(),
    landmark: text("landmark"),
    city: varchar("city", { length: 100 }).default("Bengaluru").notNull(),
    pincode: varchar("pincode", { length: 10 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("households_society_tower_idx").on(table.societyName, table.towerWing),
  ]
);

export const householdMembers = pgTable(
  "household_members",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    householdId: varchar("household_id", { length: 36 }).references(() => households.id).notNull(),
    userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
    role: varchar("role", { length: 30 }).default("MEMBER").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("household_members_household_idx").on(table.householdId),
    index("household_members_user_idx").on(table.userId),
  ]
);

// ---------------------------------------------------------------------------
// 4. Services (Configurable Catalog: Tiffin, Milk, Water, etc.)
// ---------------------------------------------------------------------------
export const services = pgTable(
  "services",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).references(() => tenants.id).notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    cutoffTimeStr: varchar("cutoff_time_str", { length: 10 }).default("09:00").notNull(),
    lateCancellationFeePercent: integer("late_cancellation_fee_percent").default(50).notNull(),
    requiresAssetTracking: boolean("requires_asset_tracking").default(false).notNull(),
    allowsQuantityAdjustment: boolean("allows_quantity_adjustment").default(true).notNull(),
    allowsSkip: boolean("allows_skip").default(true).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("services_tenant_category_idx").on(table.tenantId, table.category),
  ]
);

// ---------------------------------------------------------------------------
// 5. Products (Sellable Units e.g., Standard North Indian Thali, 20L Jar)
// ---------------------------------------------------------------------------
export const products = pgTable(
  "products",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).references(() => tenants.id).notNull(),
    serviceId: varchar("service_id", { length: 36 }).references(() => services.id).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    unitType: varchar("unit_type", { length: 30 }).notNull(), // MEAL, LITER, JAR, etc.
    basePricePaise: integer("base_price_paise").notNull(), // Integer Paise
    isAddon: boolean("is_addon").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("products_tenant_service_idx").on(table.tenantId, table.serviceId),
  ]
);

// ---------------------------------------------------------------------------
// 6. Subscriptions (Recurring contracts)
// ---------------------------------------------------------------------------
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).references(() => tenants.id).notNull(),
    customerId: varchar("customer_id", { length: 36 }).references(() => users.id).notNull(),
    householdId: varchar("household_id", { length: 36 }).references(() => households.id),
    productId: varchar("product_id", { length: 36 }).references(() => products.id).notNull(),
    cadence: varchar("cadence", { length: 30 }).default("DAILY").notNull(), // DAILY, WEEKDAYS, ALTERNATE_DAYS, CUSTOM
    selectedDays: text("selected_days"), // Comma-separated ISO weekday numbers "1,2,3,4,5"
    defaultQuantity: integer("default_quantity").default(1).notNull(),
    autopilotDefault: varchar("autopilot_default", { length: 20 }).default("CONFIRMED").notNull(),
    status: varchar("status", { length: 20 }).default("ACTIVE").notNull(), // ACTIVE, PAUSED, CANCELLED
    startDate: varchar("start_date", { length: 10 }).notNull(), // YYYY-MM-DD
    endDate: varchar("end_date", { length: 10 }), // YYYY-MM-DD (null for perpetual)
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("subscriptions_tenant_customer_idx").on(table.tenantId, table.customerId),
    index("subscriptions_status_idx").on(table.status),
  ]
);

// ---------------------------------------------------------------------------
// 7. Daily Fulfillments (Generated daily per subscription)
// ---------------------------------------------------------------------------
export const dailyFulfillments = pgTable(
  "daily_fulfillments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).references(() => tenants.id).notNull(),
    subscriptionId: varchar("subscription_id", { length: 36 }).references(() => subscriptions.id).notNull(),
    customerId: varchar("customer_id", { length: 36 }).references(() => users.id).notNull(),
    householdId: varchar("household_id", { length: 36 }).references(() => households.id),
    serviceDate: varchar("service_date", { length: 10 }).notNull(), // YYYY-MM-DD
    shift: varchar("shift", { length: 20 }).default("MORNING").notNull(),
    quantity: integer("quantity").default(1).notNull(),
    unitPricePaise: integer("unit_price_paise").notNull(),
    totalPricePaise: integer("total_price_paise").notNull(),
    status: varchar("status", { length: 30 }).default("SCHEDULED").notNull(), // SCHEDULED, CONFIRMED, OUT_FOR_DELIVERY, DELIVERED, SKIPPED, LATE_CANCELLATION, FAILED
    cutoffTime: timestamp("cutoff_time", { withTimezone: true }),
    actionTakenAt: timestamp("action_taken_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("fulfillments_sub_date_shift_idx").on(table.subscriptionId, table.serviceDate, table.shift),
    index("fulfillments_tenant_date_idx").on(table.tenantId, table.serviceDate),
    index("fulfillments_customer_date_idx").on(table.customerId, table.serviceDate),
  ]
);

// ---------------------------------------------------------------------------
// 8. Digital Khata Entries (Strictly Append-Only Financial Ledger)
// ---------------------------------------------------------------------------
export const khataEntries = pgTable(
  "khata_entries",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).references(() => tenants.id).notNull(),
    customerId: varchar("customer_id", { length: 36 }).references(() => users.id).notNull(),
    householdId: varchar("household_id", { length: 36 }).references(() => households.id),
    entryType: varchar("entry_type", { length: 30 }).notNull(), // FULFILLMENT_CHARGE, LATE_FEE, PAYMENT, DISCOUNT, ASSET_DEPOSIT, REFUND
    direction: varchar("direction", { length: 10 }).notNull(), // DEBIT, CREDIT
    amountPaise: integer("amount_paise").notNull(), // Strictly positive integer Paise
    runningBalancePaise: integer("running_balance_paise").notNull(), // Signed integer Paise (>0 = customer owes)
    referenceType: varchar("reference_type", { length: 30 }), // FULFILLMENT, PAYMENT, ADJUSTMENT, DEPOSIT
    referenceId: varchar("reference_id", { length: 36 }),
    description: varchar("description", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("khata_tenant_customer_idx").on(table.tenantId, table.customerId),
    index("khata_created_at_idx").on(table.createdAt),
  ]
);

// ---------------------------------------------------------------------------
// 9. Invoices (Monthly / Periodic Billing Statements)
// ---------------------------------------------------------------------------
export const invoices = pgTable(
  "invoices",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).references(() => tenants.id).notNull(),
    customerId: varchar("customer_id", { length: 36 }).references(() => users.id).notNull(),
    householdId: varchar("household_id", { length: 36 }).references(() => households.id),
    invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
    periodStart: varchar("period_start", { length: 10 }).notNull(),
    periodEnd: varchar("period_end", { length: 10 }).notNull(),
    dueDate: varchar("due_date", { length: 10 }).notNull(),
    subtotalPaise: integer("subtotal_paise").notNull(),
    discountPaise: integer("discount_paise").default(0).notNull(),
    taxPaise: integer("tax_paise").default(0).notNull(),
    totalAmountDuePaise: integer("total_amount_due_paise").notNull(),
    amountPaidPaise: integer("amount_paid_paise").default(0).notNull(),
    status: varchar("status", { length: 20 }).default("ISSUED").notNull(), // DRAFT, ISSUED, PARTIALLY_PAID, PAID, VOID
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("invoices_number_idx").on(table.invoiceNumber),
    index("invoices_tenant_customer_idx").on(table.tenantId, table.customerId),
  ]
);

// ---------------------------------------------------------------------------
// 10. Payments (Idempotent UPI and Multi-rail transactions)
// ---------------------------------------------------------------------------
export const payments = pgTable(
  "payments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).references(() => tenants.id).notNull(),
    customerId: varchar("customer_id", { length: 36 }).references(() => users.id).notNull(),
    invoiceId: varchar("invoice_id", { length: 36 }).references(() => invoices.id),
    amountPaise: integer("amount_paise").notNull(),
    method: varchar("method", { length: 30 }).default("UPI_INTENT").notNull(), // UPI_INTENT, UPI_QR, CASH, NET_BANKING
    status: varchar("status", { length: 20 }).default("CREATED").notNull(), // CREATED, INITIATED, PENDING, SUCCESS, FAILED, REFUNDED
    gatewayOrderId: varchar("gateway_order_id", { length: 100 }),
    gatewayPaymentId: varchar("gateway_payment_id", { length: 100 }),
    bankUtr: varchar("bank_utr", { length: 100 }),
    khataEntryId: varchar("khata_entry_id", { length: 36 }),
    settledAt: timestamp("settled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("payments_tenant_customer_idx").on(table.tenantId, table.customerId),
    index("payments_gateway_order_idx").on(table.gatewayOrderId),
    index("payments_status_idx").on(table.status),
  ]
);

// ---------------------------------------------------------------------------
// 11. Asset Holdings & Movements (20L Cans, Tiffin Boxes, Crates)
// ---------------------------------------------------------------------------
export const assetHoldings = pgTable(
  "asset_holdings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).references(() => tenants.id).notNull(),
    customerId: varchar("customer_id", { length: 36 }).references(() => users.id).notNull(),
    assetType: varchar("asset_type", { length: 50 }).notNull(),
    holdingCount: integer("holding_count").default(0).notNull(),
    depositPerUnitPaise: integer("deposit_per_unit_paise").default(0).notNull(),
    totalDepositHeldPaise: integer("total_deposit_held_paise").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("asset_holdings_tenant_cust_idx").on(table.tenantId, table.customerId),
  ]
);

export const assetMovements = pgTable(
  "asset_movements",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).references(() => tenants.id).notNull(),
    customerId: varchar("customer_id", { length: 36 }).references(() => users.id).notNull(),
    assetType: varchar("asset_type", { length: 50 }).notNull(),
    quantityDelivered: integer("quantity_delivered").default(0).notNull(),
    quantityCollected: integer("quantity_collected").default(0).notNull(),
    netDelta: integer("net_delta").notNull(),
    resultingHoldingCount: integer("resulting_holding_count").notNull(),
    fulfillmentId: varchar("fulfillment_id", { length: 36 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("asset_movements_tenant_cust_idx").on(table.tenantId, table.customerId),
  ]
);

// ---------------------------------------------------------------------------
// 12. Vacation Mode Schedules
// ---------------------------------------------------------------------------
export const vacations = pgTable(
  "vacations",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    customerId: varchar("customer_id", { length: 36 }).references(() => users.id).notNull(),
    startDate: varchar("start_date", { length: 10 }).notNull(),
    endDate: varchar("end_date", { length: 10 }).notNull(),
    isGlobal: boolean("is_global").default(true).notNull(),
    subscriptionIds: text("subscription_ids"), // JSON array or comma list
    status: varchar("status", { length: 20 }).default("ACTIVE").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("vacations_customer_dates_idx").on(table.customerId, table.startDate, table.endDate),
  ]
);

// ---------------------------------------------------------------------------
// 13. Delivery Runs & Stops
// ---------------------------------------------------------------------------
export const deliveryRuns = pgTable(
  "delivery_runs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).references(() => tenants.id).notNull(),
    driverId: varchar("driver_id", { length: 36 }).references(() => users.id).notNull(),
    driverName: varchar("driver_name", { length: 255 }).notNull(),
    date: varchar("date", { length: 10 }).notNull(),
    shift: varchar("shift", { length: 20 }).default("MORNING").notNull(),
    totalStops: integer("total_stops").default(0).notNull(),
    completedStops: integer("completed_stops").default(0).notNull(),
    skippedStops: integer("skipped_stops").default(0).notNull(),
    failedStops: integer("failed_stops").default(0).notNull(),
    status: varchar("status", { length: 20 }).default("IN_PROGRESS").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("delivery_runs_tenant_date_idx").on(table.tenantId, table.date),
  ]
);

export const deliveryStops = pgTable(
  "delivery_stops",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    runId: varchar("run_id", { length: 36 }).references(() => deliveryRuns.id).notNull(),
    fulfillmentId: varchar("fulfillment_id", { length: 36 }),
    customerId: varchar("customer_id", { length: 36 }).references(() => users.id).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
    society: varchar("society", { length: 255 }).notNull(),
    tower: varchar("tower", { length: 50 }).notNull(),
    floor: integer("floor").notNull(),
    flat: varchar("flat", { length: 50 }).notNull(),
    serviceName: varchar("service_name", { length: 255 }).notNull(),
    quantity: integer("quantity").default(1).notNull(),
    status: varchar("status", { length: 20 }).default("PENDING").notNull(),
    dropPreference: varchar("drop_preference", { length: 30 }).default("DOORSTEP").notNull(),
    notes: text("notes"),
    deliveredAt: varchar("delivered_at", { length: 30 }),
    failureReason: text("failure_reason"),
    assetDelivered: integer("asset_delivered").default(0).notNull(),
    assetCollected: integer("asset_collected").default(0).notNull(),
  },
  (table) => [
    index("delivery_stops_run_idx").on(table.runId),
  ]
);

// ---------------------------------------------------------------------------
// 14. Disputes & Quality Claims
// ---------------------------------------------------------------------------
export const disputes = pgTable(
  "disputes",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).references(() => tenants.id).notNull(),
    customerId: varchar("customer_id", { length: 36 }).references(() => users.id).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
    fulfillmentId: varchar("fulfillment_id", { length: 36 }).notNull(),
    reason: varchar("reason", { length: 50 }).notNull(),
    disputedAmountPaise: integer("disputed_amount_paise").notNull(),
    status: varchar("status", { length: 20 }).default("OPEN").notNull(),
    driverDeliveredAt: varchar("driver_delivered_at", { length: 30 }),
    driverDropNotes: text("driver_drop_notes"),
    customerComment: text("customer_comment"),
    decision: varchar("decision", { length: 30 }),
    refundPaise: integer("refund_paise"),
    resolutionNotes: text("resolution_notes"),
    resolvedBy: varchar("resolved_by", { length: 100 }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("disputes_tenant_cust_idx").on(table.tenantId, table.customerId),
    index("disputes_status_idx").on(table.status),
  ]
);

// ---------------------------------------------------------------------------
// 15. Platform Audit Logs
// ---------------------------------------------------------------------------
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    adminUserId: varchar("admin_user_id", { length: 36 }).notNull(),
    adminEmail: varchar("admin_email", { length: 255 }).notNull(),
    action: varchar("action", { length: 50 }).notNull(),
    targetType: varchar("target_type", { length: 30 }).notNull(),
    targetId: varchar("target_id", { length: 36 }).notNull(),
    details: text("details").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_target_idx").on(table.targetType, table.targetId),
    index("audit_logs_created_idx").on(table.createdAt),
  ]
);

// ---------------------------------------------------------------------------
// 16. Household Expense Splitting
// ---------------------------------------------------------------------------
export const householdExpenses = pgTable(
  "household_expenses",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    householdId: varchar("household_id", { length: 36 }).references(() => households.id).notNull(),
    invoiceId: varchar("invoice_id", { length: 36 }),
    description: varchar("description", { length: 255 }).notNull(),
    totalAmountPaise: integer("total_amount_paise").notNull(),
    paidByUserId: varchar("paid_by_user_id", { length: 36 }).references(() => users.id).notNull(),
    paidByName: varchar("paid_by_name", { length: 255 }).notNull(),
    paidByUpi: varchar("paid_by_upi", { length: 100 }).notNull(),
    strategy: varchar("strategy", { length: 20 }).default("EQUAL").notNull(),
    isFullySettled: boolean("is_fully_settled").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("expenses_household_idx").on(table.householdId),
  ]
);

export const householdExpenseParticipants = pgTable(
  "household_expense_participants",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    expenseId: varchar("expense_id", { length: 36 }).references(() => householdExpenses.id).notNull(),
    userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    sharePaise: integer("share_paise").notNull(),
    isSettled: boolean("is_settled").default(false).notNull(),
    settledAt: timestamp("settled_at", { withTimezone: true }),
    upiId: varchar("upi_id", { length: 100 }),
  },
  (table) => [
    index("expense_participants_exp_idx").on(table.expenseId),
  ]
);

