ALTER TABLE "inventory" DROP CONSTRAINT "inventory_quantity_check";--> statement-breakpoint
ALTER TABLE "item_hierarchy" DROP CONSTRAINT "no_self_reference";--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_quantity_check";--> statement-breakpoint
ALTER TABLE "item_transactions" DROP CONSTRAINT "valid_stock_movement";--> statement-breakpoint
ALTER TABLE "vendor_services" DROP CONSTRAINT "vendor_services_rate_check";--> statement-breakpoint
ALTER TABLE "vendor_transactions" DROP CONSTRAINT "vendor_transactions_rate_check";--> statement-breakpoint
ALTER TABLE "vendor_transactions" DROP CONSTRAINT "vendor_transactions_quantity_check";--> statement-breakpoint
ALTER TABLE "vendor_ledger" DROP CONSTRAINT "vendor_ledger_transaction_type_check";--> statement-breakpoint
ALTER TABLE "vendor_ledger" DROP CONSTRAINT "vendor_ledger_check";--> statement-breakpoint
ALTER TABLE "vendor_payment" DROP CONSTRAINT "vendor_payment_amount_check";--> statement-breakpoint

-- Safe conversion of weight_grams to integer
ALTER TABLE "item" ADD COLUMN "weight_grams_int" integer;--> statement-breakpoint
UPDATE "item" SET "weight_grams_int" = ROUND("weight_grams"::numeric) WHERE "weight_grams" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "item" DROP COLUMN "weight_grams";--> statement-breakpoint
ALTER TABLE "item" RENAME COLUMN "weight_grams_int" TO "weight_grams";--> statement-breakpoint

ALTER TABLE "inventory" ADD CONSTRAINT "inventory_quantity_check" CHECK (quantity >= 0);--> statement-breakpoint
ALTER TABLE "item_hierarchy" ADD CONSTRAINT "no_self_reference" CHECK (parent_item_id <> child_item_id);--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_quantity_check" CHECK (quantity > 0);--> statement-breakpoint
ALTER TABLE "item_transactions" ADD CONSTRAINT "valid_stock_movement" CHECK (((movement = 'IN'::movement_type) AND (new_stock = (prev_stock + movement_amt))) OR ((movement = 'OUT'::movement_type) AND (new_stock = (prev_stock - movement_amt))));--> statement-breakpoint
ALTER TABLE "vendor_services" ADD CONSTRAINT "vendor_services_rate_check" CHECK (rate >= 0);--> statement-breakpoint
ALTER TABLE "vendor_transactions" ADD CONSTRAINT "vendor_transactions_rate_check" CHECK (rate >= 0);--> statement-breakpoint
ALTER TABLE "vendor_transactions" ADD CONSTRAINT "vendor_transactions_quantity_check" CHECK (quantity > 0);--> statement-breakpoint
ALTER TABLE "vendor_ledger" ADD CONSTRAINT "vendor_ledger_transaction_type_check" CHECK ((transaction_type)::text = ANY ((ARRAY['PAYMENT'::character varying, 'INVOICE'::character varying, 'ADJUSTMENT'::character varying, 'STARTING_BALANCE'::character varying])::text[]));--> statement-breakpoint
ALTER TABLE "vendor_ledger" ADD CONSTRAINT "vendor_ledger_check" CHECK ((debit >= (0)::numeric) AND (credit >= (0)::numeric));--> statement-breakpoint
ALTER TABLE "vendor_payment" ADD CONSTRAINT "vendor_payment_amount_check" CHECK (amount > (0)::numeric);