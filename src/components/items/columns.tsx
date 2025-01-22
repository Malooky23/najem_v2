"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Item } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TextCell, TypeCell } from "./table-cells";

type ColumnConfig = {
  key: string;
  header: string;
  sortable?: boolean;
  cellType?: 'text' | 'type' | 'owner';
};

const SortButton = ({ title, column }: { title: string; column: any }) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="p-0 hover:bg-transparent"
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};
SortButton.displayName = "SortButton";

const createHeader = (title: string, column: any, sortable: boolean = false) => {
  if (!sortable) return title;
  return <SortButton title={title} column={column} />;
};

const ItemCell = ({ row, columnKey, cellType }: { row: any; columnKey: string; cellType: string }) => {
  switch (cellType) {
    case 'type':
      return <TypeCell type={row.getValue(columnKey)} />;
    case 'owner':
      const ownerName = row.getValue(columnKey);
      const ownerType = row.original.ownerType;
      return <TextCell value={ownerName ? `${ownerName} (${ownerType})` : "No owner"} />;
    default:
      return <TextCell value={row.getValue(columnKey)} />;
  }
};
ItemCell.displayName = "ItemCell";

const createCell = (key: string, cellType: string = 'text') => {
  return ({ row }: any) => <ItemCell row={row} columnKey={key} cellType={cellType} />;
};

const columnConfigs: ColumnConfig[] = [
  { key: "itemNumber", header: "ID", sortable: true },
  { key: "itemName", header: "Name", sortable: true },
  { key: "itemType", header: "Type", cellType: 'type', sortable: true },
  { key: "itemBrand", header: "Brand", sortable: true },
  { key: "itemModel", header: "Model" },
  { key: "ownerName", header: "Owner", sortable: true, cellType: 'owner' },
];

export const columns: ColumnDef<Item>[] = columnConfigs.map(config => ({
  accessorKey: config.key,
  header: ({ column }) => createHeader(config.header, column, config.sortable),
  cell: createCell(config.key, config.cellType),
})); 