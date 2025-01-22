import { z } from "zod";

import { itemTypes } from "@/lib/types";

export const itemDimensionSchema = z.object({
  length: z.number().min(0, "Length must be positive").optional(),
  width: z.number().min(0, "Width must be positive").optional(),
  height: z.number().min(0, "Height must be positive").optional(),
});

export const createItemSchema = z.object({
  itemName: z.string().min(1, "Item name is required").max(50),
  itemType: z.enum(itemTypes),
  itemModel: z.string().max(100).optional(),
  itemBrand: z.string().max(100).optional(),
  weightGrams: z.number().int("Weight must be a whole number").min(0, "Weight must be positive").nullable().optional(),
  notes: z.string().max(1000).optional(),
  dimensions: itemDimensionSchema.optional(),
  itemBarcode: z.string().max(100).optional(),
  ownerId: z.string().uuid("Invalid owner ID"),
  ownerType: z.enum(["COMPANY", "CUSTOMER"]),
});

export const updateItemSchema = z.object({
  itemName: z.string().min(1),
  itemType: z.string(),
  itemBrand: z.string().nullable().optional(),
  itemModel: z.string().nullable().optional(),
  itemBarcode: z.string().nullable().optional(),
  dimensions: z.any().optional(),
  weightGrams: z.number().int("Weight must be a whole number").min(0, "Weight must be positive").nullable().optional(),
  notes: z.string().nullable().optional(),
  ownerId: z.string().nullable().optional(),
  ownerType: z.string().nullable().optional(),
});

export type ItemDimension = z.infer<typeof itemDimensionSchema>;

export type UpdateItemInput = z.infer<typeof updateItemSchema>;
