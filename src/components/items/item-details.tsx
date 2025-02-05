"use client";

import { useEffect, useState } from "react";
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, FormItem, FormLabel } from "../ui/form";
import { COUNTRIES } from "@/constants/countries";
import { toast } from "@/hooks/use-toast";
import { useUpdateItem } from "@/hooks/useUpdateItem";
import { useQueryClient } from "@tanstack/react-query";
// import { packingTypeOptions } from "@/lib/validations/item";
// import { getUsername } from "@/app/api/users/[userId]/route";

interface ItemDetailsProps {
  item: Item;
  // onUpdate: Item;
  onUpdate?: (updatedItem: Item) => void; // New callback to update the parent's item

  // onSave: (updatedItem: Item) => Promise<void>;
  onDelete: (item: Item) => Promise<void>;
  onClose: () => void;
}

// Update the options mapping for select fields for reusability.
const fieldConfigs = {
  itemNumber: { label: "Item Number", type: "text", readonly: true },
  itemName: { label: "Item Name", type: "text" },
  itemType: {
    label: "Type",
    type: "select",
    options: itemTypes.map((type) => ({ value: type, label: type })),
  },
  itemBrand: { label: "Brand", type: "text" },
  itemModel: { label: "Model", type: "text" },
  itemBarcode: { label: "Barcode", type: "text" },
  dimensions: { label: "Dimensions", type: "json" },
  weightGrams: { label: "Weight (g)", type: "number" },
  notes: { label: "Notes", type: "textarea" },
  customerName: { label: "Owner", type: "text", readonly: true },
  stock: { label: "Stock", type: "json", readonly: true },
  itemCountryOfOrigin: {
    label: "Country of Origin",
    type: "select",
    options: COUNTRIES.map((country) => ({
      value: country.value,
      label: country.label,
    })),
  },
  createdBy: { label: "Created By", type: "text", readonly: true },
  createdAt: { label: "Created At", type: "date", readonly: true },
  updatedAt: { label: "Updated At", type: "date", readonly: true },
};

// Helper function to convert empty strings to null
function transformEmptyStrings<T extends object>(data: T): T {
  return Object.fromEntries(
    Object.entries(data as Record<string, unknown>).map(([key, value]) =>
      typeof value === "string" && value.trim() === ""
        ? [key, null]
        : [key, value]
    )
  ) as T;
}

// Helper function to get only fields that changed
function getChangedFields<T extends object>(
  original: T,
  updated: T
): Partial<T> {
  const changes: Partial<T> = {};
  for (const key in updated) {
    console.log("NEW", JSON.stringify(updated[key]));
    console.log("original", JSON.stringify(original[key]));
    // Use JSON.stringify for a simple value comparison.
    if (
      JSON.stringify(updated[key]) !== JSON.stringify((original as any)[key])
    ) {
      changes[key] = updated[key];
    }
  }
  console.log(changes);
  return changes;
}

