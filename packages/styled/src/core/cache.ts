/**
 * Style cache implementation
 */

import type { StyleCache } from '../types';

/**
 * Simple in-memory cache for CSS classes
 */
class StyleCacheImpl implements StyleCache {
  private cache = new Map<string, string>();

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: string): void {
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Global style cache instance
 */
export const styleCache = new StyleCacheImpl();
