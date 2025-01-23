"use client";

import { DataTable } from '@/components/common/data-table/data-table';
import { useCompanies } from '@/hooks/useCompany';

export function CompaniesTable() {
  const { data: companies, isLoading } = useCompanies();
console.log('check companies', companies);
  const columns = [
    { header: 'Name', accessorKey: 'compName' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'TRN', accessorKey: 'trn' },
    { header: 'Mobile', accessorKey: 'mobile' },
    { header: 'Landline', accessorKey: 'landline' },
    // { header: 'Notes', accessorKey: 'notes' },
    // Add more columns as needed
  ];

  return (
    <DataTable
      data={companies ?? []}
      columns={columns}
      isLoading={isLoading}
    />
  );
} 