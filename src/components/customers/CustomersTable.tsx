// app/dashboard/customers/CustomersTable.tsx
"use client";

import { DataTable } from '@/components/common/data-table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { type Customer } from '@/server/db/schema';

interface CustomersTableProps {
  initialCustomers: (Customer & {
    individual?: {
      firstName: string;
      middleName?: string | null;
      lastName: string;
      personalID?: string | null;
    } | null;
    business?: {
      businessName: string;
      taxRegistrationNumber?: string | null;
    } | null;
    contactDetails?: Array<{
      contactType: 'email' | 'mobile' | 'landline' | 'other';
      contactData: string;
      isPrimary: boolean;
    }>;
  })[];
}

export function CustomersTable({ initialCustomers }: CustomersTableProps) {
  const columns: ColumnDef<CustomersTableProps['initialCustomers'][0]>[] = [
    {
      accessorKey: "customerType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.original.customerType === 'BUSINESS' ? 'default' : 'secondary'}>
          {row.original.customerType}
        </Badge>
      )
    },
    {
      header: "Name",
      cell: ({ row }) => {
        const customer = row.original;
        if (customer.customerType === 'INDIVIDUAL') {
          const individual = customer.individual;
          return individual 
            ? `${individual.firstName}${individual.middleName ? ' ' + individual.middleName : ''} ${individual.lastName}`
            : 'N/A';
        } else {
          return customer.business?.businessName ?? 'N/A';
        }
      }
    },
    {
      header: "Identifier",
      cell: ({ row }) => {
        const customer = row.original;
        return customer.customerType === 'INDIVIDUAL'
          ? customer.individual?.personalId ?? 'N/A'
          : customer.business?.taxRegistrationNumber ?? 'N/A';
      }
    },
    {
      accessorKey: "country",
      header: "Country"
    },
    {
      header: "Primary Contact",
      cell: ({ row }) => {
        const primaryContact = row.original.contactDetails?.find(c => c.isPrimary);
        return primaryContact 
          ? `${primaryContact.contactType}: ${primaryContact.contactData}`
          : 'N/A';
      }
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString()
    }
  ];

  return (
    <DataTable
      data={initialCustomers}
      columns={columns}
      searchKey="name"
      getRowSearchValue={(row) => {
        if (row.customerType === 'INDIVIDUAL') {
          return `${row.individual?.firstName || ''} ${row.individual?.lastName || ''}`;
        }
        return row.business?.businessName || '';
      }}
    />
  );
}