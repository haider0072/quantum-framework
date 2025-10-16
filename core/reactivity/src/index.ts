/**
 * Quantum Framework - Reactivity System
 *
 * Fine-grained reactive primitives for building high-performance UIs.
 * @packageDocumentation
 */

// Core primitives
export { signal, signals, type Signal } from './signal';
export { computed, memo, type Computed } from './computed';
export {
  effect,
  watch,
  watchOnce,
  untrack,
  getOwner,
  runWithOwner,
  type EffectCleanup,
  type EffectOptions,
} from './effect';

// Batch updates
export {
  batch,
  batched,
  isBatchUpdate,
  flushBatch,
  afterBatch,
  transaction,
} from './batch';

// Internal tracking (for advanced use)
export type { Subscriber } from './tracking';
