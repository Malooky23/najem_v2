-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."delivery_method" AS ENUM('PICKUP', 'DELIVERY');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('IN', 'OUT');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('CUSTOMER_ORDER', 'MANUAL_ADJUSTMENT', 'INVENTORY_COUNT', 'TRANSFER_LOCATION');--> statement-breakpoint
CREATE TYPE "public"."packing_type" AS ENUM('SACK', 'PALLET', 'CARTON', 'OTHER', 'NONE');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('CUSTOMER', 'EMPLOYEE', 'COMPANY');--> statement-breakpoint
CREATE TYPE "public"."vendor_type" AS ENUM('FORKLIFT', 'LABOUR', 'OTHER');--> statement-breakpoint
CREATE TABLE "address" (
	"address_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"owner_type" "user_type" NOT NULL,
	"address_1" varchar(255) NOT NULL,
	"address_2" varchar(255),
	"city" varchar(100) NOT NULL,
	"country" varchar(2) NOT NULL,
	"postal_code" varchar(20),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company" (
	"comp_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comp_name" varchar(100) NOT NULL,
	"comp_number" serial NOT NULL,
	"email" varchar(100),
	"trn" varchar(15),
	"mobile" varchar(16),
	"landline" varchar(16),
	"address_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "company_comp_number_key" UNIQUE("comp_number"),
	CONSTRAINT "company_email_key" UNIQUE("email"),
	CONSTRAINT "company_trn_key" UNIQUE("trn"),
	CONSTRAINT "company_mobile_key" UNIQUE("mobile"),
	CONSTRAINT "company_landline_key" UNIQUE("landline")
);
--> statement-breakpoint
CREATE TABLE "item" (
	"item_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_number" serial NOT NULL,
	"item_name" varchar(50) NOT NULL,
	"item_type" varchar(50),
	"item_brand" varchar(100),
	"item_model" varchar(100),
	"item_barcode" varchar(100),
	"dimensions" jsonb,
	"weight_grams" numeric(10, 2),
	"notes" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "item_item_number_key" UNIQUE("item_number"),
	CONSTRAINT "item_item_barcode_key" UNIQUE("item_barcode")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"mobile_no_1" varchar(20) NOT NULL,
	"mobile_no_2" varchar(20),
	"user_type" "user_type" NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"last_login" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "users_username_key" UNIQUE("username"),
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"cus_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"comp_id" uuid,
	"address_id" uuid,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "customer_user_id_key" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "employee" (
	"emp_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "employee_user_id_key" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"inventory_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"location_code" varchar(50),
	"quantity" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "inventory_quantity_check" CHECK (quantity >= 0)
);
--> statement-breakpoint
CREATE TABLE "item_hierarchy" (
	"row_id" serial PRIMARY KEY NOT NULL,
	"parent_item_id" uuid NOT NULL,
	"child_item_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "no_self_reference" CHECK (parent_item_id <> child_item_id)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"order_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" serial NOT NULL,
	"creator_id" uuid NOT NULL,
	"cus_id" uuid NOT NULL,
	"order_type" "order_type" NOT NULL,
	"movement" "movement_type" NOT NULL,
	"packing_type" "packing_type" NOT NULL,
	"delivery_method" "delivery_method" NOT NULL,
	"notes" text,
	"status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"address_id" uuid,
	"fulfilled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "orders_order_number_key" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"order_items_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "order_items_quantity_check" CHECK (quantity > 0)
);
--> statement-breakpoint
CREATE TABLE "item_transactions" (
	"item_tx_id" serial PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"inventory_id" uuid NOT NULL,
	"movement" "movement_type" NOT NULL,
	"movement_amt" integer NOT NULL,
	"prev_stock" integer NOT NULL,
	"new_stock" integer NOT NULL,
	"notes" text,
	"tx_date" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "valid_stock_movement" CHECK (((movement = 'IN'::movement_type) AND (new_stock = (prev_stock + movement_amt))) OR ((movement = 'OUT'::movement_type) AND (new_stock = (prev_stock - movement_amt))))
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"vendor_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_number" serial NOT NULL,
	"vendor_name" varchar(100) NOT NULL,
	"vendor_type" "vendor_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "vendors_vendor_number_key" UNIQUE("vendor_number")
);
--> statement-breakpoint
CREATE TABLE "vendor_services" (
	"vendor_service_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_services_number" serial NOT NULL,
	"vendor_id" uuid NOT NULL,
	"service_name" varchar(255) NOT NULL,
	"rate" integer NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "vendor_services_vendor_services_number_key" UNIQUE("vendor_services_number"),
	CONSTRAINT "vendor_services_rate_check" CHECK (rate >= 0)
);
--> statement-breakpoint
CREATE TABLE "vendor_transactions" (
	"vendor_tx_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_tx_number" serial NOT NULL,
	"vendor_id" uuid NOT NULL,
	"order_id" uuid,
	"tx_date" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"cus_id" uuid,
	"vendor_service_id" uuid NOT NULL,
	"rate" integer NOT NULL,
	"quantity" integer NOT NULL,
	"total_cost" numeric(10, 2) GENERATED ALWAYS AS ((rate * quantity)) STORED,
	"emp_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "vendor_transactions_vendor_tx_number_key" UNIQUE("vendor_tx_number"),
	CONSTRAINT "vendor_transactions_rate_check" CHECK (rate >= 0),
	CONSTRAINT "vendor_transactions_quantity_check" CHECK (quantity > 0)
);
--> statement-breakpoint
CREATE TABLE "vendor_ledger" (
	"ledger_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"transaction_date" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"transaction_type" varchar(50) NOT NULL,
	"debit" numeric(10, 2) DEFAULT '0' NOT NULL,
	"credit" numeric(10, 2) DEFAULT '0' NOT NULL,
	"description" text,
	"related_transaction_id" uuid,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "vendor_ledger_transaction_type_check" CHECK ((transaction_type)::text = ANY ((ARRAY['PAYMENT'::character varying, 'INVOICE'::character varying, 'ADJUSTMENT'::character varying, 'STARTING_BALANCE'::character varying])::text[])),
	CONSTRAINT "vendor_ledger_check" CHECK ((debit >= (0)::numeric) AND (credit >= (0)::numeric)),
	CONSTRAINT "vendor_ledger_check1" CHECK (NOT ((debit = (0)::numeric) AND (credit = (0)::numeric)))
);
--> statement-breakpoint
CREATE TABLE "vendor_payment" (
	"pay_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"amount" numeric NOT NULL,
	"emp_id" uuid NOT NULL,
	"payment_date" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "vendor_payment_amount_check" CHECK (amount > (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_owners" (
	"item_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"owner_type" varchar(50) NOT NULL,
	CONSTRAINT "item_owners_pkey" PRIMARY KEY("item_id","owner_id","owner_type")
);
--> statement-breakpoint
ALTER TABLE "company" ADD CONSTRAINT "company_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."address"("address_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "item_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_comp_id_fkey" FOREIGN KEY ("comp_id") REFERENCES "public"."company"("comp_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."address"("address_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."item"("item_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_hierarchy" ADD CONSTRAINT "item_hierarchy_parent_item_id_fkey" FOREIGN KEY ("parent_item_id") REFERENCES "public"."item"("item_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_hierarchy" ADD CONSTRAINT "item_hierarchy_child_item_id_fkey" FOREIGN KEY ("child_item_id") REFERENCES "public"."item"("item_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_cus_id_fkey" FOREIGN KEY ("cus_id") REFERENCES "public"."customer"("cus_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."address"("address_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."item"("item_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_transactions" ADD CONSTRAINT "item_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_transactions" ADD CONSTRAINT "item_transactions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."item"("item_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_transactions" ADD CONSTRAINT "item_transactions_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("inventory_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_services" ADD CONSTRAINT "vendor_services_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("vendor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_services" ADD CONSTRAINT "vendor_services_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_transactions" ADD CONSTRAINT "vendor_transactions_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("vendor_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_transactions" ADD CONSTRAINT "vendor_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_transactions" ADD CONSTRAINT "vendor_transactions_cus_id_fkey" FOREIGN KEY ("cus_id") REFERENCES "public"."customer"("cus_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_transactions" ADD CONSTRAINT "vendor_transactions_vendor_service_id_fkey" FOREIGN KEY ("vendor_service_id") REFERENCES "public"."vendor_services"("vendor_service_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_transactions" ADD CONSTRAINT "vendor_transactions_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "public"."employee"("emp_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_ledger" ADD CONSTRAINT "vendor_ledger_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("vendor_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payment" ADD CONSTRAINT "vendor_payment_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("vendor_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payment" ADD CONSTRAINT "vendor_payment_emp_id_fkey" FOREIGN KEY ("emp_id") REFERENCES "public"."employee"("emp_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_owners" ADD CONSTRAINT "item_owners_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."item"("item_id") ON DELETE cascade ON UPDATE no action;
*/