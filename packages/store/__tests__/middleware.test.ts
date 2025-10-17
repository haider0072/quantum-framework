/**
 * Middleware tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStore } from '../src/store';
import {
  logger,
  thunk,
  crashReporter,
  performanceMonitor,
  actionHistory,
} from '../src/middleware';

describe('logger', () => {
  it('should log actions to console', () => {
    const mockLogger = {
      group: vi.fn(),
      groupCollapsed: vi.fn(),
      groupEnd: vi.fn(),
      log: vi.fn(),
    };

    const store = createStore({
      state: { count: 0 },
      actions: {
        increment(state) {
          state.count++;
        },
      },
      middleware: [logger({ logger: mockLogger as any })],
    });

    store.increment();

    expect(mockLogger.group).toHaveBeenCalled();
    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining('prev state'),
      expect.any(String),
      expect.any(Object)
    );
    expect(mockLogger.groupEnd).toHaveBeenCalled();
  });

  it('should use collapsed groups when configured', () => {
    const mockLogger = {
      group: vi.fn(),
      groupCollapsed: vi.fn(),
      groupEnd: vi.fn(),
      log: vi.fn(),
    };

    const store = createStore({
      state: { count: 0 },
      actions: {
        increment(state) {
          state.count++;
        },
      },
      middleware: [logger({ collapsed: true, logger: mockLogger as any })],
    });

    store.increment();

    expect(mockLogger.groupCollapsed).toHaveBeenCalled();
    expect(mockLogger.group).not.toHaveBeenCalled();
  });

  it('should filter actions with predicate', () => {
    const mockLogger = {
      group: vi.fn(),
      groupCollapsed: vi.fn(),
      groupEnd: vi.fn(),
      log: vi.fn(),
    };

    const store = createStore({
      state: { count: 0 },
      actions: {
        increment(state) {
          state.count++;
        },
        decrement(state) {
          state.count--;
        },
      },
      middleware: [
        logger({
          logger: mockLogger as any,
          predicate: (action) => action.name === 'increment',
        }),
      ],
    });

    store.increment();
    store.decrement();

    // Only logged once (for increment)
    expect(mockLogger.group).toHaveBeenCalledTimes(1);
  });
});

describe('thunk', () => {
  it('should handle async actions', async () => {
    const store = createStore({
      state: { value: 0 },
      actions: {
        async asyncIncrement(state) {
          await new Promise((resolve) => setTimeout(resolve, 10));
          state.value++;
        },
      },
      middleware: [thunk()],
    });

    await store.asyncIncrement();

    expect(store.getState().value).toBe(1);
  });
});

describe('crashReporter', () => {
  it('should call onError when action throws', () => {
    const onError = vi.fn();

    const store = createStore({
      state: { count: 0 },
      actions: {
        throwError() {
          throw new Error('Test error');
        },
      },
      middleware: [crashReporter({ onError })],
    });

    expect(() => store.throwError()).toThrow('Test error');
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ name: 'throwError' }),
      expect.any(Object)
    );
  });
});

describe('performanceMonitor', () => {
  it('should call onSlow for slow actions', () => {
    const onSlow = vi.fn();

    const store = createStore({
      state: { count: 0 },
      actions: {
        slowAction(state) {
          // Simulate slow operation
          const start = Date.now();
          while (Date.now() - start < 20) {
            // Busy wait
          }
          state.count++;
        },
      },
      middleware: [performanceMonitor({ threshold: 10, onSlow })],
    });

    store.slowAction();

    expect(onSlow).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'slowAction' }),
      expect.any(Number)
    );
  });

  it('should not call onSlow for fast actions', () => {
    const onSlow = vi.fn();

    const store = createStore({
      state: { count: 0 },
      actions: {
        fastAction(state) {
          state.count++;
        },
      },
      middleware: [performanceMonitor({ threshold: 100, onSlow })],
    });

    store.fastAction();

    expect(onSlow).not.toHaveBeenCalled();
  });
});

describe('actionHistory', () => {
  it('should track action history', () => {
    const history = actionHistory();

    const store = createStore({
      state: { count: 0 },
      actions: {
        increment(state) {
          state.count++;
        },
        decrement(state) {
          state.count--;
        },
      },
      middleware: [history],
    });

    store.increment();
    store.increment();
    store.decrement();

    const h = history.getHistory();
    expect(h).toHaveLength(3);
    expect(h[0].name).toBe('increment');
    expect(h[1].name).toBe('increment');
    expect(h[2].name).toBe('decrement');
  });

  it('should limit history size', () => {
    const history = actionHistory({ maxHistory: 2 });

    const store = createStore({
      state: { count: 0 },
      actions: {
        increment(state) {
          state.count++;
        },
      },
      middleware: [history],
    });

    store.increment();
    store.increment();
    store.increment();

    const h = history.getHistory();
    expect(h).toHaveLength(2);
  });

  it('should clear history', () => {
    const history = actionHistory();

    const store = createStore({
      state: { count: 0 },
      actions: {
        increment(state) {
          state.count++;
        },
      },
      middleware: [history],
    });

    store.increment();
    expect(history.getHistory()).toHaveLength(1);

    history.clear();
    expect(history.getHistory()).toHaveLength(0);
  });
});
