import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateItemDialog } from "./create-item-dialog";
import type { Item } from "./types";

interface ToolbarProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  refetch: () => void;
}

export function Toolbar({ globalFilter, setGlobalFilter, refetch }: ToolbarProps) {
  return (
    <div className="flex-none mb-4 space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Items</h2>
        <Input
          placeholder="Filter items..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="flex-1 max-w-2xl"
        />
        <CreateItemDialog
          onSuccess={(newItem: Item) => {
            refetch();
          }}
        >
          <Button>Create Item</Button>
        </CreateItemDialog>
        <Button onClick={() => refetch()}>Refresh</Button>
      </div>
    </div>
  );
}
