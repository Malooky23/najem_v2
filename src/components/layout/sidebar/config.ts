import { Home, Settings } from "lucide-react";
import { SidebarConfig } from "./types";

export const sidebarConfig: SidebarConfig = {
  links: [
    {
      href: "/dashboard",
      label: "Home",
      icon: Home,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ],
}; 