export function ItemDetails({
  item,
  // onSave,
  onDelete,
  onClose,
  onUpdate,
}: ItemDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<Item>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      // itemName: item.itemName,
      // itemType: item.itemType,
      // itemBrand: item.itemBrand,
      // itemModel: item.itemModel,
      // itemBarcode: item.itemBarcode,
      // itemCountryOfOrigin: item.itemCountryOfOrigin || "",
      // packingType: item.packingType,
      // weightGrams: item.weightGrams,
      // dimensions: item.dimensions,
      // notes: item.notes,
    },
  });

  // Reset the form values when the selected item changes
  useEffect(() => {
    reset({
      itemName: item.itemName,
      itemType: item.itemType,
      itemBrand: item.itemBrand || null,
      itemModel: item.itemModel || null,
      itemBarcode: item.itemBarcode || null,
      itemCountryOfOrigin: item.itemCountryOfOrigin || null,
      packingType: item.packingType,
      weightGrams: item.weightGrams || 0,
      dimensions: item.dimensions || {
        width: undefined,
        height: undefined,
        length: undefined,
      },
      notes: item.notes || null,
    });
    setIsEditing(false);
  }, [item, reset]);

  const queryClient = useQueryClient();

  const updateMutation = useUpdateItem();

  const handleSave = async (original: Item, data: Item) => {
    setIsSaving(true);
    const normalizedData = transformEmptyStrings<Item>(data);
    const changedData = getChangedFields(original, normalizedData);

    // Always include the primary key.
    changedData.itemId = original.itemId;

    console.log("Normalized Data:", normalizedData);
    console.log("Changed Data:", changedData);

    // If nothing other than itemId changed, then skip update.
    if (Object.keys(changedData).length <= 1) {
      toast({
        title: "No changes",
        description: "No fields were updated",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    try {
      // Trigger your mutation using only the changed fields.
      const updatedItem = await updateMutation.mutateAsync(changedData as Item);
      queryClient.invalidateQueries({ queryKey: ["items"] });
      reset(updatedItem); // Refresh local details view
      setIsEditing(false);
      setShowConfirm(false);
      toast({
        title: "Success",
        description: "Item saved successfully",
      });
      if (onUpdate) {
        onUpdate(updatedItem);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "Failed to save the item",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // A helper that renders a field either in display or editing mode.
  const renderField = (key: keyof Item, config: any) => {
    const value = item[key];

    if (!isEditing) {
      // Display mode – handle special cases like dates and dimensions.
      if (key === "createdAt" || key === "updatedAt") {
        return (
          <div className="text-sm">
            {value
              ? formatInTimeZone(
                  toDate(value!.toString()),
                  "Asia/Dubai",
                  "EEE, dd-MM-yyyy  HH:mm a"
                )
              : "N/A"}
          </div>
        );
      }
      if (key === "dimensions") {
        return (
          <div className="flex gap-2">
            <div className="flex-1 bg-muted/50 rounded-md p-2 text-center">
              <div className="text-xs text-muted-foreground">W</div>
              <div className="text-sm font-medium">
                {typeof value === "object" && value !== null && "width" in value
                  ? (value as { width?: number }).width
                  : "N/A"}
              </div>
            </div>
            <div className="flex-1 bg-muted/50 rounded-md p-2 text-center">
              <div className="text-xs text-muted-foreground">H</div>
              <div className="text-sm font-medium">
                {typeof value === "object" &&
                value !== null &&
                "height" in value
                  ? (value as { height?: number }).height
                  : "N/A"}
              </div>
            </div>
            <div className="flex-1 bg-muted/50 rounded-md p-2 text-center">
              <div className="text-xs text-muted-foreground">L</div>
              <div className="text-sm font-medium">
                {typeof value === "object" &&
                value !== null &&
                "length" in value
                  ? (value as { length?: number }).length
                  : "N/A"}
              </div>
            </div>
          </div>
        );
      }
      if (config.type === "select") {
        const option = config.options?.find(
          (opt: { value: string }) => opt.value === value
        );
        return <div className="text-sm">{option ? option.label : "N/A"}</div>;
      }
      return <div className="text-sm">{value?.toString() || "N/A"}</div>;
    } else {
      // Editing mode – use react-hook-form's register/Controller for controlled inputs
      switch (config.type) {
        case "select":
          return (
            <Controller
              name={key}
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${config.label}...`} />
                  </SelectTrigger>
                  <SelectContent>
                    {config.options?.map(
                      (option: { value: string; label: string }) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          );
        case "textarea":
          return <Textarea {...register(key)} className="w-full" />;
        case "json":
          if (key === "dimensions") {
            return (
              <div className="flex gap-2">
                <Controller
                  name="dimensions.width"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      placeholder="Width"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="text-center"
                    />
                  )}
                />
                <Controller
                  name="dimensions.height"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      placeholder="Height"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="text-center"
                    />
                  )}
                />
                <Controller
                  name="dimensions.length"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      placeholder="Length"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="text-center"
                    />
                  )}
                />
              </div>
            );
          }
          break;
        default:
          return (
            <Input
              type={config.type}
              {...register(key)}
              readOnly={config.readonly}
              className={config.readonly ? "bg-muted/50" : ""}
            />
          );
      }
      return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-background border rounded-md p-4 overflow-hidden">
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
                    // Reset the form values and exit editing mode
                    reset(item);
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
                <Controller
                  name="itemType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemTypes.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="text-xs"
                          >
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              ) : (
                <p className="text-sm font-medium">{item.itemType || "N/A"}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Brand</Label>
              {isEditing ? (
                <Input
                  {...register("itemBrand")}
                  className="h-8 text-xs"
                  placeholder="Enter brand"
                />
              ) : (
                <p className="text-sm font-medium">{item.itemBrand || "N/A"}</p>
              )}
            </div>
          </div>

          {/* Main Details */}
          <div className="grid gap-3 ">
            {Object.entries(fieldConfigs)
              .filter(
                ([key]) =>
                  !["itemNumber", "itemType", "itemBrand"].includes(key)
              )
              .map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground w-1/3">
                    {config.label}
                  </Label>
                  <div className="bg-background rounded-md w-2/3 p-2">
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
              <AlertDialogAction
                disabled={isSaving}
                onClick={() => {
                  console.log("Save button clicked", );
                  // Use handleSubmit to validate and get the form data
                  const submitFn = handleSubmit((data) => {
                    console.log(
                      "handleSubmit fired. Data:",
                      data,
                      "Item:",
                      item
                    );
                    handleSave(item, data);
                  });
                  submitFn();
                }}
              >
                {isSaving ? "Saving..." : "Save Changes"}
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
