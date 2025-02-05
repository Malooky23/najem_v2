import { useQuery } from "@tanstack/react-query";
import type { Order } from "@/components/orders/types";

async function fetchOrders(): Promise<Order[]> {
  const res = await fetch("/api/orders"); // your orders API endpoint
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 60 * 1000, // cache for 1 minute
  });
} 