import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton() {
    return (
      <div className="space-y-4">
        {/* Header row */}
        <div className="flex gap-4">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-8 w-[150px]" />
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-8 flex-1" />
        </div>
        
        {/* Table rows */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 w-[200px]" />
            <Skeleton className="h-12 w-[150px]" />
            <Skeleton className="h-12 w-[200px]" />
            <Skeleton className="h-12 flex-1" />
          </div>
        ))}
      </div>
    );
  }