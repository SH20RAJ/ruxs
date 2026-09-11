import { db } from "../src/shared/db";
import {
  tenants,
  users,
  households,
  householdMembers,
  services,
  products,
  subscriptions,
  dailyFulfillments,
  khataEntries,
  invoices,
  assetHoldings,
  deliveryRuns,
  deliveryStops,
  disputes,
  auditLogs,
  householdExpenses,
  householdExpenseParticipants,
} from "../src/shared/db/schema";

async function seed() {
  console.log("🌱 Starting Neon PostgreSQL database seeding...");

  // 1. Tenants
  await db
    .insert(tenants)
    .values([
      {
        id: "ten_sharma_tiffin",
        businessName: "Sharma Tiffin Services",
        slug: "sharma-tiffin-services",
        phone: "+91 98765 43210",
        email: "sharma.tiffin@ruxs.in",
        upiId: "sharmatiffin@okaxis",
        fssaiNumber: "11223344556677",
        planTier: "PRO",
        address: "14th Cross, Green Glen Layout, Bellandur, Bengaluru",
        status: "ACTIVE",
      },
      {
        id: "ten_gupta_dairy",
        businessName: "Gupta Pure Cow Milk & Ghee",
        slug: "gupta-pure-cow-milk",
        phone: "+91 98765 43230",
        email: "gupta.dairy@ruxs.in",
        upiId: "guptadairy@okaxis",
        planTier: "STARTER",
        address: "Bellandur Main Road, Bengaluru",
        status: "ACTIVE",
      },
      {
        id: "ten_bisleri_depot",
        businessName: "Green Glen 20L Water Depot",
        slug: "green-glen-water",
        phone: "+91 98765 43235",
        email: "greenglen.water@ruxs.in",
        upiId: "greenglenwater@okhdfc",
        planTier: "GROWTH",
        address: "Outer Ring Road, Bengaluru",
        status: "ACTIVE",
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Tenants seeded");

  // 2. Users
  await db
    .insert(users)
    .values([
      {
        id: "usr_priya",
        phone: "+919876543210",
        fullName: "Priya Sundaram",
        email: "priya.sundaram@gmail.com",
        role: "CUSTOMER",
        tenantId: "ten_sharma_tiffin",
        whatsappOptIn: true,
        status: "ACTIVE",
      },
      {
        id: "usr_rahul",
        phone: "+919876543211",
        fullName: "Rahul Verma",
        email: "rahul.verma@gmail.com",
        role: "CUSTOMER",
        tenantId: "ten_sharma_tiffin",
        whatsappOptIn: true,
        status: "ACTIVE",
      },
      {
        id: "usr_ananya",
        phone: "+919876543217",
        fullName: "Ananya Deshmukh",
        email: "ananya.d@gmail.com",
        role: "CUSTOMER",
        tenantId: "ten_sharma_tiffin",
        whatsappOptIn: true,
        status: "ACTIVE",
      },
      {
        id: "usr_sneha",
        phone: "+919876543218",
        fullName: "Sneha Reddy",
        email: "sneha.reddy@gmail.com",
        role: "CUSTOMER",
        tenantId: "ten_sharma_tiffin",
        whatsappOptIn: true,
        status: "ACTIVE",
      },
      {
        id: "drv_ramesh",
        phone: "+919876543220",
        fullName: "Ramesh Kumar",
        email: "ramesh.kumar@ruxs.in",
        role: "DELIVERY_STAFF",
        tenantId: "ten_sharma_tiffin",
        whatsappOptIn: true,
        status: "ACTIVE",
      },
      {
        id: "usr_admin_ops",
        phone: "+919876543299",
        fullName: "RUXS Global Ops",
        email: "ops@ruxs.in",
        role: "PLATFORM_ADMIN",
        whatsappOptIn: true,
        status: "ACTIVE",
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Users seeded");

  // 3. Households & Members
  await db
    .insert(households)
    .values([
      {
        id: "hh_sobha_b402",
        name: "Sobha B-402 Flatmates",
        primaryOwnerId: "usr_priya",
        societyName: "Sobha Classic",
        towerWing: "Tower B",
        floor: "4",
        flatNumber: "B-402",
        city: "Bengaluru",
        pincode: "560103",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(householdMembers)
    .values([
      {
        id: "hm_1",
        householdId: "hh_sobha_b402",
        userId: "usr_priya",
        role: "PRIMARY_OWNER",
      },
      {
        id: "hm_2",
        householdId: "hh_sobha_b402",
        userId: "usr_ananya",
        role: "MEMBER",
      },
      {
        id: "hm_3",
        householdId: "hh_sobha_b402",
        userId: "usr_sneha",
        role: "MEMBER",
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Households & Members seeded");

  // 4. Services & Products
  await db
    .insert(services)
    .values([
      {
        id: "srv_tiffin_lunch",
        tenantId: "ten_sharma_tiffin",
        category: "TIFFIN",
        name: "Executive Veg Lunch",
        description: "Homestyle 4 Roti, Dal, Sabzi, Rice with stainless steel dabba swaps",
        cutoffTimeStr: "10:00",
        requiresAssetTracking: true,
      },
      {
        id: "srv_water_20l",
        tenantId: "ten_bisleri_depot",
        category: "WATER",
        name: "Bisleri 20L Water Jar",
        description: "Pure RO 20L jar delivery with doorstep can return tracking",
        cutoffTimeStr: "07:00",
        requiresAssetTracking: true,
      },
      {
        id: "srv_milk_daily",
        tenantId: "ten_gupta_dairy",
        category: "MILK",
        name: "Fresh Pure Cow Milk",
        description: "Dawn doorstep delivery in sealed 500ml pouches",
        cutoffTimeStr: "21:00",
        requiresAssetTracking: false,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(products)
    .values([
      {
        id: "prod_thali_std",
        tenantId: "ten_sharma_tiffin",
        serviceId: "srv_tiffin_lunch",
        name: "Standard Veg Thali",
        unitType: "MEAL",
        basePricePaise: 12000, // ₹120.00
      },
      {
        id: "prod_water_jar",
        tenantId: "ten_bisleri_depot",
        serviceId: "srv_water_20l",
        name: "20L RO Water Jar",
        unitType: "JAR",
        basePricePaise: 9000, // ₹90.00
      },
      {
        id: "prod_milk_1l",
        tenantId: "ten_gupta_dairy",
        serviceId: "srv_milk_daily",
        name: "Pure Cow Milk 1L",
        unitType: "LITER",
        basePricePaise: 4800, // ₹48.00
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Services & Products seeded");

  // 5. Subscriptions
  await db
    .insert(subscriptions)
    .values([
      {
        id: "sub_priya_tiffin",
        tenantId: "ten_sharma_tiffin",
        customerId: "usr_priya",
        householdId: "hh_sobha_b402",
        productId: "prod_thali_std",
        cadence: "WEEKDAYS",
        defaultQuantity: 1,
        status: "ACTIVE",
        startDate: "2026-09-01",
      },
      {
        id: "sub_priya_water",
        tenantId: "ten_bisleri_depot",
        customerId: "usr_priya",
        householdId: "hh_sobha_b402",
        productId: "prod_water_jar",
        cadence: "ALTERNATE_DAYS",
        defaultQuantity: 1,
        status: "ACTIVE",
        startDate: "2026-09-05",
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Subscriptions seeded");

  // 6. Today's Fulfillment
  const todayStr = new Date().toISOString().split("T")[0];
  await db
    .insert(dailyFulfillments)
    .values([
      {
        id: "ful_today_1",
        tenantId: "ten_sharma_tiffin",
        subscriptionId: "sub_priya_tiffin",
        customerId: "usr_priya",
        householdId: "hh_sobha_b402",
        serviceDate: todayStr,
        shift: "LUNCH",
        quantity: 1,
        unitPricePaise: 12000,
        totalPricePaise: 12000,
        status: "CONFIRMED",
        notes: "Packed with 4 rotis, no onion salad",
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Fulfillments seeded");

  // 7. Khata Entries
  await db
    .insert(khataEntries)
    .values([
      {
        id: "kh_101",
        tenantId: "ten_sharma_tiffin",
        customerId: "usr_priya",
        householdId: "hh_sobha_b402",
        entryType: "FULFILLMENT_CHARGE",
        direction: "DEBIT",
        amountPaise: 12000,
        runningBalancePaise: 12000,
        description: "Delivered: Executive Veg Lunch Thali (Today)",
      },
      {
        id: "kh_102",
        tenantId: "ten_sharma_tiffin",
        customerId: "usr_priya",
        householdId: "hh_sobha_b402",
        entryType: "FULFILLMENT_CHARGE",
        direction: "DEBIT",
        amountPaise: 12000,
        runningBalancePaise: 24000,
        description: "Delivered: Executive Veg Lunch Thali (Yesterday)",
      },
      {
        id: "kh_103",
        tenantId: "ten_sharma_tiffin",
        customerId: "usr_priya",
        householdId: "hh_sobha_b402",
        entryType: "PAYMENT",
        direction: "CREDIT",
        amountPaise: 24000,
        runningBalancePaise: 0,
        description: "UPI Payment Received (Ref #UPI893472)",
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Khata entries seeded");

  // 8. Invoices
  await db
    .insert(invoices)
    .values([
      {
        id: "inv_2026_09_0014",
        tenantId: "ten_sharma_tiffin",
        customerId: "usr_priya",
        householdId: "hh_sobha_b402",
        invoiceNumber: "INV-2026-09-0014",
        periodStart: "2026-09-01",
        periodEnd: "2026-09-30",
        dueDate: "2026-09-15",
        subtotalPaise: 24000,
        totalAmountDuePaise: 24000,
        amountPaidPaise: 12000,
        status: "ISSUED",
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Invoices seeded");

  // 9. Asset Holdings
  await db
    .insert(assetHoldings)
    .values([
      {
        id: "ah_priya_water",
        tenantId: "ten_bisleri_depot",
        customerId: "usr_priya",
        assetType: "WATER_JAR_20L",
        holdingCount: 1,
        depositPerUnitPaise: 15000, // ₹150.00
        totalDepositHeldPaise: 15000,
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Asset holdings seeded");

  // 10. Delivery Runs & Stops
  await db
    .insert(deliveryRuns)
    .values([
      {
        id: "run_2026-09-12_lunch_drv_ramesh",
        tenantId: "ten_sharma_tiffin",
        driverId: "drv_ramesh",
        driverName: "Ramesh Kumar",
        date: todayStr,
        shift: "LUNCH",
        totalStops: 4,
        completedStops: 1,
        skippedStops: 1,
        failedStops: 0,
        status: "IN_PROGRESS",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(deliveryStops)
    .values([
      {
        id: "stop_1",
        runId: "run_2026-09-12_lunch_drv_ramesh",
        customerId: "usr_priya",
        customerName: "Priya Sundaram",
        customerPhone: "+91 98765 43210",
        society: "Sobha Classic",
        tower: "Tower B",
        floor: 4,
        flat: "B-402",
        serviceName: "Executive Veg Lunch",
        quantity: 1,
        status: "DELIVERED",
        dropPreference: "DOORSTEP",
        deliveredAt: "12:15 PM",
        assetDelivered: 1,
        assetCollected: 1,
      },
      {
        id: "stop_2",
        runId: "run_2026-09-12_lunch_drv_ramesh",
        customerId: "usr_rahul",
        customerName: "Rahul Verma",
        customerPhone: "+91 98765 43211",
        society: "Sobha Classic",
        tower: "Tower B",
        floor: 1,
        flat: "B-101",
        serviceName: "Executive Veg Lunch",
        quantity: 1,
        status: "PENDING",
        dropPreference: "HANDOVER",
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Delivery runs & stops seeded");

  // 11. Disputes
  await db
    .insert(disputes)
    .values([
      {
        id: "dsp_missing_meal_402",
        tenantId: "ten_sharma_tiffin",
        customerId: "usr_priya",
        customerName: "Priya Sundaram",
        customerPhone: "+91 98765 43210",
        fulfillmentId: "ful_2026_09_11_lunch_priya",
        reason: "NOT_DELIVERED",
        disputedAmountPaise: 12000,
        status: "OPEN",
        driverDeliveredAt: "12:15 PM",
        driverDropNotes: "Left on wooden shoe rack",
        customerComment: "Shoe rack is empty and doorbell was never rung.",
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Disputes seeded");

  // 12. Audit Logs
  await db
    .insert(auditLogs)
    .values([
      {
        id: "aud_01",
        adminUserId: "usr_admin_ops",
        adminEmail: "ops@ruxs.in",
        action: "VENDOR_APPROVED",
        targetType: "VENDOR",
        targetId: "ten_sharma_tiffin",
        details: "FSSAI certificate and kitchen inspected. Approved.",
      },
      {
        id: "aud_02",
        adminUserId: "usr_admin_ops",
        adminEmail: "ops@ruxs.in",
        action: "PLAN_UPGRADED",
        targetType: "VENDOR",
        targetId: "ten_sharma_tiffin",
        details: "Upgraded to PRO tier (Automated WhatsApp API unlocked)",
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Audit logs seeded");

  // 13. Household Expenses
  await db
    .insert(householdExpenses)
    .values([
      {
        id: "exp_sept_water_milk",
        householdId: "hh_sobha_b402",
        invoiceId: "inv_2026_09_0014",
        description: "September Shared Water & Milk Invoice",
        totalAmountPaise: 36000, // ₹360.00
        paidByUserId: "usr_priya",
        paidByName: "Priya Sundaram",
        paidByUpi: "priya@okaxis",
        strategy: "EQUAL",
        isFullySettled: false,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(householdExpenseParticipants)
    .values([
      {
        id: "hep_1",
        expenseId: "exp_sept_water_milk",
        userId: "usr_priya",
        name: "Priya Sundaram",
        phone: "+91 98765 43210",
        sharePaise: 12000,
        isSettled: true,
        upiId: "priya@okaxis",
      },
      {
        id: "hep_2",
        expenseId: "exp_sept_water_milk",
        userId: "usr_ananya",
        name: "Ananya Deshmukh",
        phone: "+91 98765 43217",
        sharePaise: 12000,
        isSettled: false,
        upiId: "ananya@oksbi",
      },
      {
        id: "hep_3",
        expenseId: "exp_sept_water_milk",
        userId: "usr_sneha",
        name: "Sneha Reddy",
        phone: "+91 98765 43218",
        sharePaise: 12000,
        isSettled: true,
        upiId: "sneha@okhdfc",
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Household expenses seeded");
  console.log("🎉 Seeding completed successfully in Neon PostgreSQL!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
