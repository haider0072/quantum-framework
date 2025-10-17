/**
 * Tests for v-show directive
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@quantum/reactivity';
import { vShow } from '../src/directives/show.js';
import type { DirectiveBinding } from '../src/types.js';

describe('v-show directive', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('div');
    document.body.appendChild(el);
  });

  describe('static values', () => {
    it('should show element when value is true', () => {
      const binding: DirectiveBinding<boolean> = { value: true };

      if (vShow.mounted) {
        vShow.mounted(el, binding);
      }

      expect(el.style.display).not.toBe('none');
    });

    it('should hide element when value is false', () => {
      const binding: DirectiveBinding<boolean> = { value: false };

      if (vShow.mounted) {
        vShow.mounted(el, binding);
      }

      expect(el.style.display).toBe('none');
    });

    it('should preserve original display value', () => {
      el.style.display = 'flex';
      const binding: DirectiveBinding<boolean> = { value: true };

      if (vShow.mounted) {
        vShow.mounted(el, binding);
      }

      expect(el.style.display).toBe('flex');
    });

    it('should restore original display when showing after hiding', () => {
      el.style.display = 'inline-block';
      const binding1: DirectiveBinding<boolean> = { value: false };

      if (vShow.mounted) {
        vShow.mounted(el, binding1);
      }
      expect(el.style.display).toBe('none');

      const binding2: DirectiveBinding<boolean> = { value: true };
      if (vShow.updated) {
        vShow.updated(el, binding2, binding1);
      }
      expect(el.style.display).toBe('inline-block');
    });

    it('should handle empty display value', () => {
      el.style.display = '';
      const binding: DirectiveBinding<boolean> = { value: true };

      if (vShow.mounted) {
        vShow.mounted(el, binding);
      }

      expect(el.style.display).toBe('');
    });
  });

  describe('reactive values (signals)', () => {
    it('should react to signal changes', () => {
      const visible = signal(true);
      const binding: DirectiveBinding<() => boolean> = { value: () => visible.value };

      if (vShow.mounted) {
        vShow.mounted(el, binding);
      }

      expect(el.style.display).not.toBe('none');

      // Change signal
      visible.value = false;
      expect(el.style.display).toBe('none');

      // Change back
      visible.value = true;
      expect(el.style.display).not.toBe('none');
    });

    it('should preserve original display with signals', () => {
      el.style.display = 'grid';
      const visible = signal(false);
      const binding: DirectiveBinding<() => boolean> = { value: () => visible.value };

      if (vShow.mounted) {
        vShow.mounted(el, binding);
      }

      expect(el.style.display).toBe('none');

      visible.value = true;
      expect(el.style.display).toBe('grid');
    });

    it('should handle multiple reactive updates', () => {
      const visible = signal(true);
      const binding: DirectiveBinding<() => boolean> = { value: () => visible.value };

      if (vShow.mounted) {
        vShow.mounted(el, binding);
      }

      expect(el.style.display).not.toBe('none');

      // Toggle multiple times
      visible.value = false;
      expect(el.style.display).toBe('none');

      visible.value = true;
      expect(el.style.display).not.toBe('none');

      visible.value = false;
      expect(el.style.display).toBe('none');

      visible.value = true;
      expect(el.style.display).not.toBe('none');
    });
  });

  describe('lifecycle', () => {
    it('should cleanup on beforeUnmount', () => {
      const visible = signal(true);
      const binding: DirectiveBinding<() => boolean> = { value: () => visible.value };

      if (vShow.mounted) {
        vShow.mounted(el, binding);
      }

      // Verify symbol property exists
      const symbolsBefore = Object.getOwnPropertySymbols(el);
      expect(symbolsBefore.length).toBeGreaterThan(0);

      if (vShow.beforeUnmount) {
        vShow.beforeUnmount(el, binding);
      }

      // Verify cleanup - directive-specific symbols should be deleted
      // Note: Effect system may add its own symbols, but directive ones should be gone
      const symbolsAfter = Object.getOwnPropertySymbols(el);
      expect(symbolsAfter.length).toBeLessThan(symbolsBefore.length);
    });
  });

  describe('edge cases', () => {
    it('should handle display:none as original value', () => {
      el.style.display = 'none';
      const binding: DirectiveBinding<boolean> = { value: true };

      if (vShow.mounted) {
        vShow.mounted(el, binding);
      }

      // Original was 'none', so should default to empty string
      expect(el.style.display).toBe('');
    });

    it('should work without initial style', () => {
      const binding: DirectiveBinding<boolean> = { value: false };

      if (vShow.mounted) {
        vShow.mounted(el, binding);
      }

      expect(el.style.display).toBe('none');
    });
  });
});
