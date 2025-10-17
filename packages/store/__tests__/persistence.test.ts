/**
 * Persistence tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStore } from '../src/store';
import { persist, clearPersistedState, getPersistedState } from '../src/persistence';

// Mock localStorage
const createMockStorage = (): Storage => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() {
      return Object.keys(store).length;
    },
  };
};

describe('persist', () => {
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = createMockStorage();
  });

  it('should persist state to storage', () => {
    const store = createStore({
      state: { count: 0 },
      actions: {
        increment(state) {
          state.count++;
        },
      },
      plugins: [
        persist({
          key: 'test-store',
          storage: mockStorage,
        }),
      ],
    });

    store.increment();

    const persisted = mockStorage.getItem('test-store');
    expect(persisted).toBeTruthy();

    const parsed = JSON.parse(persisted!);
    expect(parsed.state).toEqual({ count: 1 });
    expect(parsed.version).toBe(1);
  });

  it('should restore persisted state on initialization', () => {
    // First, create a store and update it
    const store1 = createStore({
      state: { count: 0 },
      actions: {
        setCount(state, value: number) {
          state.count = value;
        },
      },
      plugins: [
        persist({
          key: 'test-store-restore',
          storage: mockStorage,
        }),
      ],
    });

    store1.setCount(42);

    // Create a new store with the same key
    const store2 = createStore({
      state: { count: 0 },
      actions: {},
      plugins: [
        persist({
          key: 'test-store-restore',
          storage: mockStorage,
        }),
      ],
    });

    // Should restore the persisted state
    expect(store2.getState().count).toBe(42);
  });

  it('should only persist specified paths', () => {
    const store = createStore({
      state: { count: 0, temp: 'do not persist' },
      actions: {
        increment(state) {
          state.count++;
          state.temp = 'changed';
        },
      },
      plugins: [
        persist({
          key: 'test-store-paths',
          storage: mockStorage,
          paths: ['count'], // Only persist count
        }),
      ],
    });

    store.increment();

    const persisted = mockStorage.getItem('test-store-paths');
    const parsed = JSON.parse(persisted!);

    expect(parsed.state).toHaveProperty('count', 1);
    expect(parsed.state).not.toHaveProperty('temp');
  });

  it('should handle nested paths', () => {
    const store = createStore({
      state: { user: { name: 'John', age: 30 }, settings: { theme: 'dark' } },
      actions: {
        updateUser(state, name: string) {
          state.user.name = name;
        },
      },
      plugins: [
        persist({
          key: 'test-store-nested',
          storage: mockStorage,
          paths: ['user.name'], // Only persist user.name
        }),
      ],
    });

    store.updateUser('Jane');

    const persisted = mockStorage.getItem('test-store-nested');
    const parsed = JSON.parse(persisted!);

    expect(parsed.state.user).toEqual({ name: 'Jane' });
    expect(parsed.state).not.toHaveProperty('settings');
  });

  it('should handle version and migration', () => {
    // Create store with version 1
    const store1 = createStore({
      state: { oldField: 'value' },
      actions: {
        update(state, value: string) {
          state.oldField = value;
        },
      },
      plugins: [
        persist({
          key: 'test-store-migration',
          storage: mockStorage,
          version: 1,
        }),
      ],
    });

    store1.update('old-value');

    // Create store with version 2 and migration
    const store2 = createStore({
      state: { newField: '' },
      actions: {},
      plugins: [
        persist({
          key: 'test-store-migration',
          storage: mockStorage,
          version: 2,
          migrate: (state, version) => {
            if (version === 1) {
              return { newField: state.oldField };
            }
            return state;
          },
        }),
      ],
    });

    expect(store2.getState().newField).toBe('old-value');
  });

  it('should use custom serialize/deserialize', () => {
    const customSerialize = vi.fn((state) => `custom:${JSON.stringify(state)}`);
    const customDeserialize = vi.fn((value) => {
      const json = value.replace('custom:', '');
      return JSON.parse(json);
    });

    const store = createStore({
      state: { count: 0 },
      actions: {
        increment(state) {
          state.count++;
        },
      },
      plugins: [
        persist({
          key: 'test-store-custom',
          storage: mockStorage,
          serialize: customSerialize,
          deserialize: customDeserialize,
        }),
      ],
    });

    store.increment();

    expect(customSerialize).toHaveBeenCalled();

    const persisted = mockStorage.getItem('test-store-custom');
    expect(persisted).toMatch(/^custom:/);
  });

  it('should handle storage errors gracefully', () => {
    const brokenStorage = {
      ...createMockStorage(),
      setItem: () => {
        throw new Error('Storage full');
      },
    };

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const store = createStore({
      state: { count: 0 },
      actions: {
        increment(state) {
          state.count++;
        },
      },
      plugins: [
        persist({
          key: 'test-store-error',
          storage: brokenStorage as Storage,
        }),
      ],
    });

    // Should not throw
    expect(() => store.increment()).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

describe('clearPersistedState', () => {
  it('should clear persisted state', () => {
    const mockStorage = createMockStorage();
    mockStorage.setItem('test-key', 'value');

    clearPersistedState('test-key', mockStorage);

    expect(mockStorage.getItem('test-key')).toBeNull();
  });
});

describe('getPersistedState', () => {
  it('should get persisted state', () => {
    const mockStorage = createMockStorage();
    const state = { count: 42 };
    mockStorage.setItem(
      'test-key',
      JSON.stringify({ state, version: 1, timestamp: Date.now() })
    );

    const result = getPersistedState('test-key', mockStorage);

    expect(result).toEqual(state);
  });

  it('should return null if no persisted state', () => {
    const mockStorage = createMockStorage();

    const result = getPersistedState('non-existent', mockStorage);

    expect(result).toBeNull();
  });
});
