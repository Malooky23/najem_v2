"use client";

import { useState } from "react";
import { DataTable } from "@/components/common/data-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CreateOrderDialog } from "./create-order-dialog";
import { useOrders } from "@/hooks/useOrders";
import { toast } from "@/hooks/use-toast";
import type { Order } from "./types";

export function OrdersTable() {
  const [page, setPage] = useState(1);
  const { data: orders = [], isLoading, refetch } = useOrders();
  const pageSize = 50;
  const totalPages = Math.ceil(orders.length / pageSize);
  const paginatedOrders = orders.slice((page - 1) * pageSize, page * pageSize);

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order #",
    },
    {
      accessorKey: "customerName",
      header: "Customer",
    },
    {
      accessorKey: "orderDate",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.orderDate);
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => `$${row.original.total.toFixed(2)}`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Orders</h2>
        <div className="flex gap-4">
          <CreateOrderDialog onSuccess={refetch}>
            <Button>Create Order</Button>
          </CreateOrderDialog>
          <Button onClick={() => refetch()}>Refresh</Button>
        </div>
      </div>
      <DataTable
        tableId="orders"
        data={paginatedOrders}
        columns={columns}
        pagination={{
          pageIndex: page - 1,
          pageSize,
          pageCount: totalPages,
          onPageChange: (newPage) => setPage(newPage + 1),
          onPageSizeChange: (newSize) => {}, // implement if needed
        }}
        isLoading={isLoading}
        searchKey="orderSearch"
        getRowSearchValue={(row) => {
          const order = row.original;
          return `${order.orderNumber} ${order.customerName} ${order.status} ${order.total}`.toLowerCase();
        }}
      />
    </div>
  );
} 