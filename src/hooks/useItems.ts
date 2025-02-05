import { useQuery } from '@tanstack/react-query'
import type { Item } from '@/components/items/types'

async function fetchItems(): Promise<Item[]> {
  
  const response = await fetch('/api/items/all')
  if (!response.ok) {
    throw new Error('Error fetching items')
  }
  return response.json()
}

export function useItems() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: [] as Item[], // Ensures data is always an array of Item
    refetchOnMount: 'always', // Force a refetch on mount

  })

  return {
    allItems: data || [],
    isLoading,
    error,
    refetch,
  }
}