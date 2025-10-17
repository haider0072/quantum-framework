/**
 * @quantum/store - Signal-based global state management for Quantum Framework
 *
 * @example
 * ```typescript
 * import { createStore, useStore } from '@quantum/store';
 *
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
 *
 * function Counter() {
 *   const count = useStore(counterStore, state => state.count);
 *   return (
 *     <div>
 *       <h1>{count}</h1>
 *       <button onClick={() => counterStore.increment()}>+</button>
 *     </div>
 *   );
 * }
 * ```
 */

// Core store functionality
export { createStore, combineStores, select } from './store';

// React-like hooks
export {
  useStore,
  useStoreState,
  useStoreActions,
  useStoreWithActions,
  useStores,
} from './hooks';

// Persistence
export {
  persist,
  clearPersistedState,
  getPersistedState,
} from './persistence';

// Middleware
export {
  logger,
  thunk,
  crashReporter,
  performanceMonitor,
  actionHistory,
} from './middleware';

// DevTools
export { devtools, hasDevToolsExtension } from './devtools';

// Types
export type {
  Store,
  StoreConfig,
  StoreState,
  Getters,
  Actions,
  Selector,
  StoreListener,
  Unsubscribe,
  Middleware,
  Plugin,
  PersistConfig,
  DevToolsConfig,
  CombinedStores,
  CombinedState,
} from './types';
