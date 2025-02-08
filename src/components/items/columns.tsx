"use client";

import { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Edit, Trash } from "lucide-react";
import { Item } from "./types";
import { cn } from "@/lib/utils";
import { TextCell, TypeCell, ActionsCell } from "./table-cells";
import { columnConfigs } from "./columns-config";

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

const ItemCell = ({
  row,
  columnKey,
  cellType,
  onEdit,
  onDelete,
}: {
  row: any;
  columnKey: string;
  cellType: string;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}) => {
  switch (cellType) {
    case "type":
      return <TypeCell type={row.getValue(columnKey)} />;
    case "actions":
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

const createCell = (
  key: string,
  cellType: string = "text",
  handlers?: {
    onEdit: (item: Item) => void;
    onDelete: (item: Item) => void;
  }
) => {
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



export const getColumns = (handlers: {
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}) =>
  columnConfigs.map((config) => ({
    accessorKey: config.key,
    enableResizing: true,
    size: config.width,
    header: ({ column }: { column: Column<Item, unknown> }) => (
      <div
        className={cn(
          config.key === "itemType" && "text-center", // Center align for itemType
          // "w-full"
        )}
      >
        {createHeader(config.header, column, config.sortable)}
      </div>
    ),
    cell: ({ row }: any) => (
      <div
        className={cn(
          // "w-full",
          config.key === "itemType" && "text-center", // Center align for itemType
          config.grow && "flex-grow"
        )}
      >
        {config.cellType ? (
          <ItemCell
            row={row}
            columnKey={config.key}
            cellType={config.cellType}
            onEdit={handlers.onEdit}
            onDelete={handlers.onDelete}
          />
        ) : (
          <TextCell value={row.getValue(config.key)} />
        )}
      </div>
    ),
  }));


  // export const getColumns = (handlers: {
  //   onEdit: (item: Item) => void;
  //   onDelete: (item: Item) => void;
  // }) =>
  //   columnConfigs.map((config) => ({
  //     accessorKey: config.key,
  //     enableResizing: true,
  //     size: config.width, // Use the fixed width from the config
  //     header: ({ column }: { column: Column<Item, unknown> }) =>
  //       createHeader(config.header, column, config.sortable),
  //     cell: createCell(config.key, config.cellType, handlers),
  //   })); 