import { cn } from "@/lib/utils";

export const typeColors: Record<string, string> = {
    "CARTON": "bg-blue-500/20 text-blue-700",
    "BOX": "bg-green-500/20 text-green-700",
    "SACK": "bg-purple-500/20 text-purple-700",
    "EQUIPMENT": "bg-orange-500/20 text-orange-700",
    "PALLET": "bg-gray-500/20 text-gray-700",
    "OTHER": "bg-pink-500/20 text-gray-700",
    "CUSTOMER": "bg-red-500/20 text-gray-700",
    "EMPLOYEE": "bg-violet-500/100 text-gray-700",
  };

export function TextCell({ value }: { value: string | number }) {

  //CHANGE ROW CELL FORMATTING HERE
  return <span className=" hover:underline">{value}</span>;
}

export function TypeCell({ type }: { type: string }) {
  return (
    <div className="flex items-center">
      <div className={cn(
        // "rounded-full px-3 py-1 text-xs font-medium w-24 text-center hover-glow",
        " hover-glow",
        typeColors[type] || "bg-gray-500/20 text-gray-700 "
      )}>
        {type}
      </div>
    </div>
  );
} 