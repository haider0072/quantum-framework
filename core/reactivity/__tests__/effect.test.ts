import { describe, it, expect, vi } from 'vitest';
import { signal } from '../src/signal';
import { computed } from '../src/computed';
import { effect, watch, watchOnce } from '../src/effect';

describe('effect', () => {
  it('should run immediately by default', () => {
    const spy = vi.fn();
    effect(() => {
      spy();
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should track signal dependencies', () => {
    const count = signal(0);
    const spy = vi.fn();

    effect(() => {
      spy(count());
    });

    expect(spy).toHaveBeenCalledWith(0);

    count(1);
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should track multiple dependencies', () => {
    const a = signal(1);
    const b = signal(2);
    const spy = vi.fn();

    effect(() => {
      spy(a() + b());
    });

    expect(spy).toHaveBeenCalledWith(3);

    a(5);
    expect(spy).toHaveBeenCalledWith(7);

    b(10);
    expect(spy).toHaveBeenCalledWith(15);
  });

  it('should cleanup when disposed', () => {
    const count = signal(0);
    const spy = vi.fn();

    const dispose = effect(() => {
      spy(count());
    });

    expect(spy).toHaveBeenCalledTimes(1);

    count(1);
    expect(spy).toHaveBeenCalledTimes(2);

    dispose();

    count(2);
    expect(spy).toHaveBeenCalledTimes(2); // Should not run after dispose
  });

  it('should run cleanup function', () => {
    const count = signal(0);
    const cleanup = vi.fn();
    const spy = vi.fn();

    const dispose = effect((onCleanup) => {
      onCleanup(cleanup);
      spy(count());
    });

    expect(cleanup).not.toHaveBeenCalled();

    count(1);
    expect(cleanup).toHaveBeenCalledTimes(1); // Cleanup from previous run

    dispose();
    expect(cleanup).toHaveBeenCalledTimes(2); // Cleanup on dispose
  });

  it('should work with computed values', () => {
    const count = signal(0);
    const doubled = computed(() => count() * 2);
    const spy = vi.fn();

    effect(() => {
      spy(doubled());
    });

    expect(spy).toHaveBeenCalledWith(0);

    count(5);
    expect(spy).toHaveBeenCalledWith(10);
  });

  it('should not run with immediate: false', () => {
    const spy = vi.fn();

    effect(() => {
      spy();
    }, { immediate: false });

    expect(spy).not.toHaveBeenCalled();
  });

  it('should dynamically track dependencies', () => {
    const condition = signal(true);
    const a = signal(1);
    const b = signal(2);
    const spy = vi.fn();

    effect(() => {
      spy(condition() ? a() : b());
    });

    expect(spy).toHaveBeenCalledWith(1);

    a(10);
    expect(spy).toHaveBeenCalledWith(10);

    b(20);
    expect(spy).toHaveBeenCalledTimes(2); // b not tracked yet

    condition(false);
    expect(spy).toHaveBeenCalledWith(20);

    b(30);
    expect(spy).toHaveBeenCalledWith(30); // Now b is tracked

    a(100);
    expect(spy).toHaveBeenCalledTimes(5); // a not tracked anymore
  });
});

describe('watch', () => {
  it('should watch specific dependencies', () => {
    const a = signal(1);
    const b = signal(2);
    const spy = vi.fn();

    watch([a], (newVals, oldVals) => {
      spy(newVals, oldVals);
    });

    a(5);
    expect(spy).toHaveBeenCalledWith([5], [1]);

    b(10); // Should not trigger
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should provide old and new values', () => {
    const count = signal(0);
    const spy = vi.fn();

    watch([count], (newVals, oldVals) => {
      spy({ new: newVals[0], old: oldVals[0] });
    });

    count(1);
    expect(spy).toHaveBeenCalledWith({ new: 1, old: 0 });

    count(5);
    expect(spy).toHaveBeenCalledWith({ new: 5, old: 1 });
  });

  it('should watch multiple dependencies', () => {
    const a = signal(1);
    const b = signal(2);
    const spy = vi.fn();

    watch([a, b], (newVals) => {
      spy(newVals);
    });

    a(5);
    expect(spy).toHaveBeenCalledWith([5, 2]);

    b(10);
    expect(spy).toHaveBeenCalledWith([5, 10]);
  });
});

describe('watchOnce', () => {
  it('should only trigger once', () => {
    const count = signal(0);
    const spy = vi.fn();

    watchOnce([count], (newVals) => {
      spy(newVals[0]);
    });

    count(1);
    expect(spy).toHaveBeenCalledWith(1);

    count(2);
    expect(spy).toHaveBeenCalledTimes(1); // Should not trigger again
  });
});
