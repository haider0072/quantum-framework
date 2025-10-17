/**
 * Data fetching for SSR
 */

import { signal } from '@quantum/reactivity';
import type { ServerData, ServerDataFetcher, SSRContext } from './types.js';
import { isSSR } from './server-renderer.js';

/**
 * Map of data fetchers by key
 */
const dataFetchers = new Map<string, ServerDataFetcher<any>>();

/**
 * Map of fetched data by key
 */
const fetchedData = new Map<string, any>();

/**
 * SSR context (set during server rendering)
 */
let ssrContext: SSRContext | null = null;

/**
 * Set the SSR context
 *
 * @param context - The SSR context
 */
export function setSSRContext(context: SSRContext): void {
  ssrContext = context;
}

/**
 * Get the SSR context
 *
 * @returns The SSR context or null
 */
export function getSSRContext(): SSRContext | null {
  return ssrContext;
}

/**
 * Clear the SSR context
 */
export function clearSSRContext(): void {
  ssrContext = null;
}

/**
 * Create a server data resource
 *
 * During SSR, this will fetch the data on the server.
 * On the client, it will use the hydrated data or fetch if not available.
 *
 * @param key - Unique key for this data
 * @param fetcher - Function to fetch the data
 * @returns Server data resource
 *
 * @example
 * ```tsx
 * function BlogPost({ id }) {
 *   const post = createServerData(
 *     `post-${id}`,
 *     async () => {
 *       const res = await fetch(`/api/posts/${id}`);
 *       return res.json();
 *     }
 *   );
 *
 *   return <div>{post.value?.title}</div>;
 * }
 * ```
 */
export function createServerData<T>(
  key: string,
  fetcher: ServerDataFetcher<T>
): ServerData<T> {
  // Create signals for state
  const value = signal<T | undefined>(undefined);
  const loading = signal<boolean>(false);
  const error = signal<Error | undefined>(undefined);

  // Store fetcher for later use
  dataFetchers.set(key, fetcher);

  // Fetch function
  const doFetch = async () => {
    loading(true);
    error(undefined);

    try {
      const result = await fetcher(ssrContext || undefined);
      value(result);
      fetchedData.set(key, result);
      return result;
    } catch (err) {
      error(err as Error);
      throw err;
    } finally {
      loading(false);
    }
  };

  // If on server, fetch immediately
  if (isSSR()) {
    // Start fetch (will be awaited by prefetchData)
    doFetch().catch(err => {
      console.error(`Server data fetch failed for key "${key}":`, err);
    });
  } else {
    // On client, check if we have hydrated data
    if (fetchedData.has(key)) {
      value(fetchedData.get(key));
    } else {
      // Fetch on client
      doFetch().catch(err => {
        console.error(`Client data fetch failed for key "${key}":`, err);
      });
    }
  }

  return {
    value,
    loading,
    error,
    refetch: async () => {
      await doFetch();
    },
  };
}

/**
 * Prefetch all data for a component tree
 *
 * Waits for all data fetchers to complete before returning.
 * Use this on the server before rendering.
 *
 * @returns Promise that resolves when all data is fetched
 *
 * @example
 * ```tsx
 * // On server
 * await prefetchData();
 * const html = renderToString(<App />);
 * ```
 */
export async function prefetchData(): Promise<void> {
  // Clear previous data
  fetchedData.clear();

  // Render the component tree to collect data fetchers
  // This is a dry run that won't produce HTML
  // TODO: Implement proper data collection

  // For now, just wait a bit to let fetchers start
  await new Promise(resolve => setTimeout(resolve, 100));

  // Wait for all pending fetches
  const promises: Promise<any>[] = [];
  for (const [key, fetcher] of dataFetchers.entries()) {
    if (!fetchedData.has(key)) {
      const promise = fetcher(ssrContext || undefined)
        .then(result => {
          fetchedData.set(key, result);
        })
        .catch(err => {
          console.error(`Prefetch failed for key "${key}":`, err);
        });
      promises.push(promise);
    }
  }

  await Promise.all(promises);
}

/**
 * Get all fetched data (for serialization)
 *
 * @returns Map of keys to fetched data
 */
export function getAllFetchedData(): Map<string, any> {
  return new Map(fetchedData);
}

/**
 * Set fetched data (for hydration)
 *
 * @param data - Map of keys to data
 */
export function setFetchedData(data: Map<string, any>): void {
  fetchedData.clear();
  for (const [key, value] of data.entries()) {
    fetchedData.set(key, value);
  }
}

/**
 * Clear all fetched data
 */
export function clearFetchedData(): void {
  fetchedData.clear();
  dataFetchers.clear();
}

/**
 * Use server data (simpler API)
 *
 * @param key - Unique key for this data
 * @returns The fetched data or undefined
 *
 * @example
 * ```tsx
 * function BlogPost({ id }) {
 *   const post = useServerData<Post>(`post-${id}`);
 *
 *   if (!post) return <div>Loading...</div>;
 *   return <div>{post.title}</div>;
 * }
 * ```
 */
export function useServerData<T>(key: string): T | undefined {
  return fetchedData.get(key);
}

/**
 * Check if data has been fetched
 *
 * @param key - The data key
 * @returns True if data has been fetched
 */
export function hasData(key: string): boolean {
  return fetchedData.has(key);
}

/**
 * Serialize fetched data to JSON
 *
 * @returns JSON string of fetched data
 */
export function serializeFetchedData(): string {
  const data: Record<string, any> = {};
  for (const [key, value] of fetchedData.entries()) {
    data[key] = value;
  }
  return JSON.stringify(data);
}

/**
 * Deserialize and set fetched data
 *
 * @param serialized - JSON string of fetched data
 */
export function deserializeFetchedData(serialized: string): void {
  try {
    const data = JSON.parse(serialized);
    fetchedData.clear();
    for (const [key, value] of Object.entries(data)) {
      fetchedData.set(key, value);
    }
  } catch (error) {
    console.error('Failed to deserialize fetched data:', error);
  }
}
