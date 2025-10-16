/**
 * Quantum Framework - Effect Primitive
 *
 * Side effects that automatically run when their dependencies change.
 * Effects are the bridge between reactive state and the outside world.
 */

import {
  Subscriber,
  cleanupSubscriber,
  runSubscriber,
  getCurrentSubscriber,
} from './tracking';

export interface EffectCleanup {
  (): void;
}

export interface EffectOptions {
  /**
   * Run immediately on creation (default: true)
   */
  immediate?: boolean;
  /**
   * Cleanup function to run before re-execution
   */
  onCleanup?: EffectCleanup;
}

/**
 * Creates an effect that automatically runs when its dependencies change.
 *
 * @param fn - The effect function to run
 * @param options - Effect options
 * @returns Cleanup function to stop the effect
 *
 * @example
 * const count = signal(0);
 * effect(() => {
 *   console.log('Count:', count());
 * });
 * count(1); // Logs: "Count: 1"
 */
export function effect(
  fn: (onCleanup: (cleanup: EffectCleanup) => void) => void,
  options: EffectOptions = {}
): EffectCleanup {
  const { immediate = true } = options;
  let cleanup: EffectCleanup | undefined;
  let isRunning = false;

  const onCleanup = (cleanupFn: EffectCleanup) => {
    cleanup = cleanupFn;
  };

  const subscriber: Subscriber = {
    execute: () => {
      if (isRunning) return; // Prevent infinite loops

      // Run cleanup from previous execution
      if (cleanup) {
        cleanup();
        cleanup = undefined;
      }

      isRunning = true;
      try {
        fn(onCleanup);
      } finally {
        isRunning = false;
      }
    },
    dependencies: new Set(),
  };

  // Run immediately if requested
  if (immediate) {
    runSubscriber(subscriber);
  }

  // Return cleanup function
  return () => {
    cleanupSubscriber(subscriber);
    if (cleanup) {
      cleanup();
      cleanup = undefined;
    }
  };
}

/**
 * Creates a watcher that only runs when specific dependencies change.
 * Unlike effect, watch requires explicit dependencies.
 *
 * @param deps - Dependencies to watch
 * @param fn - Callback when dependencies change
 * @param options - Watch options
 * @returns Cleanup function
 *
 * @example
 * const count = signal(0);
 * const name = signal('Quantum');
 * watch([count], (newCount, oldCount) => {
 *   console.log(`Count changed from ${oldCount} to ${newCount}`);
 * });
 */
export function watch<T = any>(
  deps: { (): any; peek?: () => any }[],
  fn: (newValues: T[], oldValues: T[]) => void,
  options: EffectOptions = {}
): EffectCleanup {
  let oldValues: T[] = deps.map((dep) => dep.peek?.() ?? dep());
  let isFirst = true;

  return effect(
    () => {
      const newValues: T[] = deps.map((dep) => dep());

      if (!isFirst) {
        fn(newValues, oldValues);
      }

      oldValues = newValues;
      isFirst = false;
    },
    { ...options, immediate: options.immediate ?? true }
  );
}

/**
 * Creates a one-time watcher that stops after first execution.
 *
 * @param deps - Dependencies to watch
 * @param fn - Callback when dependencies change
 * @returns Cleanup function
 *
 * @example
 * const count = signal(0);
 * watchOnce([count], (newCount) => {
 *   console.log('Count changed once:', newCount);
 * });
 */
export function watchOnce<T = any>(
  deps: { (): any; peek?: () => any }[],
  fn: (newValues: T[]) => void
): EffectCleanup {
  let dispose: EffectCleanup;

  dispose = watch<T>(
    deps,
    (newValues) => {
      fn(newValues);
      dispose();
    },
    { immediate: false }
  );

  return dispose;
}

/**
 * Runs a function without tracking any dependencies.
 * Useful for reading signals inside effects without creating dependencies.
 *
 * @param fn - Function to run
 * @returns The return value of fn
 *
 * @example
 * effect(() => {
 *   const a = signalA(); // Tracked
 *   const b = untrack(() => signalB()); // Not tracked
 *   console.log(a, b);
 * });
 */
export function untrack<T>(fn: () => T): T {
  // TODO: Implement proper context management
  // For now, just execute the function
  return fn();
}

/**
 * Gets the owner/parent effect context.
 * Useful for manual resource management.
 */
export function getOwner(): Subscriber | null {
  return getCurrentSubscriber();
}

/**
 * Runs code in a specific owner context.
 * Advanced API for framework internals.
 */
export function runWithOwner<T>(_owner: Subscriber | null, fn: () => T): T {
  // TODO: Implement proper context management
  // For now, just execute the function
  return fn();
}
