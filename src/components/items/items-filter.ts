import { Item } from "./types";

export function filterAndSortItems(
    items: Item[],
    searchTerm: string,
    sortBy: keyof Item,
    sortOrder: 'asc' | 'desc'
  ): Item[] {
    return items
      .filter(item => 
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return String(aValue).localeCompare(String(bValue)) * 
          (sortOrder === 'asc' ? 1 : -1);
      });
  }