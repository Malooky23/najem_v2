"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Item } from "./types";
import { cn } from "@/lib/utils";
import { TextCell, TypeCell, ActionsCell } from "./table-cells";

type ColumnConfig = {
  key: string;
  header: string;
  sortable?: boolean;
  cellType?: 'text' | 'type' | 'owner' | 'actions';
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
    case 'actions':
      return <ActionsCell />;
    default:
      return <TextCell value={row.getValue(columnKey)} />;
  }
};
ItemCell.displayName = "ItemCell";

const createCell = (key: string, cellType: string = 'text') => {
  const CellRenderer = ({ row }: any) => <ItemCell row={row} columnKey={key} cellType={cellType} />;
  CellRenderer.displayName = `CellRenderer_${key}`;
  return CellRenderer;
};

const columnConfigs: ColumnConfig[] = [
  { key: "itemNumber", header: "Item #", sortable: true },
  { key: "itemName", header: "Name", sortable: true },
  { key: "packingType", header: "Type", cellType: 'type', sortable: true },
  { key: "itemBrand", header: "Brand" },
  { key: "itemModel", header: "Model" },
  { key: "itemBarcode", header: "Barcode" },
  { key: "customerName", header: "Owner" },
  { key: "itemCountryOfOrigin", header: "Origin" },
  { key: "actions", header: "Actions", cellType: 'actions' },
];

export const columns: ColumnDef<Item>[] = columnConfigs.map(config => ({
  accessorKey: config.key,
  header: ({ column }) => createHeader(config.header, column, config.sortable),
  cell: createCell(config.key, config.cellType),
})); 