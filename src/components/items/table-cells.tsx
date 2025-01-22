import { cn } from "@/lib/utils";

export const typeColors: Record<string, string> = {
    "CARTON": "bg-blue-500/20 text-blue-700",
    "BOX": "bg-green-500/20 text-green-700",
    "SACK": "bg-purple-500/20 text-purple-700",
    "EQUIPMENT": "bg-orange-500/20 text-orange-700",
    "PALLET": "bg-gray-500/20 text-gray-700",
    "OTHER": "bg-pink-500/20 text-gray-700",
  };

export function TextCell({ value }: { value: string | number }) {
  return <span className="group-hover:text-white">{value}</span>;
}

export function TypeCell({ type }: { type: string }) {
  return (
    <div className="flex items-center">
      <div className={cn(
        "rounded-full px-3 py-1 text-xs font-medium w-24 text-center",
        typeColors[type] || "bg-gray-500/20 text-gray-700 group-hover:bg-gray-400 group-hover:text-gray-100"
      )}>
        {type}
      </div>
    </div>
  );
} 