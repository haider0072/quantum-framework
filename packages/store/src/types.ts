/**
 * Type definitions for Quantum Store
 */

/**
 * Base store state - any object
 */
export type StoreState = Record<string, any>;

/**
 * Getter function that derives a value from state
 */
export type Getter<S extends StoreState, R = any> = (state: S) => R;

/**
 * Collection of getter functions
 */
export type Getters<S extends StoreState> = Record<string, Getter<S>>;

/**
 * Computed getters with inferred return types
 */
export type ComputedGetters<S extends StoreState, G extends Getters<S>> = {
  readonly [K in keyof G]: ReturnType<G[K]>;
};

/**
 * Action function that can modify state
 */
export type Action<S extends StoreState, Args extends any[] = []> = (
  state: S,
  ...args: Args
) => void | Promise<void>;

/**
 * Collection of action functions
 */
export type Actions<S extends StoreState> = Record<
  string,
  Action<S, any[]>
>;

/**
 * Bound actions that can be called directly
 */
export type BoundActions<A extends Actions<any>> = {
  [K in keyof A]: A[K] extends Action<any, infer Args>
    ? (...args: Args) => ReturnType<A[K]>
    : never;
};

/**
 * Store state with computed getters merged in
 */
export type StateWithGetters<
  S extends StoreState,
  G extends Getters<S>
> = S & ComputedGetters<S, G>;

/**
 * Selector function to extract a value from state
 */
export type Selector<S extends StoreState, R = any> = (state: S) => R;

/**
 * Listener function called when state changes
 */
export type StoreListener<S extends StoreState> = (
  state: S,
  prevState: S
) => void;

/**
 * Unsubscribe function returned by subscribe
 */
export type Unsubscribe = () => void;

/**
 * Middleware function
 */
export type Middleware<S extends StoreState> = (
  store: Store<S, any, any>
) => (next: MiddlewareNext) => (action: ActionCall) => any;

/**
 * Next function in middleware chain
 */
export type MiddlewareNext = (action: ActionCall) => any;

/**
 * Action call metadata
 */
export interface ActionCall {
  name: string;
  args: any[];
  timestamp: number;
}

/**
 * Plugin function to extend store functionality
 */
export type Plugin<S extends StoreState> = (store: Store<S, any, any>) => void;

/**
 * Store configuration
 */
export interface StoreConfig<
  S extends StoreState,
  G extends Getters<S> = {},
  A extends Actions<S> = {}
> {
  /**
   * Initial state object
   */
  state: S;

  /**
   * Computed values derived from state
   */
  getters?: G;

  /**
   * Functions that modify state
   */
  actions?: A;

  /**
   * Middleware functions
   */
  middleware?: Middleware<S>[];

  /**
   * Plugin functions
   */
  plugins?: Plugin<S>[];

  /**
   * Store name for debugging
   */
  name?: string;
}

/**
 * Store instance
 */
export interface Store<
  S extends StoreState,
  G extends Getters<S> = {},
  A extends Actions<S> = {}
> {
  /**
   * Store name
   */
  readonly name: string;

  /**
   * Get current state snapshot
   */
  getState(): StateWithGetters<S, G>;

  /**
   * Subscribe to state changes
   */
  subscribe(listener: StoreListener<StateWithGetters<S, G>>): Unsubscribe;

  /**
   * Reset store to initial state
   */
  reset(): void;

  /**
   * Destroy store and cleanup
   */
  destroy(): void;

  /**
   * Internal: Get the raw state signal (for advanced usage)
   */
  _state: S;

  /**
   * Internal: Get the computed getters (for advanced usage)
   */
  _getters: ComputedGetters<S, G>;
}

/**
 * Persistence configuration
 */
export interface PersistConfig {
  /**
   * Storage key
   */
  key: string;

  /**
   * Storage mechanism (localStorage, sessionStorage, or custom)
   */
  storage?: Storage;

  /**
   * State paths to persist (defaults to all)
   */
  paths?: string[];

  /**
   * Serialize function
   */
  serialize?: (state: any) => string;

  /**
   * Deserialize function
   */
  deserialize?: (value: string) => any;

  /**
   * Version for migration
   */
  version?: number;

  /**
   * Migration function
   */
  migrate?: (persistedState: any, version: number) => any;
}

/**
 * DevTools configuration
 */
export interface DevToolsConfig {
  /**
   * Store name in DevTools
   */
  name?: string;

  /**
   * Enable action logging
   */
  logActions?: boolean;

  /**
   * Maximum actions to keep in history
   */
  maxAge?: number;

  /**
   * Serialize state for DevTools
   */
  serialize?: (state: any) => any;
}

/**
 * Combined stores configuration
 */
export type CombinedStores = Record<string, Store<any, any, any>>;

/**
 * Combined store state
 */
export type CombinedState<T extends CombinedStores> = {
  [K in keyof T]: T[K] extends Store<infer S, infer G, any>
    ? StateWithGetters<S, G>
    : never;
};
