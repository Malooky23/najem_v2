import Link from "next/link";
import { Home, Settings } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-50 h-full">
      <nav className="p-4 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
}
