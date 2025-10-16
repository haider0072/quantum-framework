/**
 * Quantum Framework - Dependency Tracking
 *
 * Core system for tracking reactive dependencies and managing subscriptions.
 * This is the heart of Quantum's fine-grained reactivity.
 */

export interface Subscriber {
  execute: () => void;
  dependencies: Set<Set<Subscriber>>;
}

// Global context for tracking the current subscriber
let currentSubscriber: Subscriber | null = null;
const subscriberStack: Subscriber[] = [];

// Batch update management
let batchDepth = 0;
const pendingSubscribers = new Set<Subscriber>();

/**
 * Gets the current subscriber being executed
 */
export function getCurrentSubscriber(): Subscriber | null {
  return currentSubscriber;
}

/**
 * Sets the current subscriber context
 */
export function setCurrentSubscriber(subscriber: Subscriber | null): void {
  currentSubscriber = subscriber;
}

/**
 * Tracks a subscriber for a set of signals
 */
export function trackSubscriber(subscribers: Set<Subscriber>): void {
  if (currentSubscriber) {
    subscribers.add(currentSubscriber);
    currentSubscriber.dependencies.add(subscribers);
  }
}

/**
 * Triggers all subscribers when a signal changes
 */
export function triggerSubscribers(subscribers: Set<Subscriber>): void {
  if (batchDepth > 0) {
    // In batch mode, queue subscribers for later
    subscribers.forEach((subscriber) => pendingSubscribers.add(subscriber));
  } else {
    // Execute immediately
    subscribers.forEach((subscriber) => {
      cleanupSubscriber(subscriber);
      runSubscriber(subscriber);
    });
  }
}

/**
 * Runs a subscriber and tracks its dependencies
 */
export function runSubscriber(subscriber: Subscriber): void {
  subscriberStack.push(currentSubscriber!);
  currentSubscriber = subscriber;

  try {
    subscriber.execute();
  } finally {
    currentSubscriber = subscriberStack.pop() ?? null;
  }
}

/**
 * Cleans up a subscriber's dependencies
 */
export function cleanupSubscriber(subscriber: Subscriber): void {
  subscriber.dependencies.forEach((dep) => {
    dep.delete(subscriber);
  });
  subscriber.dependencies.clear();
}

/**
 * Starts a batch update block
 */
export function startBatch(): void {
  batchDepth++;
}

/**
 * Ends a batch update block and flushes pending updates
 */
export function endBatch(): void {
  batchDepth--;

  if (batchDepth === 0 && pendingSubscribers.size > 0) {
    const subscribers = Array.from(pendingSubscribers);
    pendingSubscribers.clear();

    subscribers.forEach((subscriber) => {
      cleanupSubscriber(subscriber);
      runSubscriber(subscriber);
    });
  }
}

/**
 * Checks if currently in a batch update
 */
export function isBatching(): boolean {
  return batchDepth > 0;
}
