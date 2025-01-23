"use server";

import { getAllCustomers } from '@/lib/db/queries';
import CustomersTable from '@/components/customers/CustomersTable';
import { CompaniesTable } from '@/components/customers/CompaniesTable';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerPageClient } from '@/components/customers/CustomerPageClient';

export default async function CustomersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const customers = await getAllCustomers();
  
  return (
    <div className="p-8">
      <CustomerPageClient />
      <Tabs defaultValue="customers" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="customers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Customers</h2>
            <Button
              className="create-customer-button"
              data-modal-target="create-customer"
            >
              Add Customer
            </Button>
          </div>
          <CustomersTable initialCustomers={customers} />
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Companies</h2>
            <Button
              className="create-company-button"
              data-modal-target="create-company"
            >
              Add Company
            </Button>
          </div>
          <CompaniesTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
