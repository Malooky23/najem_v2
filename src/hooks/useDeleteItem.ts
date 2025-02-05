import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Item } from '@/components/items/types'

export function useDeleteItem() {
  const queryClient = useQueryClient()
  return useMutation<Item, Error, string>({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Error deleting item')
      }
      return (await response.json()) as Item
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
} 