/**
 * Core store implementation using Quantum's signal-based reactivity
 */

import { signal, computed, batch } from '@quantum/reactivity';
import type {
  Store,
  StoreConfig,
  StoreState,
  Getters,
  Actions,
  StoreListener,
  Unsubscribe,
  StateWithGetters,
  ComputedGetters,
  ActionCall,
} from './types';

/**
 * Creates a new store instance with state, getters, and actions
 *
 * @example
 * ```typescript
 * const counterStore = createStore({
 *   state: { count: 0 },
 *   getters: {
 *     doubled: (state) => state.count * 2
 *   },
 *   actions: {
 *     increment(state) {
 *       state.count++;
 *     }
 *   }
 * });
 * ```
 */
export function createStore<
  S extends StoreState,
  G extends Getters<S> = {},
  A extends Actions<S> = {}
>(config: StoreConfig<S, G, A>): Store<S, G, A> {
  const {
    state: initialState,
    getters = {} as G,
    actions = {} as A,
    middleware = [],
    plugins = [],
    name = 'store',
  } = config;

  // Create reactive state using signals
  const stateSignals: any = {};
  const listeners = new Set<StoreListener<StateWithGetters<S, G>>>();

  // Initialize state signals
  for (const key in initialState) {
    stateSignals[key] = signal(initialState[key]);
  }

  // Create computed getters
  const computedGetters: any = {};
  for (const key in getters) {
    const getter = getters[key];
    computedGetters[key] = computed(() => {
      // Build a proxy to track dependencies
      const stateProxy = new Proxy(stateSignals, {
        get(target, prop: string) {
          return target[prop]?.();
        },
      });
      return getter(stateProxy as S);
    });
  }

  // Get current state snapshot
  function getState(): StateWithGetters<S, G> {
    const state: any = {};

    // Get raw state values
    for (const key in stateSignals) {
      state[key] = stateSignals[key]();
    }

    // Get computed getter values
    for (const key in computedGetters) {
      Object.defineProperty(state, key, {
        get() {
          return computedGetters[key]();
        },
        enumerable: true,
      });
    }

    return state as StateWithGetters<S, G>;
  }

  // Get previous state for comparison
  let previousState = getState();

  // Notify listeners of state changes
  function notifyListeners() {
    const currentState = getState();
    listeners.forEach((listener) => {
      listener(currentState, previousState);
    });
    previousState = currentState;
  }

  // Subscribe to any signal change
  for (const key in stateSignals) {
    stateSignals[key].subscribe(() => {
      notifyListeners();
    });
  }

  // Subscribe to state changes
  function subscribe(
    listener: StoreListener<StateWithGetters<S, G>>
  ): Unsubscribe {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  // Reset store to initial state
  function reset() {
    batch(() => {
      for (const key in initialState) {
        stateSignals[key](initialState[key]);
      }
    });
  }

  // Destroy store and cleanup
  function destroy() {
    listeners.clear();
    // Additional cleanup can be added here
  }

  // Build middleware chain
  function createMiddlewareChain(action: Function, actionName: string) {
    if (middleware.length === 0) {
      return action;
    }

    // Create the final executor
    const execute = (actionCall: ActionCall) => {
      return action(...actionCall.args);
    };

    // Build middleware chain from right to left
    let chain = execute;
    for (let i = middleware.length - 1; i >= 0; i--) {
      const middlewareFn = middleware[i];
      const next = chain;
      chain = (actionCall: ActionCall) => {
        return middlewareFn(store as any)(() => next(actionCall))(actionCall);
      };
    }

    return (...args: any[]) => {
      const actionCall: ActionCall = {
        name: actionName,
        args,
        timestamp: Date.now(),
      };
      return chain(actionCall);
    };
  }

  // Bind actions to state
  const boundActions: any = {};
  for (const key in actions) {
    const action = actions[key];
    const wrappedAction = async (...args: any[]) => {
      // Create a mutable state proxy
      const stateProxy = new Proxy(stateSignals, {
        get(target, prop: string) {
          return target[prop]?.();
        },
        set(target, prop: string, value: any) {
          if (target[prop]) {
            target[prop](value);
          } else {
            // Allow adding new properties
            target[prop] = signal(value);
          }
          return true;
        },
      });

      // Execute action in a batch for optimal performance
      return batch(async () => {
        return await action(stateProxy as S, ...args);
      });
    };

    // Apply middleware
    boundActions[key] = createMiddlewareChain(wrappedAction, key);
  }

  // Create store object
  const store: Store<S, G, A> = {
    name,
    getState,
    subscribe,
    reset,
    destroy,
    _state: stateSignals as S,
    _getters: computedGetters as ComputedGetters<S, G>,
    ...boundActions,
  } as Store<S, G, A>;

  // Apply plugins
  plugins.forEach((plugin) => plugin(store));

  return store;
}

/**
 * Combine multiple stores into a single root store
 *
 * @example
 * ```typescript
 * const rootStore = combineStores({
 *   counter: counterStore,
 *   user: userStore
 * });
 *
 * rootStore.counter // Access counter store
 * rootStore.user    // Access user store
 * ```
 */
export function combineStores<T extends Record<string, Store<any, any, any>>>(
  stores: T
): T {
  return stores;
}

/**
 * Select a value from store state
 *
 * @example
 * ```typescript
 * const count = select(store, state => state.count);
 * ```
 */
export function select<S extends StoreState, R>(
  store: Store<S, any, any>,
  selector: (state: S) => R
): R {
  return selector(store.getState() as S);
}
