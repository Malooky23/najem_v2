ALTER TABLE "company" DROP CONSTRAINT "company_address_id_fkey";
--> statement-breakpoint
ALTER TABLE "address" ADD CONSTRAINT "address_user_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "address" ADD CONSTRAINT "address_comp_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."company"("comp_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company" DROP COLUMN "address_id";