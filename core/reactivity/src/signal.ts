/**
 * Quantum Framework - Signal Primitive
 *
 * Fine-grained reactive state management with automatic dependency tracking.
 * Signals are the foundation of Quantum's reactivity system.
 */

import { Subscriber, trackSubscriber, triggerSubscribers } from './tracking';

export interface Signal<T> {
  (): T;
  (value: T): T;
  peek(): T;
  update(fn: (value: T) => T): T;
  subscribe(fn: (value: T) => void): () => void;
}

/**
 * Creates a reactive signal that tracks reads and notifies on writes.
 *
 * @param initialValue - The initial value of the signal
 * @returns A signal accessor/setter function
 *
 * @example
 * const count = signal(0);
 * console.log(count()); // 0
 * count(1); // Set to 1
 * count.update(n => n + 1); // Increment
 */
export function signal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  const subscribers = new Set<Subscriber>();

  // The main signal function - acts as both getter and setter
  const read = (() => {
    // Track this signal as a dependency of the current computation
    trackSubscriber(subscribers);
    return value;
  }) as Signal<T>;

  // Setter overload
  const write = (newValue: T) => {
    if (!Object.is(value, newValue)) {
      value = newValue;
      triggerSubscribers(subscribers);
    }
    return value;
  };

  // Combine getter/setter into one function
  const signalFn = function (newValue?: T) {
    if (arguments.length === 0) {
      return read();
    }
    return write(newValue as T);
  } as Signal<T>;

  // Peek at value without tracking
  signalFn.peek = () => value;

  // Update value using a function
  signalFn.update = (fn: (value: T) => T) => {
    const newValue = fn(value);
    return write(newValue);
  };

  // Manual subscription (for advanced use cases)
  signalFn.subscribe = (fn: (value: T) => void) => {
    const subscriber: Subscriber = {
      execute: () => fn(value),
      dependencies: new Set([subscribers]),
    };
    subscribers.add(subscriber);

    return () => {
      subscribers.delete(subscriber);
    };
  };

  return signalFn;
}

/**
 * Creates multiple signals from an object.
 *
 * @example
 * const state = signals({ count: 0, name: 'Quantum' });
 * state.count(); // 0
 * state.count(5);
 */
export function signals<T extends Record<string, any>>(
  obj: T
): { [K in keyof T]: Signal<T[K]> } {
  const result = {} as { [K in keyof T]: Signal<T[K]> };

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = signal(obj[key]);
    }
  }

  return result;
}
