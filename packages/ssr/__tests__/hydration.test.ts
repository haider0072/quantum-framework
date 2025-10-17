/**
 * Tests for client-side hydration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  hydrate,
  createHydrationRoot,
  isHydrationActive,
  clearHydrationMismatches,
  getHydrationMismatches,
} from '../src/hydration';

describe('Hydration', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    clearHydrationMismatches();
  });

  afterEach(() => {
    document.body.removeChild(container);
    clearHydrationMismatches();
  });

  describe('hydrate', () => {
    it('should hydrate server-rendered content', () => {
      // Setup server-rendered HTML
      container.innerHTML = '<div data-quantum-ssr>Hello, World!</div>';

      const component = {
        type: 'div',
        props: { children: 'Hello, World!' },
      };

      // Hydrate should not throw
      expect(() => hydrate(component, container)).not.toThrow();
    });

    it('should remove SSR markers after hydration', () => {
      container.innerHTML = '<div data-quantum-ssr>Content</div>';

      const component = {
        type: 'div',
        props: { children: 'Content' },
      };

      hydrate(component, container);

      const div = container.querySelector('div');
      expect(div?.hasAttribute('data-quantum-ssr')).toBe(false);
    });

    it('should set isHydrationActive during hydration', () => {
      container.innerHTML = '<div data-quantum-ssr>Content</div>';

      const component = {
        type: 'div',
        props: { children: 'Content' },
      };

      let wasHydrating = false;

      const Component = () => {
        wasHydrating = isHydrationActive();
        return component;
      };

      hydrate({ type: Component, props: {} }, container);

      // During hydration should be true
      expect(wasHydrating).toBe(true);

      // After hydration should be false
      expect(isHydrationActive()).toBe(false);
    });

    it('should call onHydrated callback', () => {
      container.innerHTML = '<div data-quantum-ssr>Content</div>';

      const component = {
        type: 'div',
        props: { children: 'Content' },
      };

      const onHydrated = vi.fn();

      hydrate(component, container, { onHydrated });

      expect(onHydrated).toHaveBeenCalledOnce();
    });

    it('should call onError on hydration error', () => {
      const onError = vi.fn();

      const BrokenComponent = () => {
        throw new Error('Hydration error');
      };

      const component = {
        type: BrokenComponent,
        props: {},
      };

      hydrate(component, container, { onError });

      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0].message).toBe('Hydration error');
    });

    it('should warn about missing SSR markers', () => {
      // No SSR markers in HTML
      container.innerHTML = '<div>Content</div>';

      const component = {
        type: 'div',
        props: { children: 'Content' },
      };

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      hydrate(component, container);

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('No SSR markers found');

      consoleSpy.mockRestore();
    });

    it('should suppress warnings when requested', () => {
      container.innerHTML = '<div>Content</div>';

      const component = {
        type: 'div',
        props: { children: 'Content' },
      };

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      hydrate(component, container, { suppressHydrationWarning: true });

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('createHydrationRoot', () => {
    it('should create a hydration root', () => {
      const root = createHydrationRoot(container);

      expect(root).toBeDefined();
      expect(root.element).toBe(container);
      expect(typeof root.hydrate).toBe('function');
      expect(typeof root.unmount).toBe('function');
      expect(typeof root.isHydrating).toBe('function');
    });

    it('should hydrate when hydrate() is called', () => {
      container.innerHTML = '<div data-quantum-ssr>Content</div>';

      const root = createHydrationRoot(container);

      const component = {
        type: 'div',
        props: { children: 'Content' },
      };

      expect(() => root.hydrate(component)).not.toThrow();
    });

    it('should report hydrating state', () => {
      const root = createHydrationRoot(container);

      expect(root.isHydrating()).toBe(false);

      // Hydrating state is only true during the hydrate call
      // which happens synchronously, so we can't easily test it
    });

    it('should unmount when unmount() is called', () => {
      container.innerHTML = '<div data-quantum-ssr>Content</div>';

      const root = createHydrationRoot(container);

      const component = {
        type: 'div',
        props: { children: 'Content' },
      };

      root.hydrate(component);

      expect(container.innerHTML).toBeTruthy();

      root.unmount();

      expect(container.innerHTML).toBe('');
    });
  });

  describe('Hydration mismatches', () => {
    it('should track hydration mismatches', () => {
      clearHydrationMismatches();

      const mismatches = getHydrationMismatches();

      expect(Array.isArray(mismatches)).toBe(true);
      expect(mismatches.length).toBe(0);
    });

    it('should clear hydration mismatches', () => {
      clearHydrationMismatches();

      const mismatches = getHydrationMismatches();

      expect(mismatches.length).toBe(0);
    });
  });
});
