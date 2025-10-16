import { describe, it, expect, vi } from 'vitest';
import { signal } from '../src/signal';
import { effect } from '../src/effect';
import { batch, batched, isBatchUpdate, afterBatch } from '../src/batch';

describe('batch', () => {
  it('should batch multiple updates into one', () => {
    const a = signal(1);
    const b = signal(2);
    const spy = vi.fn();

    effect(() => {
      spy(a() + b());
    });

    expect(spy).toHaveBeenCalledTimes(1);

    batch(() => {
      a(5);
      b(10);
    });

    expect(spy).toHaveBeenCalledTimes(2); // Only one more time, not two
    expect(spy).toHaveBeenLastCalledWith(15);
  });

  it('should handle nested batches', () => {
    const count = signal(0);
    const spy = vi.fn();

    effect(() => {
      spy(count());
    });

    expect(spy).toHaveBeenCalledTimes(1);

    batch(() => {
      count(1);
      batch(() => {
        count(2);
      });
      count(3);
    });

    expect(spy).toHaveBeenCalledTimes(2); // Only one update after all batches
    expect(spy).toHaveBeenLastCalledWith(3);
  });

  it('should return the value from batch function', () => {
    const result = batch(() => {
      return 42;
    });

    expect(result).toBe(42);
  });

  it('should handle errors in batch', () => {
    const count = signal(0);

    expect(() => {
      batch(() => {
        count(1);
        throw new Error('Test error');
      });
    }).toThrow('Test error');

    // Updates should still be flushed even on error
    expect(count()).toBe(1);
  });
});

describe('batched', () => {
  it('should create a batched function', () => {
    const a = signal(1);
    const b = signal(2);
    const spy = vi.fn();

    effect(() => {
      spy(a() + b());
    });

    const updateBoth = batched((x: number, y: number) => {
      a(x);
      b(y);
    });

    expect(spy).toHaveBeenCalledTimes(1);

    updateBoth(5, 10);

    expect(spy).toHaveBeenCalledTimes(2); // Only one update
    expect(spy).toHaveBeenLastCalledWith(15);
  });

  it('should preserve function return value', () => {
    const fn = batched((x: number, y: number) => x + y);
    const result = fn(5, 10);
    expect(result).toBe(15);
  });
});

describe('isBatchUpdate', () => {
  it('should return true inside batch', () => {
    expect(isBatchUpdate()).toBe(false);

    batch(() => {
      expect(isBatchUpdate()).toBe(true);
    });

    expect(isBatchUpdate()).toBe(false);
  });
});

describe('afterBatch', () => {
  it('should run callback after batch completes', async () => {
    const count = signal(0);
    const spy = vi.fn();
    const afterSpy = vi.fn();

    effect(() => {
      spy(count());
    });

    batch(() => {
      count(1);
      afterBatch(() => {
        afterSpy(count());
      });
      count(2);
    });

    // Wait for microtask
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(afterSpy).toHaveBeenCalledWith(2);
  });

  it('should run immediately if not batching', async () => {
    const spy = vi.fn();

    afterBatch(() => {
      spy();
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(spy).toHaveBeenCalled();
  });
});
