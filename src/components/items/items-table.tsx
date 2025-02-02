"use client";

import { useState, useEffect, useRef } from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { columns } from "./columns";
import { Item, itemSchema } from "./types";
import { ItemDetails } from "./item-details";
import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import { CreateItemDialog } from "./create-item-dialog";

export function ItemsTable() {
  // States
  const [sorting, setSorting] = useState<SortingState>([
    { id: "itemNumber", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [updatedItemId, setUpdatedItemId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  });

  const queryClient = useQueryClient();

  const form = useForm<Item>({
    defaultValues: {},
    resolver: zodResolver(itemSchema),
  });

  // Single query with all parameters
  const {
    data: itemsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['items', pagination.pageIndex, pagination.pageSize, sorting, globalFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
        search: globalFilter,
        sortBy: sorting[0]?.id || 'itemNumber',
        sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
      });

      const response = await fetch(`/api/items?${params}`);
      if (!response.ok) throw new Error('Network error');
      return response.json();
    },
  });

  // Single table configuration
  const table = useReactTable({
    data: itemsData?.items ?? [],
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
      columnFilters,
      columnVisibility,
    },
    pageCount: itemsData?.metadata?.totalPages ?? -1,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSaveItem = async (updatedItem: Item) => {
    try {
      const response = await fetch(`/api/items/${updatedItem.itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: updatedItem.itemName,
          itemType: updatedItem.itemType,
          itemBrand: updatedItem.itemBrand || null,
          itemModel: updatedItem.itemModel || null,
          itemBarcode: updatedItem.itemBarcode || null,
          dimensions: updatedItem.dimensions,
          weightGrams: updatedItem.weightGrams || null,
          notes: updatedItem.notes || null,
          customerId: updatedItem.customerId || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      // Show update animation
      setUpdatedItemId(updatedItem.itemId);
      setTimeout(() => setUpdatedItemId(null), 1000);

      // Refetch items while maintaining sort
      queryClient.invalidateQueries({ queryKey: ["items"] });
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleDeleteItem = async (item: Item) => {
    try {
      const response = await fetch(`/api/items/${item.itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      // Refetch items
      queryClient.invalidateQueries({ queryKey: ["items"] });
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleRowClick = (item: Item) => {
    if (isDetailsPanelOpen && selectedItem?.itemId === item.itemId) {
      setIsDetailsPanelOpen(false);
    } else {
      setSelectedItem(item);
      setIsDetailsPanelOpen(true);
    }

  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-8">Loading...</div>
    );
  if (isError)
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        Error loading items
      </div>
    );

  return (
    <div className="h-full flex flex-col ">
      <div className="flex-none mb-4 space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight min-w-[100px]">Items</h2>
          <Input
            placeholder="Filter items..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="flex-1 max-w-2xl"
          />
          <CreateItemDialog>
            <Button>Create Item</Button>
          </CreateItemDialog>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex ">
        <div className="flex-1 overflow-auto border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-muted/50 hover:bg-muted/50"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-10 px-2 text-xs font-medium"
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "group hover:bg-slate-100 hover:border-orange-900  transition-all duration-50 cursor-pointer border-b",
                      updatedItemId === row.original.itemId &&
                      "animate-highlight"
                    )}
                    onClick={() => handleRowClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="p-2 text-sm  ">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                        
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>



        {/* <div className="w-[400px] border-l relative "> */}
        <div className={cn(
        "border-l relative transition-all duration-300 overflow-hidden",
        isDetailsPanelOpen ? "w-[400px]" : "w-[0px]"
      )}>
          {selectedItem && (
            <FormProvider {...form}>
              <ItemDetails
                item={selectedItem}
                onClose={() => setIsDetailsPanelOpen(false)}
                onSave={handleSaveItem}
                onDelete={handleDeleteItem}
              />
            </FormProvider>
          )}
        </div>

        {/* {isDetailsPanelOpen && (
          )} */}
      </div>

      <div className="flex-none mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div>
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex items-center space-x-1">
              <span>Show</span>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>per page</span>
            </div>
          </div>
          {table.getPageCount() > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium">Page</p>
                <span className="text-sm font-medium">
                  {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

