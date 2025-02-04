import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import type { Item } from '@/components/items/types';

const CACHE_KEY = 'items-cache';
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface ItemsApiResponse {
  newItems: Item[];
  updatedItems: Item[];
  deletedIds: string[];
  isFullRefresh: boolean;
}

export function useItems() {
  const [lastUpdated, setLastUpdated] = useState<number>(0); // Server-side initial state
  const [allItems, setAllItems] = useState<Item[]>([]); // Server-side initial state

  // Client-side initialization
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { items, timestamp } = JSON.parse(cached);
      setAllItems(items);
      setLastUpdated(timestamp);
    }
  }, []); // Empty dependency array = runs only once on mount

  const { data, error, mutate } = useSWR<ItemsApiResponse>(
    `/api/items/updated?since=${lastUpdated}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      onSuccess: (newData) => {
        mergeData(newData);
      }
    }
  );

  const mergeData = useCallback((newData: typeof data) => {
    if (!newData) return;
    
    setAllItems(prev => {
      let merged = [...prev];
      
      if (newData.isFullRefresh) {
        merged = [...newData.newItems, ...newData.updatedItems];
      } else {
        // Remove deleted items
        merged = merged.filter(item => !newData.deletedIds.includes(item.itemId));
        // Apply updates
        merged = merged.map(item => 
          newData.updatedItems.find(u => u.itemId === item.itemId) || item
        );
        // Add new items
        merged = [...merged, ...newData.newItems];
      }
      
      // Only update timestamp if data actually changed
      if (JSON.stringify(merged) !== JSON.stringify(prev)) {
        const timestamp = Date.now();
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          items: merged,
          timestamp
        }));
        setLastUpdated(timestamp);
      }
      
      return merged;
    });
  }, []);

  // Update loadData to handle forced refresh
  const loadData = useCallback((force = false) => {
    if (force) {
      localStorage.removeItem(CACHE_KEY);
      mutate(undefined, {
        revalidate: true,
        rollbackOnError: true,
      });
    } else {
      mutate();
    }
  }, [mutate]);

  return {
    allItems,
    isLoading: !data && !error,
    loadData, // Now accepts force parameter
  };
}