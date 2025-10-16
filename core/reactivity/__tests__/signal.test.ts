import { describe, it, expect, vi } from 'vitest';
import { signal, signals } from '../src/signal';
import { effect } from '../src/effect';

describe('signal', () => {
  it('should create a signal with initial value', () => {
    const count = signal(0);
    expect(count()).toBe(0);
  });

  it('should update signal value', () => {
    const count = signal(0);
    count(5);
    expect(count()).toBe(5);
  });

  it('should update using update function', () => {
    const count = signal(0);
    count.update((n) => n + 1);
    expect(count()).toBe(1);
  });

  it('should peek without tracking', () => {
    const count = signal(0);
    const spy = vi.fn();

    effect(() => {
      count.peek(); // Should not track
      spy();
    });

    expect(spy).toHaveBeenCalledTimes(1);
    count(1);
    expect(spy).toHaveBeenCalledTimes(1); // Should not trigger
  });

  it('should only notify on actual changes', () => {
    const count = signal(0);
    const spy = vi.fn();

    effect(() => {
      spy(count());
    });

    expect(spy).toHaveBeenCalledTimes(1);
    count(0); // Same value
    expect(spy).toHaveBeenCalledTimes(1); // Should not trigger
    count(1); // Different value
    expect(spy).toHaveBeenCalledTimes(2); // Should trigger
  });

  it('should support manual subscription', () => {
    const count = signal(0);
    const spy = vi.fn();

    const unsubscribe = count.subscribe(spy);

    count(1);
    expect(spy).toHaveBeenCalledWith(1);

    unsubscribe();
    count(2);
    expect(spy).toHaveBeenCalledTimes(1); // Should not trigger after unsubscribe
  });

  it('should create multiple signals from object', () => {
    const state = signals({ count: 0, name: 'Quantum' });

    expect(state.count()).toBe(0);
    expect(state.name()).toBe('Quantum');

    state.count(5);
    state.name('Framework');

    expect(state.count()).toBe(5);
    expect(state.name()).toBe('Framework');
  });

  it('should handle complex types', () => {
    const user = signal({ name: 'Alice', age: 30 });

    expect(user().name).toBe('Alice');

    user({ name: 'Bob', age: 25 });
    expect(user().name).toBe('Bob');
  });

  it('should handle arrays', () => {
    const list = signal([1, 2, 3]);

    list.update((arr) => [...arr, 4]);
    expect(list()).toEqual([1, 2, 3, 4]);
  });
});
