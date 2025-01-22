import { ItemsTable } from "@/components/items/items-table";
// export default function ItemsPage() {
//   return (
//     <div className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
//       <div className="flex-none p-4 pb-2">
//         <h2 className="text-3xl font-bold tracking-tight">Items</h2>
//       </div>
//       <div className="flex-1 p-4 pt-2 overflow-hidden">
//         <ItemsTable />
//       </div>
//     </div>
//   );
// }

// export default function ItemsPage() {
//     return (
//       <div className="h-full overflow-hidden flex flex-col">
//         <div className="flex-none p-4 pb-2">
//           <h2 className="text-3xl font-bold tracking-tight">Items</h2>
//         </div>
//         <div className="flex-1 p-4 pt-2 overflow-hidden">
//           <ItemsTable />
//         </div>
//       </div>
//     );
//   }

export default function ItemsPage() {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-none pb-4">
          {/* <h2 className="text-3xl font-bold tracking-tight">Items Title</h2> */}
        </div>
        <div className="flex-1 min-h-0"> {/* min-h-0 is crucial here */}
          <ItemsTable />
        </div>
      </div>
    );
  }