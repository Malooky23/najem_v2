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