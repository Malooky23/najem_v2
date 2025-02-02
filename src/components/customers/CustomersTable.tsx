// app/dashboard/customers/CustomersTable.tsx
"use client";

import { DataTable } from "@/components/common/data-table/data-table";
import { ColumnDef, type Row } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { type EnrichedCustomer } from "@/lib/types/customer";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

interface CustomersTableProps {
  initialCustomers: EnrichedCustomer[];
  pageSize?: number;
  initialPage?: number;
  isLoading?: boolean;
}

export function CustomersTable({
  initialCustomers,
  pageSize = 50,
  initialPage = 1,
  isLoading = false,
}: CustomersTableProps) {
  const [page, setPage] = useState(initialPage);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const start = (page - 1) * currentPageSize;
  const end = start + currentPageSize;
  const paginatedCustomers = initialCustomers.slice(start, end);
  const totalPages = Math.ceil(initialCustomers.length / currentPageSize);

  
  const columns: ColumnDef<CustomersTableProps["initialCustomers"][0]>[] = [
    {
      size: 5,
      enableResizing: true,
      accessorKey: "customerType",
      header: () => <div className="text-center">Type</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <Badge
            variant={
              row.original.customerType === "BUSINESS" ? "default" : "secondary"
            }
          >
            {row.original.customerType}
          </Badge>
        </div>
      ),
    },
    {
      size: 20,
      accessorKey: "customerNumber",
      header: () => <div className="text-center">ID</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.customerNumber}</div>
      ),
    },
    {
      // accessorKey: "customerSearch",
      header: "Name",
      size: 200,
      enableResizing: true,
      cell: ({ row }) => {
        const customer = row.original;
        const fullName =
          customer.customerType === "INDIVIDUAL"
            ? customer.individual
              ? `${customer.individual.firstName}${
                  customer.individual.middleName
                    ? " " + customer.individual.middleName
                    : ""
                } ${customer.individual.lastName}`
              : "N/A"
            : customer.business?.businessName ?? "N/A";

        return (
          <div className="max-w-[200px] w-[200px] truncate">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">{fullName}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{fullName}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
    {
      header: "Identifier",
      cell: ({ row }) => {
        const customer = row.original;
        return customer.customerType === "INDIVIDUAL"
          ? customer.individual?.personalId ?? "N/A"
          : customer.business?.taxRegistrationNumber ?? "N/A";
      },
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => {
        const country = row.original.country;
        return country ? country : "N/AA";
      },
    },
    // {
    //   header: "Primary Contact",
    //   cell: ({ row }) => {
    //     const primaryContact = row.original.contactDetails?.find(c => c.isPrimary);
    //     return primaryContact
    //       ? `${primaryContact.contactType}: ${primaryContact.contactData}`
    //       : 'N/A';
    //   }
    // },
    {
      accessorKey: "createdAt",
      header: () => <div className="text-center">Created</div>,
      cell: ({ row }) => (
        <div className="whitespace-nowrap text-center">
          {format(row.original.createdAt, "MMM dd, yy")}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      tableId="customers"
      data={paginatedCustomers}
      columns={columns}
      searchKey="customerSearch"
      pagination={{
        pageIndex: page - 1,
        pageSize: currentPageSize,
        pageCount: totalPages,
        onPageChange: (newPage) => setPage(newPage + 1),
        onPageSizeChange: setCurrentPageSize,
      }}
      isLoading={isLoading}
      getRowSearchValue={(row) => {
        const customer = row.original;
        const searchableValues = [
          // Customer type
          customer.customerType,
          // Name fields
          customer.customerType === "INDIVIDUAL"
            ? `${customer.individual?.firstName || ""} ${
                customer.individual?.middleName || ""
              } ${customer.individual?.lastName || ""}`
            : customer.business?.businessName || "",
          // Identifier
          customer.customerType === "INDIVIDUAL"
            ? customer.individual?.personalId || ""
            : customer.business?.taxRegistrationNumber || "",
          // Country
          customer.country || "",
          // Customer number
          customer.customerNumber?.toString() || "",
          // Contact details
          ...(customer.contactDetails?.map(
            (c) => `${c.contactType} ${c.contactData}`
          ) || []),
          // Created date
          new Date(customer.createdAt).toLocaleDateString(),
        ];

        return searchableValues.join(" ").toLowerCase();
      }}
    />
  );
}
