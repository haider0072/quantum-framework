/**
 * React-like hooks for using stores in Quantum components
 */

import { signal, effect } from '@quantum/reactivity';
import type { Store, StoreState, Selector, StateWithGetters, Getters } from './types';

/**
 * Subscribe to a specific slice of store state
 *
 * @example
 * ```typescript
 * function Counter() {
 *   const count = useStore(counterStore, state => state.count);
 *   return <div>{count}</div>;
 * }
 * ```
 */
export function useStore<S extends StoreState, G extends Getters<S>, A, R>(
  store: Store<S, G, A>,
  selector: Selector<StateWithGetters<S, G>, R>
): R {
  // Create a signal to hold the selected value
  const selectedValue = signal(selector(store.getState()));

  // Subscribe to store changes and update the signal
  effect(() => {
    const unsubscribe = store.subscribe((newState) => {
      const newValue = selector(newState);
      // Only update if the value actually changed
      if (newValue !== selectedValue()) {
        selectedValue(newValue);
      }
    });

    // Cleanup on unmount
    return unsubscribe;
  });

  return selectedValue() as R;
}

/**
 * Get the entire store state (use sparingly, prefer useStore with selector)
 *
 * @example
 * ```typescript
 * function App() {
 *   const state = useStoreState(store);
 *   return <div>{state.count}</div>;
 * }
 * ```
 */
export function useStoreState<S extends StoreState, G extends Getters<S>, A>(
  store: Store<S, G, A>
): StateWithGetters<S, G> {
  return useStore(store, (state) => state);
}

/**
 * Get store actions bound to the store
 *
 * @example
 * ```typescript
 * function Counter() {
 *   const { increment, decrement } = useStoreActions(counterStore);
 *   return (
 *     <div>
 *       <button onClick={increment}>+</button>
 *       <button onClick={decrement}>-</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useStoreActions<S extends StoreState, G extends Getters<S>, A>(
  store: Store<S, G, A>
): Omit<Store<S, G, A>, 'getState' | 'subscribe' | 'reset' | 'destroy' | 'name' | '_state' | '_getters'> {
  // Extract only the action methods
  const actions: any = {};
  for (const key in store) {
    if (
      typeof (store as any)[key] === 'function' &&
      !['getState', 'subscribe', 'reset', 'destroy'].includes(key) &&
      !key.startsWith('_')
    ) {
      actions[key] = (store as any)[key];
    }
  }
  return actions;
}

/**
 * Combine useStore and useStoreActions for convenience
 *
 * @example
 * ```typescript
 * function Counter() {
 *   const [count, { increment }] = useStoreWithActions(
 *     counterStore,
 *     state => state.count
 *   );
 *   return (
 *     <div>
 *       <p>{count}</p>
 *       <button onClick={increment}>Increment</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useStoreWithActions<S extends StoreState, G extends Getters<S>, A, R>(
  store: Store<S, G, A>,
  selector: Selector<StateWithGetters<S, G>, R>
): [
  R,
  Omit<Store<S, G, A>, 'getState' | 'subscribe' | 'reset' | 'destroy' | 'name' | '_state' | '_getters'>
] {
  const value = useStore(store, selector);
  const actions = useStoreActions(store);
  return [value, actions];
}

/**
 * Use multiple store slices with a single hook
 *
 * @example
 * ```typescript
 * function App() {
 *   const { count, user } = useStores({
 *     count: [counterStore, state => state.count],
 *     user: [userStore, state => state.user]
 *   });
 * }
 * ```
 */
export function useStores<T extends Record<string, [Store<any, any, any>, Selector<any, any>]>>(
  stores: T
): {
  [K in keyof T]: T[K] extends [Store<any, any, any>, Selector<any, infer R>]
    ? R
    : never;
} {
  const result: any = {};
  for (const key in stores) {
    const [store, selector] = stores[key];
    result[key] = useStore(store, selector);
  }
  return result;
}
