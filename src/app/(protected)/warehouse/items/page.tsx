"use client";
import { ItemsTable } from "@/components/items/items-table";

export default function ItemsPage() {
  return (
    <div className="h-full flex flex-col">
      {/* <div className="flex-none pb-4"> */}
        {/* <h2 className="text-3xl font-bold tracking-tight">Items Title</h2> */}
      {/* </div> */}
      <div className="flex-1 min-h-0"> {/* min-h-0 is crucial here */}
        <ItemsTable />
      </div>
    </div>
  );
}