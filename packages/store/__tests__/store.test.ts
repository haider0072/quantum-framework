/**
 * Core store tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStore, combineStores, select } from '../src/store';

describe('createStore', () => {
  it('should create a store with initial state', () => {
    const store = createStore({
      state: { count: 0 },
    });

    expect(store.getState()).toEqual({ count: 0 });
  });

  it('should create a store with getters', () => {
    const store = createStore({
      state: { count: 5 },
      getters: {
        doubled: (state) => state.count * 2,
        tripled: (state) => state.count * 3,
      },
    });

    const state = store.getState();
    expect(state.count).toBe(5);
    expect(state.doubled).toBe(10);
    expect(state.tripled).toBe(15);
  });

  it('should create a store with actions', () => {
    const store = createStore({
      state: { count: 0 },
      actions: {
        increment(state) {
          state.count++;
        },
        incrementBy(state, amount: number) {
          state.count += amount;
        },
      },
    });

    store.increment();
    expect(store.getState().count).toBe(1);

    store.incrementBy(5);
    expect(store.getState().count).toBe(6);
  });

  it('should handle async actions', async () => {
    const store = createStore({
      state: { value: 0 },
      actions: {
        async asyncIncrement(state) {
          await new Promise((resolve) => setTimeout(resolve, 10));
          state.value++;
        },
      },
    });

    await store.asyncIncrement();
    expect(store.getState().value).toBe(1);
  });

  it('should notify subscribers on state change', () => {
    const store = createStore({
      state: { count: 0 },
      actions: {
        increment(state) {
          state.count++;
        },
      },
    });

    const listener = vi.fn();
    store.subscribe(listener);

    store.increment();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      { count: 1 },
      { count: 0 }
    );
  });

  it('should unsubscribe correctly', () => {
    const store = createStore({
      state: { count: 0 },
      actions: {
        increment(state) {
          state.count++;
        },
      },
    });

    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.increment();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.increment();
    expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
  });

  it('should reset to initial state', () => {
    const store = createStore({
      state: { count: 0, name: 'test' },
      actions: {
        increment(state) {
          state.count++;
        },
        setName(state, name: string) {
          state.name = name;
        },
      },
    });

    store.increment();
    store.setName('changed');
    expect(store.getState()).toEqual({ count: 1, name: 'changed' });

    store.reset();
    expect(store.getState()).toEqual({ count: 0, name: 'test' });
  });

  it('should batch multiple updates', () => {
    const store = createStore({
      state: { count: 0, value: 0 },
      actions: {
        updateBoth(state) {
          state.count++;
          state.value++;
        },
      },
    });

    const listener = vi.fn();
    store.subscribe(listener);

    store.updateBoth();

    // Should only be called once due to batching
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getState()).toEqual({ count: 1, value: 1 });
  });

  it('should have a custom name', () => {
    const store = createStore({
      state: { count: 0 },
      name: 'CounterStore',
    });

    expect(store.name).toBe('CounterStore');
  });

  it('should cleanup on destroy', () => {
    const store = createStore({
      state: { count: 0 },
      actions: {
        increment(state) {
          state.count++;
        },
      },
    });

    const listener = vi.fn();
    store.subscribe(listener);

    store.destroy();
    store.increment();

    // Listener should not be called after destroy
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('combineStores', () => {
  it('should combine multiple stores', () => {
    const counterStore = createStore({
      state: { count: 0 },
      name: 'counter',
    });

    const userStore = createStore({
      state: { name: 'John' },
      name: 'user',
    });

    const rootStore = combineStores({
      counter: counterStore,
      user: userStore,
    });

    expect(rootStore.counter).toBe(counterStore);
    expect(rootStore.user).toBe(userStore);
  });
});

describe('select', () => {
  it('should select a value from store', () => {
    const store = createStore({
      state: { count: 5, name: 'test' },
    });

    const count = select(store, (state) => state.count);
    expect(count).toBe(5);

    const name = select(store, (state) => state.name);
    expect(name).toBe('test');
  });

  it('should select computed values', () => {
    const store = createStore({
      state: { count: 5 },
      getters: {
        doubled: (state) => state.count * 2,
      },
    });

    const doubled = select(store, (state) => state.doubled);
    expect(doubled).toBe(10);
  });
});

describe('getters reactivity', () => {
  it('should update computed values when state changes', () => {
    const store = createStore({
      state: { count: 5 },
      getters: {
        doubled: (state) => state.count * 2,
      },
      actions: {
        increment(state) {
          state.count++;
        },
      },
    });

    expect(store.getState().doubled).toBe(10);

    store.increment();
    expect(store.getState().doubled).toBe(12);
  });

  it('should handle multiple getters depending on same state', () => {
    const store = createStore({
      state: { count: 5 },
      getters: {
        doubled: (state) => state.count * 2,
        tripled: (state) => state.count * 3,
        quadrupled: (state) => state.count * 4,
      },
      actions: {
        setCount(state, value: number) {
          state.count = value;
        },
      },
    });

    store.setCount(10);
    const state = store.getState();

    expect(state.doubled).toBe(20);
    expect(state.tripled).toBe(30);
    expect(state.quadrupled).toBe(40);
  });
});

describe('middleware', () => {
  it('should execute middleware in order', () => {
    const calls: string[] = [];

    const middleware1 = () => (next: any) => (action: any) => {
      calls.push('middleware1-before');
      const result = next(action);
      calls.push('middleware1-after');
      return result;
    };

    const middleware2 = () => (next: any) => (action: any) => {
      calls.push('middleware2-before');
      const result = next(action);
      calls.push('middleware2-after');
      return result;
    };

    const store = createStore({
      state: { count: 0 },
      actions: {
        increment(state) {
          calls.push('action');
          state.count++;
        },
      },
      middleware: [middleware1, middleware2],
    });

    store.increment();

    expect(calls).toEqual([
      'middleware1-before',
      'middleware2-before',
      'action',
      'middleware2-after',
      'middleware1-after',
    ]);
  });

  it('should pass action metadata to middleware', () => {
    let capturedAction: any = null;

    const middleware = () => (next: any) => (action: any) => {
      capturedAction = action;
      return next(action);
    };

    const store = createStore({
      state: { count: 0 },
      actions: {
        incrementBy(state, amount: number) {
          state.count += amount;
        },
      },
      middleware: [middleware],
    });

    store.incrementBy(5);

    expect(capturedAction).toMatchObject({
      name: 'incrementBy',
      args: [5],
    });
    expect(capturedAction.timestamp).toBeTypeOf('number');
  });
});

describe('plugins', () => {
  it('should execute plugins on store creation', () => {
    const plugin = vi.fn();

    const store = createStore({
      state: { count: 0 },
      plugins: [plugin],
    });

    expect(plugin).toHaveBeenCalledTimes(1);
    expect(plugin).toHaveBeenCalledWith(store);
  });

  it('should allow plugins to modify store', () => {
    const plugin = (store: any) => {
      // Plugin adds a custom method
      store.customMethod = () => 'custom';
    };

    const store = createStore({
      state: { count: 0 },
      plugins: [plugin],
    }) as any;

    expect(store.customMethod()).toBe('custom');
  });
});
