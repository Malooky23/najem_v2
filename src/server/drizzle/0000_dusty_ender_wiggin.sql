CREATE TYPE "public"."contact_type" AS ENUM('email', 'mobile', 'landline', 'other');--> statement-breakpoint
CREATE TYPE "public"."customer_type" AS ENUM('INDIVIDUAL', 'BUSINESS');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('EMPLOYEE', 'CUSTOMER', 'DEMO');--> statement-breakpoint
CREATE TABLE "address" (
	"address_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address_1" text,
	"address_2" text,
	"city" text NOT NULL,
	"country" text NOT NULL,
	"postal_code" varchar(20),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "business_customers" (
	"customer_business_id" uuid PRIMARY KEY NOT NULL,
	"business_name" text NOT NULL,
	"is_tax_registered" boolean DEFAULT false NOT NULL,
	"tax_registration_number" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "business_customers_business_name_unique" UNIQUE("business_name"),
	CONSTRAINT "business_customers_tax_registration_number_unique" UNIQUE("tax_registration_number")
);
--> statement-breakpoint
CREATE TABLE "contact_details" (
	"contact_details_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_type" "contact_type" NOT NULL,
	"contact_data" text NOT NULL,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"customer_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_number" serial NOT NULL,
	"customer_type" "customer_type" NOT NULL,
	"notes" text,
	"country" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "entity_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"address_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entity_contact_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_details_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"contact_type" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "individual_customers" (
	"customer_individual_id" uuid PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"middle_name" text,
	"last_name" text NOT NULL,
	"personal_id" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "individual_customers_personal_id_unique" UNIQUE("personal_id")
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"login_attempt_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"success" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"customer_id" uuid,
	"login_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "business_customers" ADD CONSTRAINT "business_customers_customer_business_id_customers_customer_id_fk" FOREIGN KEY ("customer_business_id") REFERENCES "public"."customers"("customer_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_addresses" ADD CONSTRAINT "entity_addresses_address_id_address_address_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."address"("address_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_contact_details" ADD CONSTRAINT "entity_contact_details_contact_details_id_contact_details_contact_details_id_fk" FOREIGN KEY ("contact_details_id") REFERENCES "public"."contact_details"("contact_details_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "individual_customers" ADD CONSTRAINT "individual_customers_customer_individual_id_customers_customer_id_fk" FOREIGN KEY ("customer_individual_id") REFERENCES "public"."customers"("customer_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_customer_id_customers_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("customer_id") ON DELETE no action ON UPDATE no action;