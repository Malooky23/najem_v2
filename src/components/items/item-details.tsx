"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PencilIcon, SaveIcon, X, TrashIcon } from "lucide-react";
import { Item, itemTypes, itemSchema, packingTypeOptions } from "./types";
import { formatInTimeZone, toDate } from "date-fns-tz";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, FormItem, FormLabel } from "../ui/form";
import { COUNTRIES } from "@/constants/countries";
// import { packingTypeOptions } from "@/lib/validations/item";
// import { getUsername } from "@/app/api/users/[userId]/route";

interface ItemDetailsProps {
  item: Item;
  onSave: (updatedItem: Item) => Promise<void>;
  onDelete: (item: Item) => Promise<void>;
  onClose: () => void;
}

const readOnlyFields = [
  "itemNumber",
  "stock",
  "createdBy",
  "createdAt",
  "updatedAt",
];

const fieldConfigs = {
  itemNumber: { label: "Item Number", type: "text", readonly: true },
  itemName: { label: "Name", type: "text" },
  itemType: { label: "Type", type: "select", options: itemTypes },
  itemBrand: { label: "Brand", type: "text" },
  itemModel: { label: "Model", type: "text" },
  itemBarcode: { label: "Barcode", type: "text" },
  dimensions: { label: "Dimensions", type: "json" },
  weightGrams: { label: "Weight (g)", type: "number" },
  notes: { label: "Notes", type: "textarea" },
  customerName: { label: "Owner", type: "text",  },
  stock: { label: "Stock", type: "json", readonly: true },
  itemCountryOfOrigin: { 
    label: "Country of Origin", 
    type: "select", 
    options: COUNTRIES 
  },
  createdBy: { label: "Created By", type: "text", readonly: true },
  createdAt: { label: "Created At", type: "date", readonly: true },
  updatedAt: { label: "Updated At", type: "date", readonly: true },
};

