export type ColumnConfig = {
    key: string;
    header: string;
    sortable?: boolean;
    cellType?: "text" | "type" | "owner" | "actions";
    width?: number; // Fixed width for the column (in pixels)
    minWidth?: number; // Minimum width for the column (in pixels)
    priority: number; // Priority for column visibility
    label?: string; // Column label
    grow?: number; // Flex grow factor for the column
  };
  export const columnConfigs: ColumnConfig[] = [
    {
      key: "itemNumber",
      header: "ID",
      label: "#",
      width: 5,
    //   minWidth: 10,
      priority: 1, // Always show
    },
    {
      key: "itemName",
      header: "Name",
      width: 300,
      minWidth: 100,
      priority: 1, // Allow this column to grow    // Always showgrow: 1, // Allow this column to grow
    },
    {
      key: "itemType",
      header: "itemType",
      cellType: "type",
      width: 120,
      minWidth: 100,
      priority: 2,
    },
    {
      key: "packingType",
      header: "pck Type",
      cellType: "type",
      width: 120,
      minWidth: 100,
      priority: 2,
    },
    {
      key: "customerName",
      header: "Owner",
      width: 200,
      minWidth: 10,
      priority: 3, // Will hide first when space is limited
    },
    {
      key: "actions",
      header: "",
      width: 1,
      cellType: "actions",
      priority: 4, // Will hide first when space is limited
    },
    // ... other column configs ...
  ];