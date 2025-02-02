import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  Row,
  ColumnResizeMode,
} from "@tanstack/react-table";

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
import React from "react";
import { DataTablePagination } from "./data-table-pagination";
import { TableSkeleton } from "./skeleton";

interface DataTableProps<TData, TValue> {
  tableId: string
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  searchKey: string
  getRowSearchValue: (row: Row<TData>) => string
  pagination?: {
    pageIndex: number
    pageSize: number
    pageCount: number
    onPageChange: (newPage: number) => void
    onPageSizeChange: (newSize: number) => void
  }
  isLoading: boolean
}

export function DataTable<TData, TValue>({
  tableId,
  data,
  columns,
  searchKey,
  getRowSearchValue,
  pagination,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [columnSizing, setColumnSizing] = React.useState<Record<string, number>>({})
  const [sizingLoaded, setSizingLoaded] = React.useState(false)

  // Use table-specific storage key
  const storageKey = `table-sizes-${tableId}`

  // Load saved sizes before mount
  React.useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      setColumnSizing(JSON.parse(saved))
    }
    // Set sizing loaded even if no saved sizes found
    setSizingLoaded(true)
  }, [storageKey])

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnSizing: sizingLoaded ? columnSizing : {}, // Only apply sizing after load
      pagination: pagination ? {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      } : undefined,
    },
    onColumnSizingChange: (updater) => {
      const newSizing = typeof updater === 'function' ? updater(columnSizing) : updater
      setColumnSizing(newSizing)
      localStorage.setItem(storageKey, JSON.stringify(newSizing))
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: pagination?.pageCount,
    onPaginationChange: (updater) => {
      if (!pagination) return;
      const state = typeof updater === 'function' ? 
        updater({ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize }) : 
        updater;
      
      pagination.onPageChange(state.pageIndex);
      if (state.pageSize !== pagination.pageSize) {
        pagination.onPageSizeChange(state.pageSize);
      }
    },
    manualPagination: true, // Important! This tells the table we're handling pagination externally
    columnResizeMode: 'onChange',
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchableValue = getRowSearchValue(row)
      return searchableValue.toLowerCase().includes(filterValue.toLowerCase())
    },
  })

  // If sizing isn't loaded yet, render nothing - let Suspense show skeleton
  if (!sizingLoaded) {
    return <TableSkeleton />;
    // return <></>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border w-full overflow-x-auto">
        <Table className="relative">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    style={{ 
                      width: header.getSize(),
                      position: 'relative'
                    }}
                    className="border-x border-gray-200 select-none"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute right-[-4px] top-0 h-full w-[8px] cursor-col-resize 
                          group hover:bg-gray-400/50 active:bg-gray-400/50
                          ${header.column.getIsResizing() ? 'bg-gray-400/50' : ''}`}
                      >
                        <div className="absolute right-[3px] h-full w-[2px] bg-gray-200 group-hover:bg-gray-400 group-active:bg-gray-400" />
                      </div>
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && <DataTablePagination table={table} />}
    </div>
  );
}
