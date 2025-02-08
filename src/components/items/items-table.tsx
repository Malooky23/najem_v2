"use client";
import React, { useState, useMemo, useRef, Suspense, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useItems } from "@/hooks/useItems";
import { useDeleteItem } from "@/hooks/useDeleteItem";
import type { Item } from "./types";
import { getColumns } from "./columns";
import { columnConfigs } from "./columns-config";
import { ItemDetails } from "./item-details";
import { useUpdateItem } from "@/hooks/useUpdateItem";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Toolbar } from "./toolbar";
import { VirtualizedTable } from "./virtualized-table";
import { TableSkeleton } from "./table-skeleton";
import { fetchItems } from "@/lib/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function ItemsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [limit] = useState(50);

  // Get page from URL or default to 1
  const page = Number(searchParams.get('page') || 1);

  const {
    data,
    isLoading,
    isFetching,
    isPlaceholderData,
    refetch
  } = useItems(page, limit);

  // Add this type guard
  if (data && !Array.isArray(data.items)) {
    return null; // or handle invalid data case
  }

  const deleteMutation = useDeleteItem();

  const totalItemsRef = useRef(0);
  if (data?.total) {
    totalItemsRef.current = data.total;
  }
  const totalItems = totalItemsRef.current;
  const totalPages = Math.ceil(totalItems / limit);

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (item: Item) => {
          console.log("Edit item:", item);
        },
        onDelete: (item: Item) => handleDeleteItem(item),
      }),
    []
  );

  const table = useReactTable<Item>({
    data: data?.items || [],
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalColumnsWidth = useMemo(
    () =>
      columnConfigs.reduce((total, col) => total + (col.width || 0), 0),
    []
  );

  const parentRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const topSpacer = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const bottomSpacer =
    virtualizer.getTotalSize() -
    (virtualItems.length > 0 ? virtualItems[virtualItems.length - 1].end : 0);

  const handleDeleteItem = async (item: Item) => {
    try {
      await deleteMutation.mutateAsync(item.itemId);
      toast({
        title: "Item deleted",
        description: "Item deleted successfully",
      });
      refetch();
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
      setSelectedItem(null);
      setIsDetailsPanelOpen(false);
    } else {
      setSelectedItem(item);
      setIsDetailsPanelOpen(true);
    }
  };

  // Update URL when page changes
  const handleNextPage = () => {
    const nextPage = page + 1;
    const params = new URLSearchParams(searchParams);
    params.set('page', nextPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handlePreviousPage = () => {
    const prevPage = Math.max(page - 1, 1);
    const params = new URLSearchParams(searchParams);
    params.set('page', prevPage.toString());
    router.push(`?${params.toString()}`);
  };

  const queryClient = useQueryClient();
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // Add prefetching logic
  const prefetchNextPage = useCallback(() => {
    if (page < totalPages) {
      queryClient.prefetchQuery({
        queryKey: useItems.getQueryKey(page + 1, limit),
        queryFn: () => fetchItems(page + 1, limit),
      });
    }
  }, [page, totalPages, limit, queryClient]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          prefetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (nextButtonRef.current) {
      observer.observe(nextButtonRef.current);
    }

    return () => observer.disconnect();
  }, [prefetchNextPage]);

  return (
    <div className="h-full flex flex-col">
      <Toolbar
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        refetch={refetch}
      />

      {/* {isLoading && !data?.items?.length ? (
        <TableSkeleton />
      ) : ( */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="flex-1 flex overflow-hidden relative">
          {isFetching && isPlaceholderData && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <TableSkeleton />
            </div>
          )}
          <VirtualizedTable
            table={table}
            parentRef={parentRef}
            virtualItems={virtualItems}
            topSpacer={topSpacer}
            bottomSpacer={bottomSpacer}
            handleRowClick={handleRowClick}
            totalColumnsWidth={totalColumnsWidth}
          />
          {isDetailsPanelOpen && selectedItem && (
            <div className="transition-all duration-300 w-1/3 border-l overflow-auto">
              <ItemDetails
                key={selectedItem.itemId}
                item={selectedItem}
                onUpdate={(updatedItem: Item) => setSelectedItem(updatedItem)}
                onClose={() => {
                  setIsDetailsPanelOpen(false);
                  setSelectedItem(null);
                }}
                onDelete={(item: Item) => handleDeleteItem(item)}
              />
            </div>
          )}
        </div>
      )}



      <div className="mt-4 flex justify-center w-full">
        <Pagination>
          <PaginationContent className=" md:space-x-1"> {/* Adjusted space-x and added responsive md:space-x-4 */}
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePreviousPage}
                className="cursor-pointer"
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink isActive className="flex-grow w-full p-4"> {/* Added min-w and responsive md:min-w */}
                Page {page} of {totalPages}
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                onClick={handleNextPage}
                className="cursor-pointer"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

