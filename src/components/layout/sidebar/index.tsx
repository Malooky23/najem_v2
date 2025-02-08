"use client";
import { useState } from "react";
import { sidebarConfig } from "./config";
import { SidebarLink } from "./sidebar-link";
import { CollapseButton } from "./collapse-button";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside 
      className={cn(
        "border-r bg-background transition-all duration-300 hidden",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="p-2 hover:bg-accent rounded-md"
        >
          {isCollapsed ? "→" : "←"}
        </button>
        
        <nav className={cn(
          "space-y-2 mt-4",
          isCollapsed && "items-center"
        )}>
          {sidebarConfig.links.map((link) => (
            <SidebarLink 
              key={link.href} 
              {...link} 
              isCollapsed={isCollapsed} 
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
