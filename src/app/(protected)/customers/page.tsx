// "use server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CustomerPageClient } from '@/components/customers/CustomerPageClient';
import { CustomersTable } from '@/components/customers/CustomersTable';
import { getCustomers } from '@/server/queries/customers';
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { unstable_cache as cache } from 'next/cache';
import { isEmployee, guardEmployee } from "@/app/utils/isEmployee";
import { TableSkeleton } from "@/components/common/data-table/skeleton";

const CACHE_TAG = 'customers';
const REVALIDATE_TIME = 3600; // 1 hour in seconds

// Cached data fetcher
// const getCachedCustomers = cache(
//   async () => {
//     const customers = await getCustomers();
//     return customers;
//   },
//   ['get-customers'], 
//   {
//     tags: [CACHE_TAG],
//     revalidate: REVALIDATE_TIME
//   }
// );



export default async function CustomersPage() {
  await guardEmployee();
  
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
                className="create-individual-button"
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
            <CustomersTableWrapper />
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
            <CustomersTableWrapper type="INDIVIDUAL" />
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
            <CustomersTableWrapper type="BUSINESS" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}


async function CustomersTableWrapper({ type }: { type?: 'INDIVIDUAL' | 'BUSINESS' }) {
  const customers = await getCustomers();
  // console.log('Customers from getCachedCustomers() ', JSON.stringify(customers, null, 2));
  console.log('Customers from getCachedCustomers() ', customers.length);
  const filteredCustomers = type ? 
    customers.filter(c => c.customerType === type) : 
    customers;
  
  return (
    <CustomersTable 
      initialCustomers={filteredCustomers}
      pageSize={50}
      initialPage={1}
      isLoading={false}
    />
  );
}

// Add page-level revalidation
export const revalidate = 3600; 


