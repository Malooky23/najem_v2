import type { Item } from '@/components/items/types';

export const CACHE_KEYS = {
  customers: 'customers-cache'
  // users: 'users-cache'
} as const;

export const CACHE_TAGS = {
  customers: 'customers'
  // users: 'users'
} as const;



export const CACHE_REVALIDATE_SECONDS = {
  customers: 3600 // 1 hour
  // users: 3600 // 1 hour
} as const; 

export const CACHE_KEY = 'items-cache';

export const cacheItems = (params: string, data: Item[]) => {
  if (typeof window === 'undefined') return; // SSR guard
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  cache[params] = { data, timestamp: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

export const getCachedItems = (query: string): Item[] | null => {
  if (typeof window === 'undefined') return null; // SSR guard
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  return cache[query]?.data || null;
};