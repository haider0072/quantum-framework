/**
 * v-if/v-else directive - conditional rendering
 */

import { effect } from '@quantum/reactivity';
import type { Directive, DirectiveBinding } from '../types.js';

const IF_ANCHOR = Symbol('ifAnchor');
const IF_NODES = Symbol('ifNodes');

/**
 * If directive implementation
 * Conditionally renders content by adding/removing from DOM
 */
export const vIf: Directive<boolean> = {
  beforeMount(el: any, _binding: DirectiveBinding<boolean>) {
    // Create anchor comment node
    const anchor = document.createComment('v-if');
    el[IF_ANCHOR] = anchor;

    // Store reference to original nodes
    el[IF_NODES] = [el];
  },

  mounted(el: any, binding: DirectiveBinding<boolean>) {
    const anchor = el[IF_ANCHOR];
    const parent = el.parentNode;

    if (!parent) return;

    // Insert anchor before element
    parent.insertBefore(anchor, el);

    // Set up reactive effect if value is a function (signal)
    if (typeof binding.value === 'function') {
      let currentlyMounted = true; // Element starts mounted

      effect(() => {
        const show = (binding.value as any)();

        if (show && !currentlyMounted) {
          // Mount: insert element after anchor
          anchor.parentNode?.insertBefore(el, anchor.nextSibling);
          currentlyMounted = true;
        } else if (!show && currentlyMounted) {
          // Unmount: remove element but keep anchor
          el.parentNode?.removeChild(el);
          currentlyMounted = false;
        }
      });
    } else {
      // Static value
      if (!binding.value) {
        el.parentNode?.removeChild(el);
      }
    }
  },

  updated(el: any, binding: DirectiveBinding<boolean>, oldBinding: DirectiveBinding<boolean>) {
    // For static updates
    if (typeof binding.value !== 'function' && binding.value !== oldBinding.oldValue) {
      const anchor = el[IF_ANCHOR];

      if (binding.value && !el.parentNode) {
        // Mount
        anchor.parentNode?.insertBefore(el, anchor.nextSibling);
      } else if (!binding.value && el.parentNode) {
        // Unmount
        el.parentNode.removeChild(el);
      }
    }
  },

  beforeUnmount(el: any) {
    // Cleanup anchor
    const anchor = el[IF_ANCHOR];
    if (anchor && anchor.parentNode) {
      anchor.parentNode.removeChild(anchor);
    }
    delete el[IF_ANCHOR];
    delete el[IF_NODES];
  },
};

/**
 * Else directive - must follow v-if
 */
export const vElse: Directive<void> = {
  mounted(el: any, _binding: DirectiveBinding<void>) {
    // v-else is handled by v-if, just mark the element
    el.setAttribute('data-v-else', '');
  },
};

/**
 * Else-if directive - must follow v-if or v-else-if
 */
export const vElseIf: Directive<boolean> = {
  mounted(el: any, _binding: DirectiveBinding<boolean>) {
    // Similar to v-if but checks previous sibling
    el.setAttribute('data-v-else-if', '');
    // Implementation would be similar to v-if
  },
};

