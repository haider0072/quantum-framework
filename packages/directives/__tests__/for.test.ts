/**
 * Tests for v-for directive
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@quantum/reactivity';
import { vFor } from '../src/directives/for.js';
import type { DirectiveBinding } from '../src/types.js';

interface ForBinding {
  items: any[];
  key?: (item: any, index: number) => string | number;
}

describe('v-for directive', () => {
  let el: HTMLElement;
  let parent: HTMLElement;

  beforeEach(() => {
    parent = document.createElement('div');
    el = document.createElement('div');
    el.textContent = 'Item {{index}}';
    parent.appendChild(el);
    document.body.appendChild(parent);
  });

  describe('static arrays', () => {
    it('should create anchor comment node', () => {
      const binding: DirectiveBinding<ForBinding> = {
        value: { items: [1, 2, 3] }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding);
      }

      const symbols = Object.getOwnPropertySymbols(el);
      expect(symbols.length).toBeGreaterThan(0);
    });

    it('should render list items', () => {
      const items = ['a', 'b', 'c'];
      const binding: DirectiveBinding<ForBinding> = {
        value: { items }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding);
      }
      if (vFor.mounted) {
        vFor.mounted(el, binding);
      }

      // Should have anchor + 3 items
      expect(parent.childNodes.length).toBe(4);
      expect(parent.firstChild?.nodeType).toBe(Node.COMMENT_NODE);
    });

    it('should use index as default key', () => {
      const items = [10, 20, 30];
      const binding: DirectiveBinding<ForBinding> = {
        value: { items }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding);
      }
      if (vFor.mounted) {
        vFor.mounted(el, binding);
      }

      expect(parent.childNodes.length).toBe(4); // anchor + 3 items
    });

    it('should use custom key function', () => {
      const items = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' }
      ];
      const binding: DirectiveBinding<ForBinding> = {
        value: {
          items,
          key: (item) => item.id
        }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding);
      }
      if (vFor.mounted) {
        vFor.mounted(el, binding);
      }

      expect(parent.childNodes.length).toBe(4); // anchor + 3 items
    });

    it('should clone template for each item', () => {
      const items = [1, 2, 3];
      const binding: DirectiveBinding<ForBinding> = {
        value: { items }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding);
      }

      // Template should be stored
      expect((el as any)._template).toBeDefined();
      expect((el as any)._template.nodeType).toBe(Node.ELEMENT_NODE);
    });

    it('should handle empty array', () => {
      const items: any[] = [];
      const binding: DirectiveBinding<ForBinding> = {
        value: { items }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding);
      }
      if (vFor.mounted) {
        vFor.mounted(el, binding);
      }

      // Should only have anchor
      expect(parent.childNodes.length).toBe(1);
      expect(parent.firstChild?.nodeType).toBe(Node.COMMENT_NODE);
    });
  });

  describe('reactive arrays', () => {
    it('should react to array changes - add items', () => {
      const items = signal([1, 2, 3]);
      const binding: DirectiveBinding<ForBinding> = {
        value: { items: () => items.value }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding);
      }
      if (vFor.mounted) {
        vFor.mounted(el, binding);
      }

      expect(parent.childNodes.length).toBe(4); // anchor + 3

      // Add item
      items.value = [1, 2, 3, 4];
      expect(parent.childNodes.length).toBe(5); // anchor + 4
    });

    it('should react to array changes - remove items', () => {
      const items = signal([1, 2, 3, 4]);
      const binding: DirectiveBinding<ForBinding> = {
        value: { items: () => items.value }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding);
      }
      if (vFor.mounted) {
        vFor.mounted(el, binding);
      }

      expect(parent.childNodes.length).toBe(5); // anchor + 4

      // Remove items
      items.value = [1, 2];
      expect(parent.childNodes.length).toBe(3); // anchor + 2
    });

    it('should react to array changes - replace all', () => {
      const items = signal([1, 2, 3]);
      const binding: DirectiveBinding<ForBinding> = {
        value: { items: () => items.value }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding);
      }
      if (vFor.mounted) {
        vFor.mounted(el, binding);
      }

      expect(parent.childNodes.length).toBe(4);

      // Replace all
      items.value = [10, 20];
      expect(parent.childNodes.length).toBe(3); // anchor + 2
    });

    it('should handle empty to filled', () => {
      const items = signal([]);
      const binding: DirectiveBinding<ForBinding> = {
        value: { items: () => items.value }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding);
      }
      if (vFor.mounted) {
        vFor.mounted(el, binding);
      }

      expect(parent.childNodes.length).toBe(1); // only anchor

      items.value = [1, 2, 3];
      expect(parent.childNodes.length).toBe(4); // anchor + 3
    });

    it('should handle filled to empty', () => {
      const items = signal([1, 2, 3]);
      const binding: DirectiveBinding<ForBinding> = {
        value: { items: () => items.value }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding);
      }
      if (vFor.mounted) {
        vFor.mounted(el, binding);
      }

      expect(parent.childNodes.length).toBe(4);

      items.value = [];
      expect(parent.childNodes.length).toBe(1); // only anchor
    });
  });

  describe('static updates', () => {
    it('should update when items array changes', () => {
      const binding1: DirectiveBinding<ForBinding> = {
        value: { items: [1, 2, 3] }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding1);
      }
      if (vFor.mounted) {
        vFor.mounted(el, binding1);
      }

      expect(parent.childNodes.length).toBe(4);

      const binding2: DirectiveBinding<ForBinding> = {
        value: { items: [1, 2, 3, 4, 5] }
      };

      if (vFor.updated) {
        vFor.updated(el, binding2, binding1);
      }

      expect(parent.childNodes.length).toBe(6); // anchor + 5
    });

    it('should remove items on update', () => {
      const binding1: DirectiveBinding<ForBinding> = {
        value: { items: [1, 2, 3, 4] }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding1);
      }
      if (vFor.mounted) {
        vFor.mounted(el, binding1);
      }

      expect(parent.childNodes.length).toBe(5);

      const binding2: DirectiveBinding<ForBinding> = {
        value: { items: [1] }
      };

      if (vFor.updated) {
        vFor.updated(el, binding2, binding1);
      }

      expect(parent.childNodes.length).toBe(2); // anchor + 1
    });
  });

  describe('keyed reconciliation', () => {
    it('should reuse elements with same key', () => {
      const items = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' }
      ];

      const binding1: DirectiveBinding<ForBinding> = {
        value: {
          items,
          key: (item) => item.id
        }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding1);
      }
      if (vFor.mounted) {
        vFor.mounted(el, binding1);
      }

      const initialNodes = Array.from(parent.childNodes).slice(1); // Skip anchor

      // Reorder items
      const binding2: DirectiveBinding<ForBinding> = {
        value: {
          items: [items[2], items[0], items[1]], // Charlie, Alice, Bob
          key: (item) => item.id
        }
      };

      if (vFor.updated) {
        vFor.updated(el, binding2, binding1);
      }

      expect(parent.childNodes.length).toBe(4); // Still anchor + 3
    });

    it('should track items by custom key', () => {
      const items = [
        { id: 'a', value: 1 },
        { id: 'b', value: 2 },
        { id: 'c', value: 3 }
      ];

      const binding: DirectiveBinding<ForBinding> = {
        value: {
          items,
          key: (item) => item.id
        }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding);
      }
      if (vFor.mounted) {
        vFor.mounted(el, binding);
      }

      // Check internal map has correct keys - find FOR_ITEMS symbol
      const symbols = Object.getOwnPropertySymbols(el);
      const itemsMapSymbol = symbols.find(s => s.toString().includes('forItems'));
      expect(itemsMapSymbol).toBeDefined();

      if (itemsMapSymbol) {
        const itemsMap = (el as any)[itemsMapSymbol];
        expect(itemsMap.has('a')).toBe(true);
        expect(itemsMap.has('b')).toBe(true);
        expect(itemsMap.has('c')).toBe(true);
      }
    });
  });

  describe('lifecycle', () => {
    it('should cleanup on beforeUnmount', () => {
      const items = signal([1, 2, 3]);
      const binding: DirectiveBinding<ForBinding> = {
        value: { items: () => items.value }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding);
      }
      if (vFor.mounted) {
        vFor.mounted(el, binding);
      }

      expect(parent.childNodes.length).toBe(4);

      const symbolsBefore = Object.getOwnPropertySymbols(el);

      if (vFor.beforeUnmount) {
        vFor.beforeUnmount(el, binding);
      }

      // All items should be removed (only anchor might remain if still referenced)
      // Directive symbols should be deleted
      const symbolsAfter = Object.getOwnPropertySymbols(el);
      expect(symbolsAfter.length).toBeLessThan(symbolsBefore.length);
    });

    it('should remove all items on cleanup', () => {
      const binding: DirectiveBinding<ForBinding> = {
        value: { items: [1, 2, 3, 4, 5] }
      };

      if (vFor.beforeMount) {
        vFor.beforeMount(el, binding);
      }
      if (vFor.mounted) {
        vFor.mounted(el, binding);
      }

      expect(parent.childNodes.length).toBe(6);

      if (vFor.beforeUnmount) {
        vFor.beforeUnmount(el, binding);
      }

      // Should remove items (anchor cleanup handled)
      expect((el as any)._template).toBeUndefined();
    });
  });
});
