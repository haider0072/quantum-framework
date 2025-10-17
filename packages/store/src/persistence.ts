/**
 * Persistence plugin for storing state in localStorage/sessionStorage
 */

import type { Plugin, PersistConfig, Store, StoreState } from './types';

/**
 * Default serialization function
 */
function defaultSerialize(state: any): string {
  return JSON.stringify(state);
}

/**
 * Default deserialization function
 */
function defaultDeserialize(value: string): any {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * Get nested value from object using dot notation path
 */
function getPath(obj: any, path: string): any {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result && typeof result === 'object') {
      result = result[key];
    } else {
      return undefined;
    }
  }
  return result;
}

/**
 * Set nested value in object using dot notation path
 */
function setPath(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let target = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in target) || typeof target[key] !== 'object') {
      target[key] = {};
    }
    target = target[key];
  }
  target[keys[keys.length - 1]] = value;
}

/**
 * Pick specific paths from state object
 */
function pickPaths(state: any, paths: string[]): any {
  const result: any = {};
  for (const path of paths) {
    const value = getPath(state, path);
    if (value !== undefined) {
      setPath(result, path, value);
    }
  }
  return result;
}

/**
 * Merge persisted state into current state
 */
function mergeState(currentState: any, persistedState: any): any {
  if (typeof persistedState !== 'object' || persistedState === null) {
    return currentState;
  }

  const result = { ...currentState };
  for (const key in persistedState) {
    if (typeof persistedState[key] === 'object' && persistedState[key] !== null) {
      result[key] = mergeState(currentState[key] || {}, persistedState[key]);
    } else {
      result[key] = persistedState[key];
    }
  }
  return result;
}

/**
 * Create a persistence plugin for a store
 *
 * @example
 * ```typescript
 * const store = createStore({
 *   state: { count: 0, theme: 'light' },
 *   actions: { ... },
 *   plugins: [
 *     persist({
 *       key: 'my-app',
 *       storage: localStorage,
 *       paths: ['theme'] // Only persist theme
 *     })
 *   ]
 * });
 * ```
 */
export function persist<S extends StoreState>(
  config: PersistConfig
): Plugin<S> {
  const {
    key,
    storage = typeof window !== 'undefined' ? window.localStorage : undefined,
    paths,
    serialize = defaultSerialize,
    deserialize = defaultDeserialize,
    version = 1,
    migrate,
  } = config;

  if (!storage) {
    console.warn('[persist] Storage not available, persistence disabled');
    return () => {};
  }

  return (store: Store<S, any, any>) => {
    // Load persisted state on initialization
    try {
      const persistedValue = storage.getItem(key);
      if (persistedValue) {
        const parsed = deserialize(persistedValue);

        // Handle versioning and migration
        let persistedState = parsed?.state || parsed;
        const persistedVersion = parsed?.version || 1;

        if (persistedVersion !== version && migrate) {
          persistedState = migrate(persistedState, persistedVersion);
        }

        // Merge persisted state into current state
        const currentState = store.getState();
        const stateToRestore = paths
          ? pickPaths(persistedState, paths)
          : persistedState;

        const mergedState = mergeState(currentState, stateToRestore);

        // Apply merged state to store
        for (const stateKey in mergedState) {
          if (store._state[stateKey]) {
            store._state[stateKey](mergedState[stateKey]);
          }
        }
      }
    } catch (error) {
      console.error('[persist] Failed to load persisted state:', error);
    }

    // Subscribe to state changes and persist
    store.subscribe((state) => {
      try {
        const stateToPersist = paths ? pickPaths(state, paths) : state;

        // Remove computed getters (they shouldn't be persisted)
        const cleanState: any = {};
        for (const key in stateToPersist) {
          const descriptor = Object.getOwnPropertyDescriptor(stateToPersist, key);
          if (descriptor && !descriptor.get) {
            cleanState[key] = stateToPersist[key];
          }
        }

        const valueToStore = {
          state: cleanState,
          version,
          timestamp: Date.now(),
        };

        storage.setItem(key, serialize(valueToStore));
      } catch (error) {
        console.error('[persist] Failed to persist state:', error);
      }
    });
  };
}

/**
 * Clear persisted state from storage
 *
 * @example
 * ```typescript
 * clearPersistedState('my-app', localStorage);
 * ```
 */
export function clearPersistedState(
  key: string,
  storage: Storage = typeof window !== 'undefined' ? window.localStorage : undefined as any
): void {
  if (storage) {
    storage.removeItem(key);
  }
}

/**
 * Get persisted state without creating a store
 *
 * @example
 * ```typescript
 * const state = getPersistedState('my-app', localStorage);
 * ```
 */
export function getPersistedState(
  key: string,
  storage: Storage = typeof window !== 'undefined' ? window.localStorage : undefined as any,
  deserialize = defaultDeserialize
): any {
  if (!storage) {
    return null;
  }

  try {
    const value = storage.getItem(key);
    if (value) {
      const parsed = deserialize(value);
      return parsed?.state || parsed;
    }
  } catch (error) {
    console.error('[persist] Failed to get persisted state:', error);
  }

  return null;
}
