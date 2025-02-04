// "use cache";

import { useState, useEffect, useRef, useMemo } from "react";
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
import { getColumns } from "./columns";
import { itemSchema, Item } from "./types";
import { ItemDetails } from "./item-details";
import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import { CreateItemDialog } from "./create-item-dialog";
import { Edit, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

import { useDebounce } from "@/hooks/use-debounce";
import { useItems } from "@/hooks/useItems";
import { CACHE_KEY } from '@/lib/config/cache';
import { TableSkeleton } from '@/components/common/data-table/skeleton';
import { filterAndSortItems } from './items-filter';


export function ItemsTable() {
  // States
  const [sorting, setSorting] = useState<SortingState>([
    { 
      id: 'itemNumber' as keyof Item, 
      desc: false 
    }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [localData, setLocalData] = useState<Item[]>([]);

  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [updatedItemId, setUpdatedItemId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  });

  const [globalFilter, setGlobalFilter] = useState("");

  const queryClient = useQueryClient();

  const form = useForm<Item>({
    defaultValues: {},
    resolver: zodResolver(itemSchema),
  });

  const onEdit = (item: Item) => {
    console.log("Edit item:", item);
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const onDelete = (item: Item) => {
    setShowDeleteConfirm(true);
    setItemToDelete(item);
    console.log("Delete item:", item);
  };
  const columns = useMemo(
    () => getColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  );

  // Add debounce hook
  const debouncedSearch = useDebounce(globalFilter, 1);

  // Replace useQuery with useItems
    // const { allItems, isLoading, refresh, createItem } = useItems();
    const { allItems, loadData, isLoading } = useItems();

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Optimistic updates for new items
  const createItem = (newItem: Item) => {
    setLocalData(prev => [newItem, ...prev]);
  };

  // Refresh handler
  const handleRefresh = async () => {
    localStorage.removeItem(CACHE_KEY);
    await loadData(true); // Force full refresh
  };

  // Update processedItems to merge local and cached data
  const processedItems = useMemo(() => 
    filterAndSortItems(
      allItems, // Use directly from hook
      debouncedSearch,
      (sorting[0]?.id as keyof Item) || 'itemNumber',
      sorting[0]?.desc ? 'desc' : 'asc'
    ),
  [allItems, debouncedSearch, sorting]);

  // Update table data to use both sources
  const tableData = localData.length > 0 ? localData : processedItems;
  
  const table = useReactTable<Item>({
    data: tableData,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
      columnFilters,
      columnVisibility,
    },
    pageCount: processedItems.length,
    onSortingChange: (newSorting) => {
      if (Array.isArray(newSorting) && newSorting.length > 0) {
        handleSort(newSorting[0].id as keyof Item);
      }
      setSorting(newSorting);
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSort = (newSortBy: keyof Item) => {
    const newSortOrder =
      sorting[0]?.id === newSortBy && !sorting[0]?.desc ? "desc" : "asc";

    // Check local cache first
    const query = new URLSearchParams({
      page: (pagination.pageIndex + 1).toString(),
      limit: pagination.pageSize.toString(),
      sortBy: newSortBy,
      sortOrder: newSortOrder,
      search: debouncedSearch
    }).toString();

 
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed[query]) {
        setLocalData(parsed[query].data.items as Item[]);
      }
    }

    // Then trigger SWR revalidation
    queryClient.invalidateQueries({ queryKey: ["items"] });
  };

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
          itemCountryOfOrigin: updatedItem.itemCountryOfOrigin || null,
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

  const deleteItem = async (itemId: string) => {
    try {
      await fetch(`/api/items/${itemId}`, {
        method: 'DELETE'
      });
      // Refresh items after successful deletion
      await loadData(true); // Force refresh
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleDeleteItem = async (item: Item) => {
    try {
      await deleteItem(item.itemId);
      // Refetch items
      queryClient.invalidateQueries({ queryKey: ["items"] });

      // ON SUCCESS SHOW TOAST
      toast({
        title: "Item deleted",
        description: "Item deleted successfully",
      });
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

  // if (isLoading)
  //   return (
  //     <div className="flex items-center justify-center p-8">Loading...</div>
  //   );
  // if (isError)
  //   return (
  //     <div className="flex items-center justify-center p-8 text-red-500">
  //       Error loading items
  //     </div>
  //   );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none mb-4 space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight min-w-[100px]">
            Items
          </h2>
          <Input
            placeholder="Filter items..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="flex-1 max-w-2xl"
          />
          <CreateItemDialog onSuccess={(newItem) => {
            createItem(newItem);
            // refresh(); // Optional: Refresh in background
          }}>
            <Button>Create Item</Button>
          </CreateItemDialog>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton  />
      ) : (
        <div className="flex-1 min-h-0 flex">
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
                      <TableCell className="p-2 text-sm">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(row.original);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-200 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(row.original);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
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
          <div
            className={cn(
              "border-l relative transition-all duration-300 overflow-hidden",
              isDetailsPanelOpen ? "w-[400px]" : "w-[0px]"
            )}
          >
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
      )}

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
      {showDeleteConfirm && (
        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Item</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Are you sure you want to delete {itemToDelete?.itemName}?
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                onClick={() => handleDeleteItem(itemToDelete!)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <Button onClick={handleRefresh} variant="outline">
        Refresh Data
      </Button>
    </div>
  );
}