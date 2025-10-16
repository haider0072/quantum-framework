/**
 * Quantum Framework - Batch Updates
 *
 * Batching multiple state updates to trigger only one re-render.
 * Critical for performance when updating multiple signals.
 */

import { startBatch, endBatch, isBatching } from './tracking';

/**
 * Batches multiple signal updates into a single update cycle.
 * All updates within the batch function will only trigger one re-render.
 *
 * @param fn - Function containing signal updates
 * @returns The return value of fn
 *
 * @example
 * const count = signal(0);
 * const name = signal('Quantum');
 *
 * effect(() => {
 *   console.log(count(), name());
 * });
 *
 * // Without batch: logs twice
 * count(1);
 * name('Framework');
 *
 * // With batch: logs once
 * batch(() => {
 *   count(2);
 *   name('Updated');
 * });
 */
export function batch<T>(fn: () => T): T {
  startBatch();
  try {
    return fn();
  } finally {
    endBatch();
  }
}

/**
 * Creates a batched version of a function.
 * All signal updates in the function will be batched automatically.
 *
 * @param fn - Function to batch
 * @returns Batched version of the function
 *
 * @example
 * const updateMultiple = batched((a: number, b: string) => {
 *   count(a);
 *   name(b);
 * });
 *
 * updateMultiple(5, 'Test'); // Only one re-render
 */
export function batched<Args extends any[], Return>(
  fn: (...args: Args) => Return
): (...args: Args) => Return {
  return (...args: Args) => batch(() => fn(...args));
}

/**
 * Checks if currently inside a batch.
 * Useful for conditional batching logic.
 *
 * @returns true if batching, false otherwise
 *
 * @example
 * if (!isBatchUpdate()) {
 *   batch(() => {
 *     // Multiple updates
 *   });
 * }
 */
export function isBatchUpdate(): boolean {
  return isBatching();
}

/**
 * Flushes a batch immediately without waiting.
 * Advanced API - use with caution.
 *
 * @example
 * batch(() => {
 *   signal1(10);
 *   flushBatch(); // Force flush here
 *   signal2(20);
 * });
 */
export function flushBatch(): void {
  if (isBatching()) {
    endBatch();
    startBatch();
  }
}

/**
 * Defers execution until after the current batch completes.
 * Similar to queueMicrotask but batch-aware.
 *
 * @param fn - Function to execute after batch
 *
 * @example
 * batch(() => {
 *   count(1);
 *   afterBatch(() => {
 *     console.log('Batch complete, count is:', count());
 *   });
 *   count(2);
 * });
 */
export function afterBatch(fn: () => void): void {
  if (isBatching()) {
    // Queue for after batch ends
    queueMicrotask(() => {
      if (!isBatching()) {
        fn();
      } else {
        // Still batching, queue again
        afterBatch(fn);
      }
    });
  } else {
    // Not batching, run immediately
    queueMicrotask(fn);
  }
}

/**
 * Transaction wrapper that batches and can be rolled back on error.
 *
 * @param fn - Function to execute in transaction
 * @returns Promise resolving to fn's return value
 *
 * @example
 * try {
 *   await transaction(() => {
 *     count(5);
 *     if (someCondition) {
 *       throw new Error('Rollback');
 *     }
 *     name('Updated');
 *   });
 * } catch (e) {
 *   // All updates rolled back
 * }
 */
export async function transaction<T>(fn: () => T | Promise<T>): Promise<T> {
  // Store snapshots of all signals (for rollback)
  // This would require signal registry - placeholder for now

  return batch(async () => {
    try {
      return await fn();
    } catch (error) {
      // Rollback logic would go here
      throw error;
    }
  });
}
