import { z } from "zod";

export const itemSchema = z.object({
  itemName: z.string().min(1, "Required"),
  itemType: z.string().optional(),
  itemBrand: z.string().optional(),
  itemModel: z.string().optional(),
  itemBarcode: z.string().optional(),
  itemCountryOfOrigin: z.string().optional(),
  packingType: z.enum(["SACK", "PALLET", "CARTON", "OTHER", "NONE"]),
  weightGrams: z.number().nonnegative().optional(),
  dimensions: z
    .object({
      width: z.number().nonnegative(),
      height: z.number().nonnegative(),
      depth: z.number().nonnegative(),
    })
    .optional(),
  notes: z.string().optional(),
});

export const packingTypeOptions = [
  "SACK",
  "PALLET",
  "CARTON",
  "OTHER",
  "NONE",
] as const;
