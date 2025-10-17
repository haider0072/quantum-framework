/**
 * v-show directive - toggles element display
 */

import { effect } from '@quantum/reactivity';
import type { Directive, DirectiveBinding } from '../types.js';

const ORIGINAL_DISPLAY = Symbol('originalDisplay');
const CLEANUP_FN = Symbol('cleanupFn');

/**
 * Show directive implementation
 * Toggles element display property without removing from DOM
 */
export const vShow: Directive<boolean> = {
  mounted(el: any, binding: DirectiveBinding<boolean>) {
    // Store original display value
    el[ORIGINAL_DISPLAY] = el.style.display === 'none' ? '' : el.style.display;

    // Set up reactive effect if value is a function (signal)
    if (typeof binding.value === 'function') {
      let cleanup: any;
      cleanup = effect(() => {
        const show = (binding.value as any)();
        el.style.display = show ? el[ORIGINAL_DISPLAY] : 'none';
      });
      el[CLEANUP_FN] = cleanup;
    } else {
      // Static value
      el.style.display = binding.value ? el[ORIGINAL_DISPLAY] : 'none';
    }
  },

  updated(el: any, binding: DirectiveBinding<boolean>) {
    // For static updates
    if (typeof binding.value !== 'function') {
      el.style.display = binding.value ? el[ORIGINAL_DISPLAY] : 'none';
    }
  },

  beforeUnmount(el: any) {
    // Cleanup effect
    if (el[CLEANUP_FN]) {
      delete el[CLEANUP_FN];
    }
    // Cleanup
    delete el[ORIGINAL_DISPLAY];
  },
};

/**
 * Helper to create v-show with initial value
 */
export function show(value: boolean | (() => boolean)) {
  return {
    directive: 'show',
    value,
  };
}