export function ItemDetails({
  item,
  onSave,
  onDelete,
  onClose,
}: ItemDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedItem, setEditedItem] = useState(item);

  const form = useForm<Item>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      itemName: item.itemName,
      itemType: item.itemType,
      itemBrand: item.itemBrand || "",
      itemModel: item.itemModel || "",
      itemBarcode: item.itemBarcode || "",
      itemCountryOfOrigin: item.itemCountryOfOrigin || '',
      packingType: item.packingType,
      weightGrams: item.weightGrams || 0,
      dimensions: item.dimensions || { width: 0, height: 0, length: 0 },
      notes: item.notes || "",
    },
  });

  // Reset edited item when the selected item changes
  useEffect(() => {
    setEditedItem(item);
    setIsEditing(false); // Reset editing state when switching items
  }, [item]);



  const handleSave = async () => {
    try {
      await onSave(editedItem);
      setIsEditing(false);
      setShowConfirm(false);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // Here we render the field values
  const renderField = (key: keyof Item, config: any) => {
    let value = editedItem[key];
    
    // We convert date from DB UTC to GMT +4
    if (key === "createdAt" || key === "updatedAt") {
      if (value) {
        value = formatInTimeZone(
          toDate(value!.toString()),
          "Asia/Dubai",
          "EEE, dd-MM-yyyy  HH:mm a"
        );
      }
    }

    // Set the item creator username after looking up from created_by userId
    //Maybe there is a better way to do this
    if (key === "dimensions") {
      if (isEditing) {
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Width"
              value={editedItem.dimensions?.width || ""}
              onChange={(e) => 
                setEditedItem({
                  ...editedItem,
                  dimensions: {
                    ...editedItem.dimensions,
                    width: Number(e.target.value)
                  }
                })
              }
              className="text-center"
            />
            <Input
              type="number"
              placeholder="Height"
              value={editedItem.dimensions?.height || ""}
              onChange={(e) => 
                setEditedItem({
                  ...editedItem,
                  dimensions: {
                    ...editedItem.dimensions,
                    height: Number(e.target.value)
                  }
                })
              }
              className="text-center"
            />
            <Input
              type="number"
              placeholder="Length"
              value={editedItem.dimensions?.length || ""}
              onChange={(e) => 
                setEditedItem({
                  ...editedItem,
                  dimensions: {
                    ...editedItem.dimensions,
                    length: Number(e.target.value)
                  }
                })
              }
              className="text-center"
            />
          </div>
        );
      }
      return (
        <div className="flex gap-2">
          <div className="flex-1 bg-muted/50 rounded-md p-2 text-center">
            <div className="text-xs text-muted-foreground">W</div>
            <div className="text-sm font-medium">
              {editedItem.dimensions?.width || "N/A"}
            </div>
          </div>
          <div className="flex-1 bg-muted/50 rounded-md p-2 text-center">
            <div className="text-xs text-muted-foreground">H</div>
            <div className="text-sm font-medium">
              {editedItem.dimensions?.height || "N/A"}
            </div>
          </div>
          <div className="flex-1 bg-muted/50 rounded-md p-2 text-center">
            <div className="text-xs text-muted-foreground">L</div>
            <div className="text-sm font-medium">
              {editedItem.dimensions?.length || "N/A"}
            </div>
          </div>
        </div>
      );
    }

    if (!isEditing && readOnlyFields.includes(key)) {
      return <div className="text-sm">{value?.toString() || "N/A"}</div>;
    }

    if (!isEditing && readOnlyFields.includes(key)) {
      return <div className="text-sm">{value?.toString() || "N/A"}</div>;
    }

    if (isEditing) {
      switch (config.type) {
        case "select":
          return (
            <Select
              value={value?.toString() || ""}
              onValueChange={(newValue) =>
                setEditedItem({ ...editedItem, [key]: newValue })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Country..." />
              </SelectTrigger>
              <SelectContent>
                {config.options.map((option: { value: string; label: string }) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        case "textarea":
          return (
            <Textarea
              value={value?.toString() || ""}
              onChange={(e) =>
                setEditedItem({ ...editedItem, [key]: e.target.value })
              }
            />
          );
        default:
          return (
            <Input
              type={config.type}
              value={value?.toString() || ""}
              onChange={(e) =>
                setEditedItem({ ...editedItem, [key]: e.target.value })
              }
              readOnly={config.readonly}
            />
          );
      }
    }

    return (
      <div className="text-sm">
        {config.options?.find((opt: { value: string }) => opt.value === value)?.label || "N/A"}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-background ml-2 border rounded-md ">
      {/* Header - fixed height */}
      <div className="flex-none border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-between items-center p-3">
          <div className="flex flex-col">
            <h3 className="text-sm font-medium leading-none">Item Details</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              #{item.itemNumber}
            </p>
          </div>
          <div className="flex gap-1">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfirm(true)}
                  className="h-6 text-xs px-2"
                >
                  <SaveIcon className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditedItem(item); // Reset to original item
                    setIsEditing(false);
                  }}
                  className="h-6 text-xs px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-6 text-xs px-2"
                >
                  <PencilIcon className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="h-6 text-xs px-2 text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <TrashIcon className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content - scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-4">
          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-2 p-2 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Type</Label>
              {isEditing ? (
                <Select
                  value={editedItem.itemType ?? undefined}
                  onValueChange={(value) =>
                    setEditedItem({ ...editedItem, itemType: value })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-xs">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm font-medium">{item.itemType || "N/A"}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Brand</Label>
              {isEditing ? (
                <Input
                  value={editedItem.itemBrand || ""}
                  onChange={(e) =>
                    setEditedItem({ ...editedItem, itemBrand: e.target.value })
                  }
                  className="h-8 text-xs"
                  placeholder="Enter brand"
                />
              ) : (
                <p className="text-sm font-medium">{item.itemBrand || "N/A"}</p>
              )}
            </div>
          </div>

          {/* Main Details */}
          <div className="grid gap-3">
            {Object.entries(fieldConfigs)
              .filter(
                ([key]) =>
                  !["itemNumber", "itemType", "itemBrand"].includes(key)
              )
              .map(([key, config]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-sm text-muted-foreground">
                    {config.label}
                  </Label>
                  <div className="bg-background rounded-md">
                    {renderField(key as keyof Item, config)}
                  </div>
                </div>
              ))}
          </div>

          {/* Add new fields */}
          {/* <FormField
            control={form.control}
            name="packingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Packing Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "NONE"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select packing type" />
                  </SelectTrigger>
                  <SelectContent>
                    {packingTypeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.toLowerCase().replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          /> */}
        </div>
      </div>

      {/* Alert Dialogs */}
      {showConfirm && (
        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save Changes?</AlertDialogTitle>
              <AlertDialogDescription>
                This will update the item details. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowConfirm(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleSave}>
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {showDeleteConfirm && (
        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Item?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete item #{item.itemNumber}. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await onDelete(item);
                  onClose();
                }}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
