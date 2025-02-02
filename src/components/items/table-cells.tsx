import { cn } from "@/lib/utils";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

export const typeColors: Record<string, string> = {
    "CARTON": "bg-blue-500/20 text-blue-700",
    "BOX": "bg-green-500/20 text-green-700",
    "SACK": "bg-purple-500/20 text-purple-700",
    "sack": "bg-purple-500/20 text-purple-700",
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
        typeColors[type.toUpperCase()] || "bg-gray-500/20 text-gray-700 "
      )}>
        {type}
      </div>
    </div>
  );
}

export function ActionsCell() {
  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-gray-200"
        onClick={() => {/* Add edit handler */}}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-red-200 hover:text-red-600"
        onClick={() => {/* Add delete handler */}}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
} 