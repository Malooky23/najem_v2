import { z } from "zod";

export interface Item {
  itemId: string;
  itemNumber: number;
  itemName: string;
  itemType: string | null;
  itemBrand: string | null;
  itemModel: string | null;
  itemBarcode: string | null;
  itemCountryOfOrigin: string | null;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
  } | null;
  weightGrams: number | null;
  packingType: string | null;
  customerId: string;
  notes: string | null;
  createdBy: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  isDeleted: boolean | null;
  customerName: string;
  stock?: number | null;
}

export const itemSchema = z.object({
  // itemId: z.string().uuid("Invalid item ID"),
  itemName: z.string().min(1, "Required"),
  itemType: z.string().nullable().optional(),
  itemBrand: z.string().nullable().optional(),
  itemModel: z.string().nullable().optional(),
  itemBarcode: z.string().nullable().optional(),
  itemCountryOfOrigin: z.string().nullable().optional(),
  packingType: z.string().nullable(),
  weightGrams: z.coerce.number().nonnegative().optional(),
  dimensions: z
    .object({
      width: z.coerce.number().nonnegative().optional(),
      height: z.coerce.number().nonnegative().optional(),
      length: z.coerce.number().nonnegative().optional(),
    })
    .nullable()
    .optional(),
  notes: z.string().nullable().optional(),
});

export const createItemSchema = itemSchema.extend({
  customerId: z.string().uuid("Invalid customer ID"),
});

export const itemTypes = [
  "CARTON",
  "BOX",
  "SACK",
  "EQUIPMENT",
  "PALLET",
  "OTHER",
] as const;

export const packingTypeOptions = [
  "CARTON",
  "BOX",
  "SACK",
  "EQUIPMENT",
  "PALLET",
  "OTHER",
] as const;

//   export type ItemType =
//     | "CARTON"
//     | "BOX"
//     | "SACK"
//     | "EQUIPMENT"
//     | "PALLET"
//     | "OTHER";

export interface CreateItemInput {
  itemId: string;
  itemNumber: number;
  itemName: string;
  itemType: string | null;
  itemBrand: string | null;
  itemModel: string | null;
  itemBarcode: string | null;
  itemCountryOfOrigin: string | null;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
  } | null;
  weightGrams: number | null;
  packingType: string | null;
  customerId: string;
  notes?: string | null;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}
