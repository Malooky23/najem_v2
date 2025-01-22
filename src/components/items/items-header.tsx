"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateItemDialog } from "@/components/items/create-item-dialog";

export function ItemsHeader() {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold tracking-tight">Items</h1>
      <CreateItemDialog>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Item
        </Button>
      </CreateItemDialog>
    </div>
  );
}