CREATE TABLE "daily_fulfillments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"subscription_id" varchar(36) NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"household_id" varchar(36),
	"service_date" varchar(10) NOT NULL,
	"shift" varchar(20) DEFAULT 'MORNING' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price_paise" integer NOT NULL,
	"total_price_paise" integer NOT NULL,
	"status" varchar(30) DEFAULT 'SCHEDULED' NOT NULL,
	"cutoff_time" timestamp with time zone,
	"action_taken_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "household_members" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"household_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"role" varchar(30) DEFAULT 'MEMBER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "households" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"primary_owner_id" varchar(36) NOT NULL,
	"society_name" varchar(255) NOT NULL,
	"tower_wing" varchar(50) NOT NULL,
	"floor" varchar(20) NOT NULL,
	"flat_number" varchar(50) NOT NULL,
	"landmark" text,
	"city" varchar(100) DEFAULT 'Bengaluru' NOT NULL,
	"pincode" varchar(10),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"household_id" varchar(36),
	"invoice_number" varchar(50) NOT NULL,
	"period_start" varchar(10) NOT NULL,
	"period_end" varchar(10) NOT NULL,
	"due_date" varchar(10) NOT NULL,
	"subtotal_paise" integer NOT NULL,
	"discount_paise" integer DEFAULT 0 NOT NULL,
	"tax_paise" integer DEFAULT 0 NOT NULL,
	"total_amount_due_paise" integer NOT NULL,
	"amount_paid_paise" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'ISSUED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "khata_entries" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"household_id" varchar(36),
	"entry_type" varchar(30) NOT NULL,
	"direction" varchar(10) NOT NULL,
	"amount_paise" integer NOT NULL,
	"running_balance_paise" integer NOT NULL,
	"reference_type" varchar(30),
	"reference_id" varchar(36),
	"description" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"invoice_id" varchar(36),
	"amount_paise" integer NOT NULL,
	"method" varchar(30) DEFAULT 'UPI_INTENT' NOT NULL,
	"status" varchar(20) DEFAULT 'CREATED' NOT NULL,
	"gateway_order_id" varchar(100),
	"gateway_payment_id" varchar(100),
	"bank_utr" varchar(100),
	"khata_entry_id" varchar(36),
	"settled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"service_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"unit_type" varchar(30) NOT NULL,
	"base_price_paise" integer NOT NULL,
	"is_addon" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"category" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"cutoff_time_str" varchar(10) DEFAULT '09:00' NOT NULL,
	"late_cancellation_fee_percent" integer DEFAULT 50 NOT NULL,
	"requires_asset_tracking" boolean DEFAULT false NOT NULL,
	"allows_quantity_adjustment" boolean DEFAULT true NOT NULL,
	"allows_skip" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"household_id" varchar(36),
	"product_id" varchar(36) NOT NULL,
	"cadence" varchar(30) DEFAULT 'DAILY' NOT NULL,
	"selected_days" text,
	"default_quantity" integer DEFAULT 1 NOT NULL,
	"autopilot_default" varchar(20) DEFAULT 'CONFIRMED' NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"start_date" varchar(10) NOT NULL,
	"end_date" varchar(10),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"business_name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"upi_id" varchar(100),
	"fssai_number" varchar(50),
	"plan_tier" varchar(20) DEFAULT 'STARTER' NOT NULL,
	"address" text,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36),
	"phone" varchar(20) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255),
	"role" varchar(30) DEFAULT 'CUSTOMER' NOT NULL,
	"whatsapp_opt_in" boolean DEFAULT true NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "daily_fulfillments" ADD CONSTRAINT "daily_fulfillments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_fulfillments" ADD CONSTRAINT "daily_fulfillments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_fulfillments" ADD CONSTRAINT "daily_fulfillments_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_fulfillments" ADD CONSTRAINT "daily_fulfillments_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "households" ADD CONSTRAINT "households_primary_owner_id_users_id_fk" FOREIGN KEY ("primary_owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khata_entries" ADD CONSTRAINT "khata_entries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khata_entries" ADD CONSTRAINT "khata_entries_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khata_entries" ADD CONSTRAINT "khata_entries_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "fulfillments_sub_date_shift_idx" ON "daily_fulfillments" USING btree ("subscription_id","service_date","shift");--> statement-breakpoint
CREATE INDEX "fulfillments_tenant_date_idx" ON "daily_fulfillments" USING btree ("tenant_id","service_date");--> statement-breakpoint
CREATE INDEX "fulfillments_customer_date_idx" ON "daily_fulfillments" USING btree ("customer_id","service_date");--> statement-breakpoint
CREATE INDEX "household_members_household_idx" ON "household_members" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "household_members_user_idx" ON "household_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "households_society_tower_idx" ON "households" USING btree ("society_name","tower_wing");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_number_idx" ON "invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "invoices_tenant_customer_idx" ON "invoices" USING btree ("tenant_id","customer_id");--> statement-breakpoint
CREATE INDEX "khata_tenant_customer_idx" ON "khata_entries" USING btree ("tenant_id","customer_id");--> statement-breakpoint
CREATE INDEX "khata_created_at_idx" ON "khata_entries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payments_tenant_customer_idx" ON "payments" USING btree ("tenant_id","customer_id");--> statement-breakpoint
CREATE INDEX "payments_gateway_order_idx" ON "payments" USING btree ("gateway_order_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_tenant_service_idx" ON "products" USING btree ("tenant_id","service_id");--> statement-breakpoint
CREATE INDEX "services_tenant_category_idx" ON "services" USING btree ("tenant_id","category");--> statement-breakpoint
CREATE INDEX "subscriptions_tenant_customer_idx" ON "subscriptions" USING btree ("tenant_id","customer_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tenants_phone_idx" ON "tenants" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "users_tenant_role_idx" ON "users" USING btree ("tenant_id","role");