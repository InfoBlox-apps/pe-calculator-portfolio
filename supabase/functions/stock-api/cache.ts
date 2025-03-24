
// Cache implementation for stock data
export interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export interface Cache<T> {
  [key: string]: CacheItem<T>;
}

// Cache duration in milliseconds (24 hours)
export const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Initialize an empty cache
const cache: Cache<any> = {};

/**
 * Get item from cache
 * @param key Cache key
 * @returns Cached data if available and not expired, null otherwise
 */
export const getCachedItem = <T>(key: string): T | null => {
  if (cache[key] && Date.now() - cache[key].timestamp < CACHE_DURATION) {
    console.log(`Using cached data for ${key}`);
    return cache[key].data;
  }
  return null;
};

/**
 * Set item in cache
 * @param key Cache key
 * @param data Data to cache
 */
export const setCachedItem = <T>(key: string, data: T): void => {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
};
