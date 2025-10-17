/**
 * Tests for server data fetching
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createServerData,
  useServerData,
  hasData,
  clearFetchedData,
  setFetchedData,
  serializeFetchedData,
  deserializeFetchedData,
} from '../src/data-fetching';

describe('Data Fetching', () => {
  beforeEach(() => {
    clearFetchedData();
  });

  afterEach(() => {
    clearFetchedData();
  });

  describe('createServerData', () => {
    it('should create a server data resource', () => {
      const fetcher = vi.fn().mockResolvedValue({ id: 1, title: 'Test' });

      const data = createServerData('test-key', fetcher);

      expect(data).toBeDefined();
      expect(data.value).toBeDefined();
      expect(data.loading).toBeDefined();
      expect(data.error).toBeDefined();
      expect(typeof data.refetch).toBe('function');
    });

    it('should fetch data on client', async () => {
      const mockData = { id: 1, title: 'Test Post' };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      const data = createServerData('post-1', fetcher);

      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(fetcher).toHaveBeenCalled();
      expect(data.value()).toEqual(mockData);
    });

    it('should handle fetch errors', async () => {
      const fetchError = new Error('Fetch failed');
      const fetcher = vi.fn().mockRejectedValue(fetchError);

      const data = createServerData('error-key', fetcher);

      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(data.error()).toEqual(fetchError);
    });

    it('should allow refetching', async () => {
      const fetcher = vi
        .fn()
        .mockResolvedValueOnce({ version: 1 })
        .mockResolvedValueOnce({ version: 2 })
        .mockResolvedValueOnce({ version: 3 });

      const data = createServerData('refetch-key', fetcher);

      // Initial fetch happens automatically on client
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(data.value()).toEqual({ version: 1 });

      // First refetch
      await data.refetch();
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(data.value()).toEqual({ version: 2 });

      // Second refetch
      await data.refetch();
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(data.value()).toEqual({ version: 3 });

      expect(fetcher).toHaveBeenCalledTimes(3);
    });
  });

  describe('useServerData', () => {
    it('should return undefined for non-existent data', () => {
      const data = useServerData('non-existent');

      expect(data).toBeUndefined();
    });

    it('should return fetched data', () => {
      const mockData = { id: 1, title: 'Test' };
      setFetchedData(new Map([['test-key', mockData]]));

      const data = useServerData('test-key');

      expect(data).toEqual(mockData);
    });
  });

  describe('hasData', () => {
    it('should return false for non-existent data', () => {
      expect(hasData('non-existent')).toBe(false);
    });

    it('should return true for existing data', () => {
      setFetchedData(new Map([['test-key', { data: 'value' }]]));

      expect(hasData('test-key')).toBe(true);
    });
  });

  describe('setFetchedData', () => {
    it('should set fetched data', () => {
      const data = new Map([
        ['key1', { value: 1 }],
        ['key2', { value: 2 }],
      ]);

      setFetchedData(data);

      expect(useServerData('key1')).toEqual({ value: 1 });
      expect(useServerData('key2')).toEqual({ value: 2 });
    });

    it('should clear previous data', () => {
      setFetchedData(new Map([['key1', { value: 1 }]]));
      expect(hasData('key1')).toBe(true);

      setFetchedData(new Map([['key2', { value: 2 }]]));
      expect(hasData('key1')).toBe(false);
      expect(hasData('key2')).toBe(true);
    });
  });

  describe('serializeFetchedData', () => {
    it('should serialize fetched data to JSON', () => {
      setFetchedData(
        new Map([
          ['key1', { id: 1, title: 'First' }],
          ['key2', { id: 2, title: 'Second' }],
        ])
      );

      const serialized = serializeFetchedData();
      const parsed = JSON.parse(serialized);

      expect(parsed.key1).toEqual({ id: 1, title: 'First' });
      expect(parsed.key2).toEqual({ id: 2, title: 'Second' });
    });

    it('should return empty object for no data', () => {
      clearFetchedData();

      const serialized = serializeFetchedData();
      const parsed = JSON.parse(serialized);

      expect(parsed).toEqual({});
    });
  });

  describe('deserializeFetchedData', () => {
    it('should deserialize JSON to fetched data', () => {
      const serialized = JSON.stringify({
        key1: { id: 1, title: 'First' },
        key2: { id: 2, title: 'Second' },
      });

      deserializeFetchedData(serialized);

      expect(useServerData('key1')).toEqual({ id: 1, title: 'First' });
      expect(useServerData('key2')).toEqual({ id: 2, title: 'Second' });
    });

    it('should handle invalid JSON gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      deserializeFetchedData('invalid json {');

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('clearFetchedData', () => {
    it('should clear all fetched data', () => {
      setFetchedData(
        new Map([
          ['key1', { value: 1 }],
          ['key2', { value: 2 }],
        ])
      );

      expect(hasData('key1')).toBe(true);
      expect(hasData('key2')).toBe(true);

      clearFetchedData();

      expect(hasData('key1')).toBe(false);
      expect(hasData('key2')).toBe(false);
    });
  });

  describe('Roundtrip serialization', () => {
    it('should correctly roundtrip data', () => {
      const original = new Map([
        ['posts', [{ id: 1, title: 'Post 1' }, { id: 2, title: 'Post 2' }]],
        ['user', { id: 123, name: 'Alice' }],
      ]);

      setFetchedData(original);

      const serialized = serializeFetchedData();
      clearFetchedData();
      deserializeFetchedData(serialized);

      expect(useServerData('posts')).toEqual([
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' },
      ]);
      expect(useServerData('user')).toEqual({ id: 123, name: 'Alice' });
    });
  });
});
