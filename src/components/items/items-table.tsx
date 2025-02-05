"use client";
import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useItems } from "@/hooks/useItems";
import { useDeleteItem } from "@/hooks/useDeleteItem";
import type { Item } from "./types";
import { getColumns } from "./columns";
import { CreateItemDialog } from "./create-item-dialog";
import { ItemDetails } from "./item-details";
import { useUpdateItem } from "@/hooks/useUpdateItem";
import { error } from "console";
import { ActionsCell } from "./table-cells";

export function ItemsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);

  const queryClient = useQueryClient();
  const { allItems, isLoading, refetch } = useItems();
  const deleteMutation = useDeleteItem();
  const updateMutation = useUpdateItem();

  // Memoize columns (pass the onEdit & onDelete callbacks as needed)
  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (item: Item) => console.log("Edit item:", item),
        onDelete: (item: Item) => handleDeleteItem(item),
      }),
    []
  );

  const table = useReactTable<Item>({
    data: allItems,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDeleteItem = async (item: Item) => {
    try {
      await deleteMutation.mutateAsync(item.itemId);
      toast({
        title: "Item deleted",
        description: "Item deleted successfully",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the item.",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (item: Item) => {
    if (selectedItem?.itemId === item.itemId) {
      setIsDetailsPanelOpen(false);
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
      setIsDetailsPanelOpen(true);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none mb-4 space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Items</h2>
          <Input
            placeholder="Filter items..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="flex-1 max-w-2xl"
          />
          <CreateItemDialog
            onSuccess={(newItem: Item) => {
              queryClient.invalidateQueries({ queryKey: ["items"] });
            }}
          >
            <Button>Create Item</Button>
          </CreateItemDialog>
          <Button onClick={() => refetch()}>Refresh</Button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading items...</div>
      ) : (
        <div className="flex-1 min-h-0 flex overflow-hidden ">
          {/* Table container expands to full width when details pane is closed and shrinks when open */}
          <div
            className={`transition-all duration-300 overflow-auto border rounded-md ${
              isDetailsPanelOpen ? "w-2/3" : "w-full"
            }`}
          >
            {/* Ensure the table always fills its container and uses automatic layout */}
            <Table className="w-full table-auto ">
              <TableHeader className="sticky top-0 bg-background z-10  ">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="bg-muted/50 hover:bg-muted/50"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                      
                        key={header.id}
                        className="h-10 px-2 text-xs font-medium "
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => handleRowClick(row.original)}
                    className="cursor-pointer hover:bg-muted"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                    <ActionsCell/>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Details container: width transitions from 0 (closed) to 1/3 (open) */}
          <div
            className={`transition-all duration-300 overflow-auto border-l ${
              isDetailsPanelOpen ? "w-1/3" : "w-0"
            }`}
          >
            <div
              className={`transition-all duration-300 ${
                isDetailsPanelOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
            >
              {selectedItem && (
                <ItemDetails
                  key={selectedItem.itemId}
                  item={selectedItem}
                  onUpdate={(updatedItem: Item) => {
                    setSelectedItem(updatedItem);
                  }}
                  onClose={() => {
                    setIsDetailsPanelOpen(false);
                    setSelectedItem(null);
                  }}
                  onDelete={(item: Item) => handleDeleteItem(item)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
