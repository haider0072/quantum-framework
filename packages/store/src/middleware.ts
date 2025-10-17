/**
 * Built-in middleware for Quantum Store
 */

import type { Middleware, StoreState, ActionCall } from './types';

/**
 * Logger middleware configuration
 */
export interface LoggerConfig {
  /**
   * Collapse log groups
   */
  collapsed?: boolean;

  /**
   * Log timestamp
   */
  timestamp?: boolean;

  /**
   * Log duration
   */
  duration?: boolean;

  /**
   * Custom colors
   */
  colors?: {
    title?: string;
    prevState?: string;
    action?: string;
    nextState?: string;
    error?: string;
  };

  /**
   * Filter actions to log
   */
  predicate?: (actionCall: ActionCall) => boolean;

  /**
   * Custom logger
   */
  logger?: Console;
}

/**
 * Logger middleware for debugging store actions
 *
 * @example
 * ```typescript
 * const store = createStore({
 *   state: { count: 0 },
 *   actions: { increment: (state) => state.count++ },
 *   middleware: [logger({ collapsed: true })]
 * });
 * ```
 */
export function logger<S extends StoreState>(
  config: LoggerConfig = {}
): Middleware<S> {
  const {
    collapsed = false,
    timestamp = true,
    duration = true,
    colors = {
      title: '#4CAF50',
      prevState: '#9E9E9E',
      action: '#03A9F4',
      nextState: '#4CAF50',
      error: '#F44336',
    },
    predicate,
    logger = console,
  } = config;

  return (store) => (next) => (actionCall) => {
    // Skip if predicate returns false
    if (predicate && !predicate(actionCall)) {
      return next(actionCall);
    }

    const prevState = store.getState();
    const startTime = performance.now();

    // Format timestamp
    const time = timestamp ? new Date().toISOString().split('T')[1] : '';

    // Create title
    const titleParts = ['action', actionCall.name];
    if (timestamp) {
      titleParts.push(`@ ${time}`);
    }
    const title = titleParts.join(' ');

    try {
      // Start log group
      if (collapsed) {
        logger.groupCollapsed(`%c${title}`, `color: ${colors.title}; font-weight: bold`);
      } else {
        logger.group(`%c${title}`, `color: ${colors.title}; font-weight: bold`);
      }

      // Log previous state
      logger.log('%cprev state', `color: ${colors.prevState}; font-weight: bold`, prevState);

      // Log action
      logger.log('%caction', `color: ${colors.action}; font-weight: bold`, {
        type: actionCall.name,
        args: actionCall.args,
      });

      // Execute action
      const result = next(actionCall);

      // Log next state
      const nextState = store.getState();
      logger.log('%cnext state', `color: ${colors.nextState}; font-weight: bold`, nextState);

      // Log duration
      if (duration) {
        const endTime = performance.now();
        const elapsed = endTime - startTime;
        logger.log(`%cduration`, `color: ${colors.title}; font-weight: bold`, `${elapsed.toFixed(2)}ms`);
      }

      logger.groupEnd();

      return result;
    } catch (error) {
      // Log error
      logger.log('%cerror', `color: ${colors.error}; font-weight: bold`, error);
      logger.groupEnd();
      throw error;
    }
  };
}

/**
 * Thunk middleware for async actions
 *
 * @example
 * ```typescript
 * const store = createStore({
 *   state: { data: null },
 *   actions: {
 *     async fetchData(state) {
 *       const response = await fetch('/api/data');
 *       state.data = await response.json();
 *     }
 *   },
 *   middleware: [thunk()]
 * });
 * ```
 */
export function thunk<S extends StoreState>(): Middleware<S> {
  return (store) => (next) => async (actionCall) => {
    const result = next(actionCall);

    // If result is a Promise, wait for it
    if (result instanceof Promise) {
      return await result;
    }

    return result;
  };
}

/**
 * Crash reporter middleware
 *
 * @example
 * ```typescript
 * const store = createStore({
 *   state: { count: 0 },
 *   actions: { ... },
 *   middleware: [
 *     crashReporter({
 *       onError: (error, actionCall, state) => {
 *         reportToService({ error, action: actionCall.name, state });
 *       }
 *     })
 *   ]
 * });
 * ```
 */
export function crashReporter<S extends StoreState>(config: {
  onError: (error: any, actionCall: ActionCall, state: S) => void;
}): Middleware<S> {
  return (store) => (next) => (actionCall) => {
    try {
      return next(actionCall);
    } catch (error) {
      config.onError(error, actionCall, store.getState() as S);
      throw error;
    }
  };
}

/**
 * Performance monitoring middleware
 *
 * @example
 * ```typescript
 * const store = createStore({
 *   state: { count: 0 },
 *   actions: { ... },
 *   middleware: [
 *     performanceMonitor({
 *       threshold: 16, // Warn if action takes > 16ms
 *       onSlow: (actionCall, duration) => {
 *         console.warn(`Slow action: ${actionCall.name} (${duration}ms)`);
 *       }
 *     })
 *   ]
 * });
 * ```
 */
export function performanceMonitor<S extends StoreState>(config: {
  threshold?: number;
  onSlow?: (actionCall: ActionCall, duration: number) => void;
}): Middleware<S> {
  const { threshold = 16, onSlow } = config;

  return (_store) => (next) => (actionCall) => {
    const startTime = performance.now();
    const result = next(actionCall);
    const duration = performance.now() - startTime;

    if (duration > threshold && onSlow) {
      onSlow(actionCall, duration);
    }

    return result;
  };
}

/**
 * Action history middleware for undo/redo
 *
 * @example
 * ```typescript
 * const historyMiddleware = actionHistory({ maxHistory: 50 });
 *
 * const store = createStore({
 *   state: { count: 0 },
 *   actions: { ... },
 *   middleware: [historyMiddleware]
 * });
 *
 * // Later
 * historyMiddleware.undo();
 * historyMiddleware.redo();
 * ```
 */
export function actionHistory<S extends StoreState>(config: {
  maxHistory?: number;
} = {}): Middleware<S> & {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  getHistory: () => ActionCall[];
} {
  const { maxHistory = 100 } = config;

  const history: ActionCall[] = [];
  const redoStack: ActionCall[] = [];
  let storeRef: any = null;

  const middleware: any = (store: any) => {
    storeRef = store;
    return (next: any) => (actionCall: ActionCall) => {
      // Add to history
      history.push({ ...actionCall });
      if (history.length > maxHistory) {
        history.shift();
      }

      // Clear redo stack on new action
      redoStack.length = 0;

      return next(actionCall);
    };
  };

  middleware.undo = () => {
    if (history.length === 0 || !storeRef) return;

    const lastAction = history.pop();
    if (lastAction) {
      redoStack.push(lastAction);
    }

    // Re-apply all actions from history
    storeRef.reset();
    for (const action of history) {
      const actionFn = (storeRef as any)[action.name];
      if (actionFn) {
        actionFn(...action.args);
      }
    }
  };

  middleware.redo = () => {
    if (redoStack.length === 0 || !storeRef) return;

    const action = redoStack.pop();
    if (action) {
      const actionFn = (storeRef as any)[action.name];
      if (actionFn) {
        actionFn(...action.args);
      }
    }
  };

  middleware.clear = () => {
    history.length = 0;
    redoStack.length = 0;
  };

  middleware.getHistory = () => [...history];

  return middleware;
}
