import { getCustomers } from "@/server/queries/customers";
import { clsx, type ClassValue } from "clsx"
import { cache } from "react";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


