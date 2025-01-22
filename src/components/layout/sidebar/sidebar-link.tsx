import Link from "next/link";
import { SidebarLink as SidebarLinkType } from "./types";

interface SidebarLinkProps extends SidebarLinkType {
  isCollapsed: boolean;
}

export function SidebarLink({ href, label, icon: Icon, isCollapsed }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 p-2 hover:bg-gray-200 rounded-lg"
    >
      <Icon className="h-5 w-5" />
      <span className={`${isCollapsed ? 'hidden' : 'block'} transition-all duration-300`}>
        {label}
      </span>
    </Link>
  );
} 