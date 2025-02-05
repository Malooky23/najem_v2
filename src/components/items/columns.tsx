"use client";

import {  Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Edit, Trash } from "lucide-react";
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

const createHeader = (
  title: string, 
  column: Column<Item, unknown>, 
  sortable: boolean = false
) => {
  if (!sortable) return title;
  return <SortButton title={title} column={column} />;
};

const ItemCell = ({ row, columnKey, cellType, onEdit, onDelete }: { 
  row: any, 
  columnKey: string, 
  cellType: string,
  onEdit: (item: Item) => void,
  onDelete: (item: Item) => void
}) => {
  switch (cellType) {
    case 'type':
      return <TypeCell type={row.getValue(columnKey)} />;
    case 'actions':
      return (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row.original);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-200 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row.original);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    default:
      return <TextCell value={row.getValue(columnKey)} />;
  }
};
ItemCell.displayName = "ItemCell";

const createCell = (key: string, cellType: string = 'text', handlers?: { 
  onEdit: (item: Item) => void,
  onDelete: (item: Item) => void 
}) => {
  const CellRenderer = ({ row }: any) => (
    <ItemCell 
      row={row} 
      columnKey={key} 
      cellType={cellType}
      onEdit={handlers?.onEdit || (() => {})}
      onDelete={handlers?.onDelete || (() => {})}
    />
  );
  CellRenderer.displayName = `CellRenderer_${key}`;
  return CellRenderer;
};

const columnConfigs: ColumnConfig[] = [
  { key: "itemNumber", header: "ID", sortable: true },
  { key: "itemName", header: "Name", sortable: true },
  { key: "packingType", header: "Type", cellType: 'type', sortable: true },
  { key: "stock", header: "Stock" },

  // { key: "itemBrand", header: "Brand" },
  // { key: "itemModel", header: "Model" },
  // { key: "itemBarcode", header: "Barcode" },
  { key: "customerName", header: "Owner" },
  // { key: "itemCountryOfOrigin", header: "Origin" },
  // { key: "actions", header: "Actions", cellType: 'actions' },
];

export const getColumns = (handlers: { 
  onEdit: (item: Item) => void,
  onDelete: (item: Item) => void 
}) => columnConfigs.map(config => ({
  accessorKey: config.key,
  enableResizing: true,
  size:1000,
  header: ({ column }: { column: Column<Item, unknown> }) => 
    createHeader(config.header, column, config.sortable),
  cell: createCell(config.key, config.cellType, handlers)
})); 