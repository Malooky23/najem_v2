ALTER TABLE "address" DROP CONSTRAINT "address_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "address" DROP CONSTRAINT "address_comp_id_fkey";
--> statement-breakpoint
ALTER TABLE "address" DROP COLUMN "owner_id";