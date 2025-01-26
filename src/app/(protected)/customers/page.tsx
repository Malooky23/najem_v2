"use server";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CustomerPageClient } from '@/components/customers/CustomerPageClient';
import { CustomersTable } from '@/components/customers/CustomersTable';
import { getCustomers } from '@/server/queries/customers';
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

export default async function CustomersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const customers = await getCustomers();
  
  return (
    <div className="p-8">
      <CustomerPageClient />
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Customers</TabsTrigger>
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">All Customers</h2>
            <div className="space-x-2">
              <Button
                className="create-customer-button"
                data-modal-target="create-customer"
              >
                Add Individual
              </Button>
              <Button
                className="create-business-button"
                data-modal-target="create-business"
                variant="secondary"
              >
                Add Business
              </Button>
            </div>
          </div>
          <Suspense fallback={<TableSkeleton />}>
            <CustomersTable initialCustomers={customers} />
          </Suspense>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Individual Customers</h2>
            <Button
              className="create-customer-button"
              data-modal-target="create-customer"
            >
              Add Individual
            </Button>
          </div>
          <Suspense fallback={<TableSkeleton />}>
            <CustomersTable 
              initialCustomers={customers.filter(c => c.customerType === 'INDIVIDUAL')} 
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Business Customers</h2>
            <Button
              className="create-business-button"
              data-modal-target="create-business"
              variant="secondary"
            >
              Add Business
            </Button>
          </div>
          <Suspense fallback={<TableSkeleton />}>
            <CustomersTable 
              initialCustomers={customers.filter(c => c.customerType === 'BUSINESS')} 
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
