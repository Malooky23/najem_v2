"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PencilIcon, SaveIcon, X, TrashIcon } from "lucide-react";
import { Item } from "@/lib/types";
import { format } from "date-fns";
import { itemTypes } from "@/lib/types";

interface ItemDetailsProps {
  item: Item;
  onSave: (updatedItem: Item) => Promise<void>;
  onDelete: (item: Item) => Promise<void>;
  onClose: () => void;
}

const readOnlyFields = ["itemNumber", "createdBy", "createdAt", "updatedAt"];

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
  createdBy: { label: "Created By", type: "text", readonly: true },
  createdAt: { label: "Created At", type: "date", readonly: true },
  updatedAt: { label: "Updated At", type: "date", readonly: true },
};

export function ItemDetails({ item, onSave, onDelete, onClose }: ItemDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedItem, setEditedItem] = useState(item);

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
      console.error('Save error:', error);
    }
  };

  const renderField = (key: keyof Item, config: any) => {
    const value = editedItem[key];
    
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
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {config.options.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
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

    return <div className="text-sm">{value?.toString() || "N/A"}</div>;
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-background ml-2 border rounded-md">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => isEditing ? setShowConfirm(true) : setIsEditing(true)}
              className="h-6 text-xs px-2"
            >
              {isEditing ? (
                <>
                  <SaveIcon className="h-3 w-3 mr-1" />
                  Save
                </>
              ) : (
                <>
                  <PencilIcon className="h-3 w-3 mr-1" />
                  Edit
                </>
              )}
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
                  onValueChange={(value) => setEditedItem({ ...editedItem, itemType: value })}
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
                  onChange={(e) => setEditedItem({ ...editedItem, itemBrand: e.target.value })}
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
              .filter(([key]) => !["itemNumber", "itemType", "itemBrand"].includes(key))
              .map(([key, config]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {config.label}
                  </Label>
                  <div className="bg-background rounded-md">
                    {renderField(key as keyof Item, config)}
                  </div>
                </div>
              ))}
          </div>
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
              <AlertDialogCancel onClick={() => setShowConfirm(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSave}>Save Changes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      {showDeleteConfirm && (
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Item?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete item #{item.itemNumber}. This action cannot be undone.
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