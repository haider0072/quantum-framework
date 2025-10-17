/**
 * v-for directive - list rendering with keyed reconciliation
 */

import { effect } from '@quantum/reactivity';
import type { Directive, DirectiveBinding } from '../types.js';

const FOR_ANCHOR = Symbol('forAnchor');
const FOR_ITEMS = Symbol('forItems');
const FOR_KEY_MAP = Symbol('forKeyMap');

interface ForBinding {
  items: any[];
  key?: (item: any, index: number) => string | number;
}

/**
 * For directive implementation
 * Efficiently renders lists with keyed reconciliation
 */
export const vFor: Directive<ForBinding> = {
  beforeMount(el: any, _binding: DirectiveBinding<ForBinding>) {
    // Create anchor comment
    const anchor = document.createComment('v-for');
    el[FOR_ANCHOR] = anchor;
    el[FOR_ITEMS] = new Map<string | number, HTMLElement>();
    el[FOR_KEY_MAP] = new Map<any, string | number>();

    // Store template element
    const template = el.cloneNode(true);
    el._template = template;
  },

  mounted(el: any, binding: DirectiveBinding<ForBinding>) {
    const anchor = el[FOR_ANCHOR];
    const parent = el.parentNode;

    if (!parent) return;

    // Insert anchor and remove original element
    parent.insertBefore(anchor, el);
    parent.removeChild(el);

    const renderList = () => {
      const { items, key: keyFn } = binding.value;
      const itemsMap = el[FOR_ITEMS];
      const keyMap = el[FOR_KEY_MAP];
      const newKeys = new Set<string | number>();

      // Get actual array (call if it's a signal)
      const actualItems = typeof items === 'function' ? (items as any)() : items;

      // Process items
      actualItems.forEach((item, index) => {
        const key = keyFn ? keyFn(item, index) : index;
        newKeys.add(key);

        let itemEl = itemsMap.get(key);

        if (!itemEl) {
          // Create new element from template
          itemEl = el._template.cloneNode(true) as HTMLElement;
          itemsMap.set(key, itemEl);
          keyMap.set(item, key);

          // Insert after last item or anchor
          const lastEl: any = Array.from(itemsMap.values()).pop();
          if (lastEl && lastEl.parentNode) {
            (lastEl.parentNode as Node).insertBefore(itemEl, lastEl.nextSibling);
          } else {
            (anchor.parentNode as Node)?.insertBefore(itemEl, anchor.nextSibling);
          }

          // Update element with item data
          if (itemEl._updateItem) {
            itemEl._updateItem(item, index);
          }
        } else {
          // Update existing element
          if (itemEl._updateItem) {
            itemEl._updateItem(item, index);
          }
        }
      });

      // Remove items that are no longer in the list
      for (const [key, itemEl] of itemsMap.entries()) {
        if (!newKeys.has(key)) {
          itemEl.parentNode?.removeChild(itemEl);
          itemsMap.delete(key);
        }
      }
    };

    // Set up reactive effect if items is a function (signal)
    if (typeof binding.value.items === 'function') {
      effect(() => {
        renderList();
      });
    } else {
      // Static render
      renderList();
    }
  },

  updated(el: any, binding: DirectiveBinding<ForBinding>) {
    // Handle static updates
    if (typeof binding.value.items !== 'function') {
      const { items, key: keyFn } = binding.value;
      const itemsMap = el[FOR_ITEMS];
      const anchor = el[FOR_ANCHOR];
      const newKeys = new Set<string | number>();

      // Get actual array (call if it's a signal)
      const actualItems = typeof items === 'function' ? (items as any)() : items;

      actualItems.forEach((item, index) => {
        const key = keyFn ? keyFn(item, index) : index;
        newKeys.add(key);

        let itemEl = itemsMap.get(key);

        if (!itemEl) {
          itemEl = el._template.cloneNode(true) as HTMLElement;
          itemsMap.set(key, itemEl);

          const lastEl: any = Array.from(itemsMap.values()).pop();
          if (lastEl && lastEl.parentNode) {
            (lastEl.parentNode as Node).insertBefore(itemEl, lastEl.nextSibling);
          } else {
            (anchor.parentNode as Node)?.insertBefore(itemEl, anchor.nextSibling);
          }
        }

        if (itemEl._updateItem) {
          itemEl._updateItem(item, index);
        }
      });

      // Remove old items
      for (const [key, itemEl] of itemsMap.entries()) {
        if (!newKeys.has(key)) {
          itemEl.parentNode?.removeChild(itemEl);
          itemsMap.delete(key);
        }
      }
    }
  },

  beforeUnmount(el: any) {
    // Cleanup
    const anchor = el[FOR_ANCHOR];
    const itemsMap = el[FOR_ITEMS];

    // Remove all items
    for (const itemEl of itemsMap.values()) {
      itemEl.parentNode?.removeChild(itemEl);
    }

    // Remove anchor
    if (anchor && anchor.parentNode) {
      anchor.parentNode.removeChild(anchor);
    }

    delete el[FOR_ANCHOR];
    delete el[FOR_ITEMS];
    delete el[FOR_KEY_MAP];
    delete el._template;
  },
};

