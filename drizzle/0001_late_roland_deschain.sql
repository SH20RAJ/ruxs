CREATE TABLE "asset_holdings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"asset_type" varchar(50) NOT NULL,
	"holding_count" integer DEFAULT 0 NOT NULL,
	"deposit_per_unit_paise" integer DEFAULT 0 NOT NULL,
	"total_deposit_held_paise" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_movements" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"asset_type" varchar(50) NOT NULL,
	"quantity_delivered" integer DEFAULT 0 NOT NULL,
	"quantity_collected" integer DEFAULT 0 NOT NULL,
	"net_delta" integer NOT NULL,
	"resulting_holding_count" integer NOT NULL,
	"fulfillment_id" varchar(36),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"admin_user_id" varchar(36) NOT NULL,
	"admin_email" varchar(255) NOT NULL,
	"action" varchar(50) NOT NULL,
	"target_type" varchar(30) NOT NULL,
	"target_id" varchar(36) NOT NULL,
	"details" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_runs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"driver_id" varchar(36) NOT NULL,
	"driver_name" varchar(255) NOT NULL,
	"date" varchar(10) NOT NULL,
	"shift" varchar(20) DEFAULT 'MORNING' NOT NULL,
	"total_stops" integer DEFAULT 0 NOT NULL,
	"completed_stops" integer DEFAULT 0 NOT NULL,
	"skipped_stops" integer DEFAULT 0 NOT NULL,
	"failed_stops" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'IN_PROGRESS' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_stops" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"run_id" varchar(36) NOT NULL,
	"fulfillment_id" varchar(36),
	"customer_id" varchar(36) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_phone" varchar(20) NOT NULL,
	"society" varchar(255) NOT NULL,
	"tower" varchar(50) NOT NULL,
	"floor" integer NOT NULL,
	"flat" varchar(50) NOT NULL,
	"service_name" varchar(255) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"drop_preference" varchar(30) DEFAULT 'DOORSTEP' NOT NULL,
	"notes" text,
	"delivered_at" varchar(30),
	"failure_reason" text,
	"asset_delivered" integer DEFAULT 0 NOT NULL,
	"asset_collected" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disputes" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_phone" varchar(20) NOT NULL,
	"fulfillment_id" varchar(36) NOT NULL,
	"reason" varchar(50) NOT NULL,
	"disputed_amount_paise" integer NOT NULL,
	"status" varchar(20) DEFAULT 'OPEN' NOT NULL,
	"driver_delivered_at" varchar(30),
	"driver_drop_notes" text,
	"customer_comment" text,
	"decision" varchar(30),
	"refund_paise" integer,
	"resolution_notes" text,
	"resolved_by" varchar(100),
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "household_expense_participants" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"expense_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"share_paise" integer NOT NULL,
	"is_settled" boolean DEFAULT false NOT NULL,
	"settled_at" timestamp with time zone,
	"upi_id" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "household_expenses" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"household_id" varchar(36) NOT NULL,
	"invoice_id" varchar(36),
	"description" varchar(255) NOT NULL,
	"total_amount_paise" integer NOT NULL,
	"paid_by_user_id" varchar(36) NOT NULL,
	"paid_by_name" varchar(255) NOT NULL,
	"paid_by_upi" varchar(100) NOT NULL,
	"strategy" varchar(20) DEFAULT 'EQUAL' NOT NULL,
	"is_fully_settled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vacations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"start_date" varchar(10) NOT NULL,
	"end_date" varchar(10) NOT NULL,
	"is_global" boolean DEFAULT true NOT NULL,
	"subscription_ids" text,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "asset_holdings" ADD CONSTRAINT "asset_holdings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_holdings" ADD CONSTRAINT "asset_holdings_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_movements" ADD CONSTRAINT "asset_movements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_movements" ADD CONSTRAINT "asset_movements_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_runs" ADD CONSTRAINT "delivery_runs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_runs" ADD CONSTRAINT "delivery_runs_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_stops" ADD CONSTRAINT "delivery_stops_run_id_delivery_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."delivery_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_stops" ADD CONSTRAINT "delivery_stops_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_expense_participants" ADD CONSTRAINT "household_expense_participants_expense_id_household_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."household_expenses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_expense_participants" ADD CONSTRAINT "household_expense_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_expenses" ADD CONSTRAINT "household_expenses_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_expenses" ADD CONSTRAINT "household_expenses_paid_by_user_id_users_id_fk" FOREIGN KEY ("paid_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacations" ADD CONSTRAINT "vacations_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_holdings_tenant_cust_idx" ON "asset_holdings" USING btree ("tenant_id","customer_id");--> statement-breakpoint
CREATE INDEX "asset_movements_tenant_cust_idx" ON "asset_movements" USING btree ("tenant_id","customer_id");--> statement-breakpoint
CREATE INDEX "audit_logs_target_idx" ON "audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "delivery_runs_tenant_date_idx" ON "delivery_runs" USING btree ("tenant_id","date");--> statement-breakpoint
CREATE INDEX "delivery_stops_run_idx" ON "delivery_stops" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "disputes_tenant_cust_idx" ON "disputes" USING btree ("tenant_id","customer_id");--> statement-breakpoint
CREATE INDEX "disputes_status_idx" ON "disputes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "expense_participants_exp_idx" ON "household_expense_participants" USING btree ("expense_id");--> statement-breakpoint
CREATE INDEX "expenses_household_idx" ON "household_expenses" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "vacations_customer_dates_idx" ON "vacations" USING btree ("customer_id","start_date","end_date");