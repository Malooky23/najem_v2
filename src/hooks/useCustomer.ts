import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomerById, createCustomer, updateCustomer, getAllCustomers } from '@/lib/db/queries';

export function useCustomer(cusId: string) {
  return useQuery({
    queryKey: ['customer', cusId],
    queryFn: () => getCustomerById(cusId),
    enabled: !!cusId,
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to fetch customers');
      }
      return response.json();
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.setQueryData(['customer', newCustomer.cusId], newCustomer);
    },
  });
}

export function useUpdateCustomer(cusId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof updateCustomer>[1]) => 
      updateCustomer(cusId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', cusId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
} 

