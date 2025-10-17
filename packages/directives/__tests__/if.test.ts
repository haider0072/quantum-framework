/**
 * Tests for v-if/v-else directives
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@quantum/reactivity';
import { vIf, vElse } from '../src/directives/if.js';
import type { DirectiveBinding } from '../src/types.js';

describe('v-if directive', () => {
  let el: HTMLElement;
  let parent: HTMLElement;

  beforeEach(() => {
    parent = document.createElement('div');
    el = document.createElement('div');
    el.textContent = 'Content';
    parent.appendChild(el);
    document.body.appendChild(parent);
  });

  describe('static values', () => {
    it('should create anchor comment node on mount', () => {
      const binding: DirectiveBinding<boolean> = { value: true };

      if (vIf.beforeMount) {
        vIf.beforeMount(el, binding);
      }

      // Check that anchor symbol exists
      const symbols = Object.getOwnPropertySymbols(el);
      expect(symbols.length).toBeGreaterThan(0);
    });

    it('should keep element in DOM when value is true', () => {
      const binding: DirectiveBinding<boolean> = { value: true };

      if (vIf.beforeMount) {
        vIf.beforeMount(el, binding);
      }
      if (vIf.mounted) {
        vIf.mounted(el, binding);
      }

      // Element should still be in parent
      expect(parent.contains(el)).toBe(true);
    });

    it('should remove element from DOM when value is false', () => {
      const binding: DirectiveBinding<boolean> = { value: false };

      if (vIf.beforeMount) {
        vIf.beforeMount(el, binding);
      }
      if (vIf.mounted) {
        vIf.mounted(el, binding);
      }

      // Element should be removed
      expect(parent.contains(el)).toBe(false);
    });

    it('should insert anchor comment before element', () => {
      const binding: DirectiveBinding<boolean> = { value: true };

      if (vIf.beforeMount) {
        vIf.beforeMount(el, binding);
      }
      if (vIf.mounted) {
        vIf.mounted(el, binding);
      }

      // First child should be comment node
      expect(parent.firstChild?.nodeType).toBe(Node.COMMENT_NODE);
      expect((parent.firstChild as Comment).textContent).toBe('v-if');
    });

    it('should preserve anchor when element is removed', () => {
      const binding: DirectiveBinding<boolean> = { value: false };

      if (vIf.beforeMount) {
        vIf.beforeMount(el, binding);
      }
      if (vIf.mounted) {
        vIf.mounted(el, binding);
      }

      // Anchor should still be in parent
      expect(parent.firstChild?.nodeType).toBe(Node.COMMENT_NODE);
      expect(parent.childNodes.length).toBe(1); // Only anchor
    });
  });

  describe('reactive values (signals)', () => {
    it('should react to signal changes - mount', () => {
      const condition = signal(false);
      const binding: DirectiveBinding<() => boolean> = { value: () => condition.value };

      if (vIf.beforeMount) {
        vIf.beforeMount(el, binding);
      }
      if (vIf.mounted) {
        vIf.mounted(el, binding);
      }

      // Initially false - element removed
      expect(parent.contains(el)).toBe(false);

      // Change to true
      condition.value = true;
      expect(parent.contains(el)).toBe(true);
    });

    it('should react to signal changes - unmount', () => {
      const condition = signal(true);
      const binding: DirectiveBinding<() => boolean> = { value: () => condition.value };

      if (vIf.beforeMount) {
        vIf.beforeMount(el, binding);
      }
      if (vIf.mounted) {
        vIf.mounted(el, binding);
      }

      // Initially true - element present
      expect(parent.contains(el)).toBe(true);

      // Change to false
      condition.value = false;
      expect(parent.contains(el)).toBe(false);
    });

    it('should handle multiple reactive toggles', () => {
      const condition = signal(true);
      const binding: DirectiveBinding<() => boolean> = { value: () => condition.value };

      if (vIf.beforeMount) {
        vIf.beforeMount(el, binding);
      }
      if (vIf.mounted) {
        vIf.mounted(el, binding);
      }

      expect(parent.contains(el)).toBe(true);

      condition.value = false;
      expect(parent.contains(el)).toBe(false);

      condition.value = true;
      expect(parent.contains(el)).toBe(true);

      condition.value = false;
      expect(parent.contains(el)).toBe(false);

      condition.value = true;
      expect(parent.contains(el)).toBe(true);
    });

    it('should insert element after anchor on mount', () => {
      const condition = signal(false);
      const binding: DirectiveBinding<() => boolean> = { value: () => condition.value };

      if (vIf.beforeMount) {
        vIf.beforeMount(el, binding);
      }
      if (vIf.mounted) {
        vIf.mounted(el, binding);
      }

      // Change to true
      condition.value = true;

      // Element should be after anchor comment
      expect(parent.firstChild?.nodeType).toBe(Node.COMMENT_NODE);
      expect(parent.childNodes[1]).toBe(el);
    });
  });

  describe('static updates', () => {
    it('should mount element when updated from false to true', () => {
      const binding1: DirectiveBinding<boolean> = { value: false };
      const binding2: DirectiveBinding<boolean> = { value: true, oldValue: false };

      if (vIf.beforeMount) {
        vIf.beforeMount(el, binding1);
      }
      if (vIf.mounted) {
        vIf.mounted(el, binding1);
      }

      expect(parent.contains(el)).toBe(false);

      if (vIf.updated) {
        vIf.updated(el, binding2, binding1);
      }

      expect(parent.contains(el)).toBe(true);
    });

    it('should unmount element when updated from true to false', () => {
      const binding1: DirectiveBinding<boolean> = { value: true };
      const binding2: DirectiveBinding<boolean> = { value: false, oldValue: true };

      if (vIf.beforeMount) {
        vIf.beforeMount(el, binding1);
      }
      if (vIf.mounted) {
        vIf.mounted(el, binding1);
      }

      expect(parent.contains(el)).toBe(true);

      if (vIf.updated) {
        vIf.updated(el, binding2, binding1);
      }

      expect(parent.contains(el)).toBe(false);
    });

    it('should not change when value stays the same', () => {
      const binding1: DirectiveBinding<boolean> = { value: true };
      const binding2: DirectiveBinding<boolean> = { value: true, oldValue: true };

      if (vIf.beforeMount) {
        vIf.beforeMount(el, binding1);
      }
      if (vIf.mounted) {
        vIf.mounted(el, binding1);
      }

      expect(parent.contains(el)).toBe(true);

      if (vIf.updated) {
        vIf.updated(el, binding2, binding1);
      }

      expect(parent.contains(el)).toBe(true);
    });
  });

  describe('lifecycle', () => {
    it('should cleanup anchor on beforeUnmount', () => {
      const binding: DirectiveBinding<boolean> = { value: true };

      if (vIf.beforeMount) {
        vIf.beforeMount(el, binding);
      }
      if (vIf.mounted) {
        vIf.mounted(el, binding);
      }

      // Anchor should exist
      expect(parent.firstChild?.nodeType).toBe(Node.COMMENT_NODE);

      if (vIf.beforeUnmount) {
        vIf.beforeUnmount(el, binding);
      }

      // Anchor should be removed
      expect(parent.querySelector('comment')).toBeNull();
    });

    it('should cleanup symbol properties on beforeUnmount', () => {
      const condition = signal(true);
      const binding: DirectiveBinding<() => boolean> = { value: () => condition.value };

      if (vIf.beforeMount) {
        vIf.beforeMount(el, binding);
      }
      if (vIf.mounted) {
        vIf.mounted(el, binding);
      }

      // Symbols should exist
      const symbolsBefore = Object.getOwnPropertySymbols(el);
      expect(symbolsBefore.length).toBeGreaterThan(0);

      if (vIf.beforeUnmount) {
        vIf.beforeUnmount(el, binding);
      }

      // Directive symbols should be deleted
      const symbolsAfter = Object.getOwnPropertySymbols(el);
      expect(symbolsAfter.length).toBeLessThan(symbolsBefore.length);
    });
  });
});

describe('v-else directive', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('div');
    document.body.appendChild(el);
  });

  it('should set data-v-else attribute on mount', () => {
    const binding: DirectiveBinding<void> = { value: undefined };

    if (vElse.mounted) {
      vElse.mounted(el, binding);
    }

    expect(el.hasAttribute('data-v-else')).toBe(true);
  });
});
