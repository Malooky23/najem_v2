import { useQuery } from '@tanstack/react-query';
import type { Item } from '@/components/items/types';
import { fetchItems } from "@/lib/api";

interface ItemsResponse {
  items: Item[];
  total: number;
  totalPages: number;
  page: number;
}

export function useItems(page: number, limit: number) {
  return useQuery<ItemsResponse>({
    queryKey: useItems.getQueryKey(page, limit),
    queryFn: () => fetchItems(page, limit),
    staleTime: 120000,
    gcTime: 300000, // replaced cacheTime with gcTime in v5
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });
}

// Add static method to get queryKey
useItems.getQueryKey = (page: number, limit: number) => ["items", page, limit];

