import { Skeleton } from "@/components/ui/skeleton";
import { columnConfigs } from "./columns-config";

export function TableSkeleton() {
  return (
    <div className="flex-1 border rounded-md overflow-hidden animate-pulse">
      <table className="w-full border-collapse">
        <thead className="bg-background">
          <tr className="bg-muted/50">
            {columnConfigs.map((col) => (
              <th
                key={col.key}
                className="h-10 px-2 text-xs font-medium border"
                style={{ width: col.width }}
              >
                <Skeleton className="h-4 w-[80%] mx-auto" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 50 }).map((_, idx) => (
            <tr key={idx} className="border">
              {columnConfigs.map((col) => (
                <td key={`${idx}-${col.key}`} className="px-2 py-1 border">
                  <Skeleton className="h-5 w-[90%]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
