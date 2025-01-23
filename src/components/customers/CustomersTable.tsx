"use client";

import { DataTable } from '@/components/common/data-table/data-table';
import { useCustomers } from '@/hooks/useCustomer';
import { Row } from '@tanstack/react-table';
import { type Customer } from '@/lib/db/schema';
import { useState } from 'react';

interface CustomersTableProps {
  initialCustomers: Customer[];
}

export default function CustomersTable({ initialCustomers }: CustomersTableProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  console.log('check customers', customers);
  const columns = [
    { header: 'Username', accessorKey: 'username' },
    { header: 'Name', accessorKey: 'firstName' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Company', accessorKey: 'company.name' },
    { 
      header: 'Created', 
      accessorKey: 'createdAt',
      cell: ({ row }: { row: Row<any> }) => new Date(row.original.createdAt).toLocaleDateString()
    }
  ];

  return (
    <DataTable
      data={customers ?? []}
      columns={columns}
    />
  );
}