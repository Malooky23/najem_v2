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
}

export const itemSchema = z.object({
  itemName: z.string().min(1, "Required"),
  itemType: z.string().optional(),
  itemBrand: z.string().optional(),
  itemModel: z.string().optional(),
  itemBarcode: z.string().optional(),
  itemCountryOfOrigin: z.string().optional(),
  packingType: z.string(),
  weightGrams: z.coerce.number().nonnegative().optional(),
  dimensions: z
    .object({
      width: z.coerce.number().nonnegative().optional(),
      height: z.coerce.number().nonnegative().optional(),
      length: z.coerce.number().nonnegative().optional(),
    })
    .optional(),
  notes: z.string().optional(),
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
