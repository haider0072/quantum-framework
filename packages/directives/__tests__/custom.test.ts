/**
 * Tests for custom directive API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  registerDirective,
  getDirective,
  unregisterDirective,
  hasDirective,
  getDirectiveNames,
  applyDirective,
  updateDirective,
  removeDirective,
  defineDirective,
  createDirective,
} from '../src/directives/custom.js';
import type { Directive, DirectiveBinding } from '../src/types.js';

describe('Custom Directive API', () => {
  beforeEach(() => {
    // Clear all directives before each test
    const names = getDirectiveNames();
    names.forEach(name => unregisterDirective(name));
  });

  describe('registration', () => {
    it('should register a directive', () => {
      const directive: Directive = {
        mounted: vi.fn(),
      };

      registerDirective('test', directive);
      expect(hasDirective('test')).toBe(true);
    });

    it('should retrieve a registered directive', () => {
      const directive: Directive = {
        mounted: vi.fn(),
      };

      registerDirective('test', directive);
      const retrieved = getDirective('test');
      expect(retrieved).toBe(directive);
    });

    it('should return undefined for unregistered directive', () => {
      expect(getDirective('nonexistent')).toBeUndefined();
    });

    it('should unregister a directive', () => {
      const directive: Directive = {
        mounted: vi.fn(),
      };

      registerDirective('test', directive);
      expect(hasDirective('test')).toBe(true);

      const result = unregisterDirective('test');
      expect(result).toBe(true);
      expect(hasDirective('test')).toBe(false);
    });

    it('should return false when unregistering nonexistent directive', () => {
      const result = unregisterDirective('nonexistent');
      expect(result).toBe(false);
    });

    it('should check if directive exists', () => {
      expect(hasDirective('test')).toBe(false);

      registerDirective('test', { mounted: vi.fn() });
      expect(hasDirective('test')).toBe(true);
    });

    it('should get all directive names', () => {
      registerDirective('test1', { mounted: vi.fn() });
      registerDirective('test2', { mounted: vi.fn() });
      registerDirective('test3', { mounted: vi.fn() });

      const names = getDirectiveNames();
      expect(names).toHaveLength(3);
      expect(names).toContain('test1');
      expect(names).toContain('test2');
      expect(names).toContain('test3');
    });

    it('should allow overwriting a directive', () => {
      const directive1: Directive = { mounted: vi.fn() };
      const directive2: Directive = { mounted: vi.fn() };

      registerDirective('test', directive1);
      expect(getDirective('test')).toBe(directive1);

      registerDirective('test', directive2);
      expect(getDirective('test')).toBe(directive2);
    });
  });

  describe('applyDirective', () => {
    it('should call beforeMount and mounted hooks', async () => {
      const beforeMount = vi.fn();
      const mounted = vi.fn();

      const directive: Directive = {
        beforeMount,
        mounted,
      };

      registerDirective('test', directive);

      const el = document.createElement('div');
      const binding: DirectiveBinding = { value: 'test' };

      applyDirective(el, 'test', binding);

      expect(beforeMount).toHaveBeenCalledWith(el, binding);

      // Wait for requestAnimationFrame
      await new Promise(resolve => requestAnimationFrame(resolve));
      expect(mounted).toHaveBeenCalledWith(el, binding);
    });

    it('should handle function directives', () => {
      const directiveFn = vi.fn();

      registerDirective('test', directiveFn);

      const el = document.createElement('div');
      const binding: DirectiveBinding = { value: 'test' };

      applyDirective(el, 'test', binding);

      expect(directiveFn).toHaveBeenCalledWith(el, binding);
    });

    it('should warn when directive is not registered', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const el = document.createElement('div');
      const binding: DirectiveBinding = { value: 'test' };

      applyDirective(el, 'nonexistent', binding);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Directive "nonexistent" is not registered');

      consoleWarnSpy.mockRestore();
    });

    it('should handle directive with only mounted hook', async () => {
      const mounted = vi.fn();

      registerDirective('test', { mounted });

      const el = document.createElement('div');
      const binding: DirectiveBinding = { value: 'test' };

      applyDirective(el, 'test', binding);

      await new Promise(resolve => requestAnimationFrame(resolve));
      expect(mounted).toHaveBeenCalledWith(el, binding);
    });
  });

  describe('updateDirective', () => {
    it('should call beforeUpdate and updated hooks', async () => {
      const beforeUpdate = vi.fn();
      const updated = vi.fn();

      const directive: Directive = {
        beforeUpdate,
        updated,
      };

      registerDirective('test', directive);

      const el = document.createElement('div');
      const binding: DirectiveBinding = { value: 'new' };
      const oldBinding: DirectiveBinding = { value: 'old' };

      updateDirective(el, 'test', binding, oldBinding);

      expect(beforeUpdate).toHaveBeenCalledWith(el, binding, oldBinding);

      await new Promise(resolve => requestAnimationFrame(resolve));
      expect(updated).toHaveBeenCalledWith(el, binding, oldBinding);
    });

    it('should handle function directives', () => {
      const directiveFn = vi.fn();

      registerDirective('test', directiveFn);

      const el = document.createElement('div');
      const binding: DirectiveBinding = { value: 'new' };
      const oldBinding: DirectiveBinding = { value: 'old' };

      updateDirective(el, 'test', binding, oldBinding);

      // Function directives don't have update hooks
      expect(directiveFn).not.toHaveBeenCalled();
    });

    it('should do nothing for unregistered directive', () => {
      const el = document.createElement('div');
      const binding: DirectiveBinding = { value: 'new' };
      const oldBinding: DirectiveBinding = { value: 'old' };

      // Should not throw
      updateDirective(el, 'nonexistent', binding, oldBinding);
    });
  });

  describe('removeDirective', () => {
    it('should call beforeUnmount and unmounted hooks', () => {
      const beforeUnmount = vi.fn();
      const unmounted = vi.fn();

      const directive: Directive = {
        beforeUnmount,
        unmounted,
      };

      registerDirective('test', directive);

      const el = document.createElement('div');
      const binding: DirectiveBinding = { value: 'test' };

      removeDirective(el, 'test', binding);

      expect(beforeUnmount).toHaveBeenCalledWith(el, binding);
      expect(unmounted).toHaveBeenCalledWith(el, binding);
    });

    it('should handle function directives', () => {
      const directiveFn = vi.fn();

      registerDirective('test', directiveFn);

      const el = document.createElement('div');
      const binding: DirectiveBinding = { value: 'test' };

      removeDirective(el, 'test', binding);

      // Function directives don't have unmount hooks
      expect(directiveFn).not.toHaveBeenCalled();
    });

    it('should do nothing for unregistered directive', () => {
      const el = document.createElement('div');
      const binding: DirectiveBinding = { value: 'test' };

      // Should not throw
      removeDirective(el, 'nonexistent', binding);
    });
  });

  describe('helpers', () => {
    it('should create directive with defineDirective', () => {
      const mounted = vi.fn();
      const directive = defineDirective({
        mounted,
      });

      expect(directive.mounted).toBe(mounted);
    });

    it('should create function directive with createDirective', () => {
      const fn = vi.fn();
      const directive = createDirective(fn);

      expect(directive).toBe(fn);
    });

    it('should work with defineDirective in full lifecycle', async () => {
      const hooks = {
        beforeMount: vi.fn(),
        mounted: vi.fn(),
        beforeUpdate: vi.fn(),
        updated: vi.fn(),
        beforeUnmount: vi.fn(),
        unmounted: vi.fn(),
      };

      const directive = defineDirective(hooks);
      registerDirective('lifecycle', directive);

      const el = document.createElement('div');
      const binding: DirectiveBinding = { value: 'test' };
      const newBinding: DirectiveBinding = { value: 'updated' };

      // Apply
      applyDirective(el, 'lifecycle', binding);
      expect(hooks.beforeMount).toHaveBeenCalledWith(el, binding);
      await new Promise(resolve => requestAnimationFrame(resolve));
      expect(hooks.mounted).toHaveBeenCalledWith(el, binding);

      // Update
      updateDirective(el, 'lifecycle', newBinding, binding);
      expect(hooks.beforeUpdate).toHaveBeenCalledWith(el, newBinding, binding);
      await new Promise(resolve => requestAnimationFrame(resolve));
      expect(hooks.updated).toHaveBeenCalledWith(el, newBinding, binding);

      // Remove
      removeDirective(el, 'lifecycle', newBinding);
      expect(hooks.beforeUnmount).toHaveBeenCalledWith(el, newBinding);
      expect(hooks.unmounted).toHaveBeenCalledWith(el, newBinding);
    });
  });

  describe('integration', () => {
    it('should support practical custom directive', async () => {
      // Create a focus directive
      const focus = defineDirective<boolean>({
        mounted(el, binding) {
          if (binding.value) {
            (el as HTMLElement).focus();
          }
        },
        updated(el, binding) {
          if (binding.value) {
            (el as HTMLElement).focus();
          }
        },
      });

      registerDirective('focus', focus);

      const input = document.createElement('input');
      document.body.appendChild(input);

      const binding: DirectiveBinding<boolean> = { value: true };
      applyDirective(input, 'focus', binding);

      await new Promise(resolve => requestAnimationFrame(resolve));

      expect(document.activeElement).toBe(input);

      document.body.removeChild(input);
    });

    it('should support tooltip directive example', async () => {
      const tooltip = defineDirective<string>({
        mounted(el, binding) {
          el.setAttribute('title', binding.value);
        },
        updated(el, binding) {
          el.setAttribute('title', binding.value);
        },
      });

      registerDirective('tooltip', tooltip);

      const div = document.createElement('div');
      const binding: DirectiveBinding<string> = { value: 'Tooltip text' };

      applyDirective(div, 'tooltip', binding);

      // Wait for mounted hook to run
      await new Promise(resolve => requestAnimationFrame(resolve));

      expect(div.getAttribute('title')).toBe('Tooltip text');
    });
  });
});
