"use client";
import { TableSkeleton } from "@/components/common/data-table/skeleton";
import { ItemsTable } from "@/components/items/items-table";
import { Suspense } from "react";

export default function ItemsPage() {
  return (
    <div className="h-full flex flex-col">
      {/* <div className="flex-none pb-4"> */}
      {/* <h2 className="text-3xl font-bold tracking-tight">Items Title</h2> */}
      {/* </div> */}
      <div className="flex-1 min-h-0">
        {" "}
        {/* min-h-0 is crucial here */}
        <Suspense fallback={<TableSkeleton />}>
          <ItemsTable />
        </Suspense>
      </div>
    </div>
  );
}
