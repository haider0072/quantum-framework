/**
 * Quantum Framework - Computed Primitive
 *
 * Derived reactive state that automatically updates when dependencies change.
 * Computed values are lazily evaluated and cached for performance.
 */

import {
  Subscriber,
  cleanupSubscriber,
  runSubscriber,
  trackSubscriber,
} from './tracking';

export interface Computed<T> {
  (): T;
  peek(): T;
}

enum ComputedState {
  CLEAN = 0,
  CHECK = 1,
  DIRTY = 2,
}

/**
 * Creates a computed signal that derives its value from other signals.
 *
 * @param computation - Function that computes the value
 * @returns A computed signal accessor
 *
 * @example
 * const count = signal(0);
 * const doubled = computed(() => count() * 2);
 * console.log(doubled()); // 0
 * count(5);
 * console.log(doubled()); // 10
 */
export function computed<T>(computation: () => T): Computed<T> {
  let value: T;
  let state = ComputedState.DIRTY;
  const subscribers = new Set<Subscriber>();

  // Create the subscriber for this computed
  const subscriber: Subscriber = {
    execute: () => {
      // Re-run computation
      value = computation();
      state = ComputedState.CLEAN;
    },
    dependencies: new Set(),
  };

  const computedFn = (() => {
    // If dirty, we need to recompute
    if (state === ComputedState.DIRTY) {
      cleanupSubscriber(subscriber);
      runSubscriber(subscriber);
    }
    // If checking, verify dependencies
    else if (state === ComputedState.CHECK) {
      // For now, treat CHECK as DIRTY (optimization opportunity)
      cleanupSubscriber(subscriber);
      runSubscriber(subscriber);
    }

    // Track this computed as a dependency
    trackSubscriber(subscribers);

    return value;
  }) as Computed<T>;

  // Peek without tracking
  computedFn.peek = () => {
    if (state !== ComputedState.CLEAN) {
      cleanupSubscriber(subscriber);
      runSubscriber(subscriber);
    }
    return value;
  };

  // Mark as dirty when any dependency changes
  const originalExecute = subscriber.execute;
  subscriber.execute = () => {
    state = ComputedState.DIRTY;
    originalExecute();
    // Notify subscribers that this computed changed
    subscribers.forEach((sub) => {
      sub.execute();
    });
  };

  return computedFn;
}

/**
 * Creates a memo - similar to computed but with explicit dependency tracking.
 * Useful for performance optimization when you know exact dependencies.
 *
 * @param computation - Function that computes the value
 * @param deps - Array of dependencies to track
 * @returns A computed signal accessor
 *
 * @example
 * const count = signal(0);
 * const name = signal('Quantum');
 * const message = memo(
 *   () => `${name()}: ${count()}`,
 *   [name, count]
 * );
 */
export function memo<T>(
  computation: () => T,
  deps?: Array<() => any>
): Computed<T> {
  if (!deps) {
    return computed(computation);
  }

  // Create a computed that only depends on specified deps
  let cachedValue: T;
  let isInitialized = false;

  // Store previous dep values
  const prevDeps: any[] = [];

  return computed(() => {
    // Check if any dep changed
    const depsChanged = deps.some((dep, i) => {
      const currentValue = dep();
      const changed = !Object.is(currentValue, prevDeps[i]);
      prevDeps[i] = currentValue;
      return changed;
    });

    if (!isInitialized || depsChanged) {
      cachedValue = computation();
      isInitialized = true;
    }

    return cachedValue;
  });
}
