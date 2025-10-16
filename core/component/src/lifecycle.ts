/**
 * Quantum Framework - Component Lifecycle
 *
 * Lifecycle hooks for component management.
 */

import { effect, type EffectCleanup } from '@quantum/reactivity';

export interface ComponentContext {
  cleanups: EffectCleanup[];
  isUnmounted: boolean;
}

let currentContext: ComponentContext | null = null;

/**
 * Gets the current component context.
 */
export function getCurrentContext(): ComponentContext | null {
  return currentContext;
}

/**
 * Sets the current component context.
 */
export function setCurrentContext(context: ComponentContext | null): void {
  currentContext = context;
}

/**
 * Creates a new component context.
 */
export function createContext(): ComponentContext {
  return {
    cleanups: [],
    isUnmounted: false,
  };
}

/**
 * Runs a function in a component context.
 */
export function runInContext<T>(context: ComponentContext, fn: () => T): T {
  const prevContext = currentContext;
  currentContext = context;
  try {
    return fn();
  } finally {
    currentContext = prevContext;
  }
}

/**
 * Cleans up a component context.
 */
export function cleanupContext(context: ComponentContext): void {
  context.isUnmounted = true;
  context.cleanups.forEach((cleanup) => cleanup());
  context.cleanups = [];
}

/**
 * Lifecycle hook: runs when component mounts.
 * Cleanup function runs when component unmounts.
 *
 * @param fn - Function to run on mount
 *
 * @example
 * onMount(() => {
 *   console.log('Component mounted');
 *   return () => console.log('Component unmounted');
 * });
 */
export function onMount(fn: () => void | EffectCleanup): void {
  if (!currentContext) {
    console.warn('onMount called outside of component context');
    return;
  }

  const cleanup = fn();
  if (cleanup) {
    currentContext.cleanups.push(cleanup);
  }
}

/**
 * Lifecycle hook: runs when component unmounts.
 *
 * @param fn - Cleanup function to run on unmount
 *
 * @example
 * onCleanup(() => {
 *   console.log('Cleaning up...');
 * });
 */
export function onCleanup(fn: EffectCleanup): void {
  if (!currentContext) {
    console.warn('onCleanup called outside of component context');
    return;
  }

  currentContext.cleanups.push(fn);
}

/**
 * Lifecycle hook: runs after component updates.
 * Useful for DOM operations after render.
 *
 * @param fn - Function to run after update
 *
 * @example
 * onUpdate(() => {
 *   console.log('Component updated');
 * });
 */
export function onUpdate(fn: () => void): void {
  effect(() => {
    // Skip first run (mount)
    let isFirst = true;
    return () => {
      if (!isFirst) {
        fn();
      }
      isFirst = false;
    };
  });
}

/**
 * Lifecycle hook: runs when an error occurs in component.
 * Used for error boundaries.
 *
 * @param fn - Error handler function
 *
 * @example
 * onError((error) => {
 *   console.error('Component error:', error);
 * });
 */
export function onError(fn: (error: Error) => void): void {
  if (!currentContext) {
    console.warn('onError called outside of component context');
    return;
  }

  // Store error handler in context
  (currentContext as any).errorHandler = fn;
}
