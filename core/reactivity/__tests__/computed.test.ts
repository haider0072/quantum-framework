import { describe, it, expect, vi } from 'vitest';
import { signal } from '../src/signal';
import { computed, memo } from '../src/computed';
import { effect } from '../src/effect';

describe('computed', () => {
  it('should compute derived value', () => {
    const count = signal(2);
    const doubled = computed(() => count() * 2);

    expect(doubled()).toBe(4);
  });

  it('should update when dependency changes', () => {
    const count = signal(2);
    const doubled = computed(() => count() * 2);

    count(5);
    expect(doubled()).toBe(10);
  });

  it('should be lazy - only compute when accessed', () => {
    const spy = vi.fn();
    const count = signal(0);
    const doubled = computed(() => {
      spy();
      return count() * 2;
    });

    expect(spy).not.toHaveBeenCalled();
    doubled(); // First access
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should cache computed value', () => {
    const spy = vi.fn();
    const count = signal(0);
    const doubled = computed(() => {
      spy();
      return count() * 2;
    });

    doubled();
    doubled();
    doubled();

    expect(spy).toHaveBeenCalledTimes(1); // Should only compute once
  });

  it('should invalidate cache on dependency change', () => {
    const spy = vi.fn();
    const count = signal(0);
    const doubled = computed(() => {
      spy();
      return count() * 2;
    });

    doubled();
    expect(spy).toHaveBeenCalledTimes(1);

    count(1);
    doubled();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should work with multiple dependencies', () => {
    const a = signal(2);
    const b = signal(3);
    const sum = computed(() => a() + b());

    expect(sum()).toBe(5);

    a(10);
    expect(sum()).toBe(13);

    b(20);
    expect(sum()).toBe(30);
  });

  it('should chain computeds', () => {
    const count = signal(2);
    const doubled = computed(() => count() * 2);
    const quadrupled = computed(() => doubled() * 2);

    expect(quadrupled()).toBe(8);

    count(5);
    expect(quadrupled()).toBe(20);
  });

  it('should peek without tracking', () => {
    const count = signal(0);
    const doubled = computed(() => count() * 2);
    const spy = vi.fn();

    effect(() => {
      doubled.peek();
      spy();
    });

    expect(spy).toHaveBeenCalledTimes(1);
    count(1);
    expect(spy).toHaveBeenCalledTimes(1); // Should not trigger
  });

  it('should work with effects', () => {
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
});

describe('memo', () => {
  it('should work like computed without deps', () => {
    const count = signal(0);
    const doubled = memo(() => count() * 2);

    expect(doubled()).toBe(0);
    count(5);
    expect(doubled()).toBe(10);
  });

  it('should only recompute when specified deps change', () => {
    const spy = vi.fn();
    const a = signal(1);
    const b = signal(2);
    const result = memo(
      () => {
        spy();
        return a() + b();
      },
      [a]
    );

    result();
    expect(spy).toHaveBeenCalledTimes(1);

    b(10); // b is not in deps
    result();
    expect(spy).toHaveBeenCalledTimes(1); // Should not recompute

    a(5); // a is in deps
    result();
    expect(spy).toHaveBeenCalledTimes(2); // Should recompute
  });
});
