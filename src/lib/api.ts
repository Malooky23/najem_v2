import type { Item } from "@/components/items/types";

interface ItemsResponse {
  items: Item[];
  total: number;
  totalPages: number;
  page: number;
}

export async function fetchItems(page: number, limit: number): Promise<ItemsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  const response = await fetch(`/api/items/all?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }
  return response.json();
}
