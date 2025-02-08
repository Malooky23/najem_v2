import { useEffect, useState } from 'react';
import { flexRender, Table } from "@tanstack/react-table";
import { columnConfigs } from "./columns-config";
import { useWindowSize } from "@/hooks/use-window-size"; // You'll need to create this hook

interface VirtualizedTableProps {
  table: Table<any>;
  parentRef: React.RefObject<HTMLDivElement | null>;
  virtualItems: any[];
  topSpacer: number;
  bottomSpacer: number;
  handleRowClick: (item: any) => void;
  totalColumnsWidth: number;
}

export function VirtualizedTable({
  table,
  parentRef,
  virtualItems,
  topSpacer,
  bottomSpacer,
  handleRowClick,
  totalColumnsWidth,
}: VirtualizedTableProps) {
  const { width: windowWidth } = useWindowSize();
  const [visibleColumns, setVisibleColumns] = useState(columnConfigs);

  // Recalculate visible columns based on available width
  useEffect(() => {
    if (!parentRef.current || !windowWidth) return;

    const containerWidth = parentRef.current.offsetWidth;
    let availableWidth = containerWidth;
    let newVisibleColumns = [...columnConfigs];

    // Sort columns by priority (higher number = lower priority)
    newVisibleColumns.sort((a, b) => a.priority - b.priority);

    // Remove lowest priority columns until we fit
    while (availableWidth < totalColumnsWidth && newVisibleColumns.length > 0) {
      const lowestPriorityColumn = newVisibleColumns.find(col => col.priority === Math.max(...newVisibleColumns.map(c => c.priority)));
      if (lowestPriorityColumn) {
        newVisibleColumns = newVisibleColumns.filter(col => col !== lowestPriorityColumn);
        availableWidth += lowestPriorityColumn.width?.valueOf() || 0;
      }
    }

    setVisibleColumns(newVisibleColumns);
  }, [windowWidth, parentRef, totalColumnsWidth]);

  return (
    <div className="flex-1 transition-all duration-300 border rounded-md overflow-hidden">
      <table className="w-full border-collapse">
        <colgroup>
          {visibleColumns.map((col) => (
            <col
              key={col.key}
              style={{
                width: col.grow ? undefined : col.width,
                minWidth: col.minWidth,
              }}
            />
          ))}
        </colgroup>
        <thead className="sticky top-0 bg-background z-10 ">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-muted/50">
              {headerGroup.headers
                .filter(header => visibleColumns.some(col => col.key === header.id))
                .map((header) => (
                  <th
                    key={header.id}
                    className="h-10 px-2 text-xs font-medium border  "
                  >
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
            </tr>
          ))}
        </thead>
      </table>

      <div ref={parentRef} style={{ height: "95%", overflow: "auto" }}>
        <table className="w-full border-collapse ">
          <colgroup>
            {visibleColumns.map((col) => (
              <col
                key={col.key}
                style={{
                  width: col.grow ? undefined : col.width,
                  minWidth: col.minWidth,
                }}
              />
            ))}
          </colgroup>
          <tbody>
            {topSpacer > 0 && (
              <tr style={{ height: `${topSpacer}px` }}>
                <td colSpan={visibleColumns.length} />
              </tr>
            )}

            {virtualItems.map((virtualRow) => {
              const row = table.getRowModel().rows[virtualRow.index];

              return (
                <tr
                  key={row.id}
                  style={{ height: `${virtualRow.size}px` }}
                  onClick={() => handleRowClick(row.original)}
                  className="cursor-pointer hover:bg-muted border hover:font-semibold"
                >
                  {row.getVisibleCells()
                    .filter(cell => visibleColumns.some(col => col.key === cell.column.id))
                    .map((cell) => (
                      <td
                        key={cell.id}
                        className="px-2 py-1 border "
                      >
                        <div className="truncate">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </td>
                    ))}
                </tr>
              );
            })}

            {bottomSpacer > 0 && (
              <tr style={{ height: `${bottomSpacer}px` }}>
                <td colSpan={visibleColumns.length} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
