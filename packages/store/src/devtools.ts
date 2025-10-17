/**
 * DevTools integration for Quantum Store
 * Supports Redux DevTools Extension for time-travel debugging
 */

import type { Plugin, DevToolsConfig, Store, StoreState } from './types';

/**
 * Redux DevTools Extension interface
 */
interface DevToolsExtension {
  connect(options: any): DevToolsConnection;
}

interface DevToolsConnection {
  init(state: any): void;
  send(action: any, state: any): void;
  subscribe(listener: (message: any) => void): () => void;
  unsubscribe(): void;
}

/**
 * Get Redux DevTools Extension
 */
function getDevToolsExtension(): DevToolsExtension | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const w = window as any;
  return w.__REDUX_DEVTOOLS_EXTENSION__ || w.__REDUX_DEVTOOLS_EXTENSION__;
}

/**
 * Create DevTools plugin for a store
 *
 * @example
 * ```typescript
 * const store = createStore({
 *   state: { count: 0 },
 *   actions: { increment: (state) => state.count++ },
 *   plugins: [
 *     devtools({ name: 'Counter Store' })
 *   ]
 * });
 * ```
 */
export function devtools<S extends StoreState>(
  config: DevToolsConfig = {}
): Plugin<S> {
  const {
    name = 'Quantum Store',
    logActions = true,
    maxAge = 50,
    serialize,
  } = config;

  return (store: Store<S, any, any>) => {
    const extension = getDevToolsExtension();

    if (!extension) {
      console.warn(
        '[devtools] Redux DevTools Extension not found. Install it from: https://github.com/reduxjs/redux-devtools'
      );
      return;
    }

    // Connect to DevTools
    const devTools = extension.connect({
      name,
      maxAge,
      serialize: serialize ? { replacer: serialize } : undefined,
      features: {
        pause: true,
        lock: true,
        persist: true,
        export: true,
        import: 'custom',
        jump: true,
        skip: true,
        reorder: true,
        dispatch: true,
        test: true,
      },
    });

    // Initialize with current state
    const initialState = store.getState();
    devTools.init(serialize ? serialize(initialState) : initialState);

    // Track action history for time-travel
    const actionHistory: Array<{ action: string; state: any }> = [];

    // Subscribe to store changes
    const unsubscribeStore = store.subscribe((state) => {
      if (logActions && actionHistory.length > 0) {
        const lastAction = actionHistory[actionHistory.length - 1];
        devTools.send(
          { type: lastAction.action },
          serialize ? serialize(state) : state
        );
      }
    });

    // Intercept actions by wrapping them
    const originalActions: any = {};
    for (const key in store) {
      if (
        typeof (store as any)[key] === 'function' &&
        !['getState', 'subscribe', 'reset', 'destroy'].includes(key) &&
        !key.startsWith('_')
      ) {
        originalActions[key] = (store as any)[key];

        // Wrap action to log to DevTools
        (store as any)[key] = (...args: any[]) => {
          const actionName = `${name}/${key}`;

          // Record action
          actionHistory.push({
            action: actionName,
            state: store.getState(),
          });

          // Trim history
          if (actionHistory.length > maxAge) {
            actionHistory.shift();
          }

          // Execute original action
          return originalActions[key](...args);
        };
      }
    }

    // Handle time-travel from DevTools
    const unsubscribeDevTools = devTools.subscribe((message: any) => {
      if (message.type === 'DISPATCH') {
        switch (message.payload?.type) {
          case 'RESET':
            // Reset to initial state
            store.reset();
            devTools.init(serialize ? serialize(store.getState()) : store.getState());
            actionHistory.length = 0;
            break;

          case 'COMMIT':
            // Commit current state as new baseline
            devTools.init(serialize ? serialize(store.getState()) : store.getState());
            actionHistory.length = 0;
            break;

          case 'ROLLBACK':
            // Rollback to last committed state
            const lastCommittedState = message.state;
            if (lastCommittedState) {
              restoreState(store, lastCommittedState);
            }
            break;

          case 'JUMP_TO_STATE':
          case 'JUMP_TO_ACTION':
            // Time-travel to specific state
            const targetState = message.state;
            if (targetState) {
              restoreState(store, targetState);
            }
            break;

          case 'IMPORT_STATE':
            // Import state from file
            const { nextLiftedState } = message.payload;
            const computedStates = nextLiftedState?.computedStates;
            if (computedStates && computedStates.length > 0) {
              const lastState = computedStates[computedStates.length - 1].state;
              restoreState(store, lastState);
              devTools.send({ type: 'IMPORT' }, lastState);
            }
            break;

          case 'TOGGLE_ACTION':
            // Skip/unskip action (requires replay)
            console.warn('[devtools] TOGGLE_ACTION not fully supported yet');
            break;
        }
      }
    });

    // Cleanup on destroy
    const originalDestroy = store.destroy;
    store.destroy = () => {
      unsubscribeStore();
      unsubscribeDevTools();
      devTools.unsubscribe();
      originalDestroy.call(store);
    };
  };
}

/**
 * Restore store state from DevTools
 */
function restoreState(store: Store<any, any, any>, state: any): void {
  // Update each state signal
  for (const key in state) {
    if (store._state[key]) {
      store._state[key](state[key]);
    }
  }
}

/**
 * Check if Redux DevTools Extension is available
 */
export function hasDevToolsExtension(): boolean {
  return getDevToolsExtension() !== null;
}
