// // ...existing code...

// export const columnConfigs = [
//   {
//     key: 'itemNumber',
//     label: '#',
//     width: 80,
//     minWidth: 60,
//     priority: 1, // Always show
//   },
//   {
//     key: 'itemName',
//     label: 'Name',
//     width: 300,
//     minWidth: 200,
//     priority: 1, // Always show
//     grow: 1, // Allow this column to grow
//   },
//   {
//     key: 'itemType',
//     label: 'Type',
//     width: 120,
//     minWidth: 100,
//     priority: 2,
//     align: 'center', // Add alignment property
//   },
//   {
//     key: 'customerName',
//     label: 'Owner',
//     width: 200,
//     minWidth: 150,
//     priority: 3, // Will hide first when space is limited
//   },
//   // ... other column configs ...
// ] as const;

// export function getColumns({ onEdit, onDelete }: ColumnActions) {
//   return [
//     {
//       accessorKey: "itemNumber",
//       header: "Item #",
//       cell: ({ row }) => (
//         <div className="truncate" title={row.original.itemNumber}>
//           {row.original.itemNumber}
//         </div>
//       ),
//     },
//     {
//       accessorKey: "itemName",
//       header: "Name",
//       cell: ({ row }) => (
//         <div className="truncate" title={row.original.itemName}>
//           {row.original.itemName}
//         </div>
//       ),
//     },
//     {
//       accessorKey: "itemType",
//       header: () => (
//         <div className="text-center">Type</div>
//       ),
//       cell: ({ row }) => (
//         <div className="text-center truncate" title={row.original.itemType}>
//           {row.original.itemType}
//         </div>
//       ),
//     },
//     // ... other columns ...
//   ];
// }
