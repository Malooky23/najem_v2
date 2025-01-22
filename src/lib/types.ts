export interface Item {
  itemId: string;
  itemNumber: number;
  itemName: string;
  itemType: string | null;
  itemBrand: string | null;
  itemModel: string | null;
  itemBarcode: string | null;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
  } | null;
  weightGrams: number | null;
  notes: string | null;
  ownerId: string | null;
  ownerName: string | null;
  ownerType: string | null;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export const itemTypes = [
    "CARTON",
    "BOX",
    "SACK",
    "EQUIPMENT",
    "PALLET",
    "OTHER",
  ] as const;
  
export type ItemType =
  | "CARTON"
  | "BOX"
  | "SACK"
  | "EQUIPMENT"
  | "PALLET"
  | "OTHER";

export interface ItemOwnerOption {
  id: string;
  name: string;
  type: "COMPANY" | "CUSTOMER";
}

export interface CreateItemInput {
  itemName: string;
  itemType: ItemType;
  itemModel?: string;
  itemBrand?: string;
  weightGrams?: number;
  notes?: string;
  itemDimension?: {
    length?: number;
    width?: number;
    height?: number;
  };
  itemBarcode?: string;
  ownerId: string;
  ownerType: "COMPANY" | "CUSTOMER";
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}
