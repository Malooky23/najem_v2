import  * as LucideIcons  from "lucide-react";
import { NavConfig } from "./types";

export const navigationConfig: NavConfig = {
  EMPLOYEE: {
    basic: [
      {
        href: "/orders",
        label: "Orders",
        icon: LucideIcons.Package,
      },
      {
        href: "/inventory",
        label: "Inventory",
        icon: LucideIcons.Warehouse,
      },
      {
        href: "/items",
        label: "My Items",
        icon: LucideIcons.PackageSearch,
      },
      {
        href: "/tx",
        label: "Transactions",
        icon: LucideIcons.Receipt,
      },
    ],
    admin: [
      {
        href: "/customers",
        label: "Customers",
        icon: LucideIcons.Users,
      },
      {
        href: "/vendors",
        label: "Vendors",
        icon: LucideIcons.Truck,
      },
    ],
  },
  CUSTOMER: [
    {
      href: "/orders",
      label: "My Orders",
      icon: LucideIcons.Package,
    },
    {
      href: "/items",
      label: "My Items",
      icon: LucideIcons.PackageSearch,
    },
    {
      href: "/invoices",
      label: "Invoices",
      icon: LucideIcons.Receipt,
    },
    {
        href: "/inventory",
        label: "Inventory",
        icon: LucideIcons.Warehouse,
      },

  ],
}; 