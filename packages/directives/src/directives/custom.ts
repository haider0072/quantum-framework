/**
 * Custom directive registration and management
 */

import type { Directive, DirectiveBinding, DirectiveHooks } from '../types.js';

/**
 * Global directive registry
 */
const directiveRegistry = new Map<string, Directive>();

/**
 * Register a global directive
 */
export function registerDirective(name: string, directive: Directive): void {
  directiveRegistry.set(name, directive);
}

/**
 * Get a registered directive
 */
export function getDirective(name: string): Directive | undefined {
  return directiveRegistry.get(name);
}

/**
 * Unregister a directive
 */
export function unregisterDirective(name: string): boolean {
  return directiveRegistry.delete(name);
}

/**
 * Check if a directive is registered
 */
export function hasDirective(name: string): boolean {
  return directiveRegistry.has(name);
}

/**
 * Get all registered directive names
 */
export function getDirectiveNames(): string[] {
  return Array.from(directiveRegistry.keys());
}

/**
 * Apply directive to an element
 */
export function applyDirective(
  el: HTMLElement,
  name: string,
  binding: DirectiveBinding
): void {
  const directive = getDirective(name);

  if (!directive) {
    console.warn(`Directive "${name}" is not registered`);
    return;
  }

  // If directive is a function, treat it as mounted hook
  if (typeof directive === 'function') {
    directive(el, binding);
    return;
  }

  // Call beforeMount hook
  if (directive.beforeMount) {
    directive.beforeMount(el, binding);
  }

  // Call mounted hook after element is in DOM
  if (directive.mounted) {
    // Use requestAnimationFrame to ensure element is in DOM
    requestAnimationFrame(() => {
      directive.mounted!(el, binding);
    });
  }
}

/**
 * Update directive binding
 */
export function updateDirective(
  el: HTMLElement,
  name: string,
  binding: DirectiveBinding,
  oldBinding: DirectiveBinding
): void {
  const directive = getDirective(name);

  if (!directive || typeof directive === 'function') {
    return;
  }

  // Call beforeUpdate hook
  if (directive.beforeUpdate) {
    directive.beforeUpdate(el, binding, oldBinding);
  }

  // Call updated hook
  if (directive.updated) {
    requestAnimationFrame(() => {
      directive.updated!(el, binding, oldBinding);
    });
  }
}

/**
 * Remove directive from element
 */
export function removeDirective(
  el: HTMLElement,
  name: string,
  binding: DirectiveBinding
): void {
  const directive = getDirective(name);

  if (!directive || typeof directive === 'function') {
    return;
  }

  // Call beforeUnmount hook
  if (directive.beforeUnmount) {
    directive.beforeUnmount(el, binding);
  }

  // Call unmounted hook
  if (directive.unmounted) {
    directive.unmounted(el, binding);
  }
}

/**
 * Helper to create a directive
 */
export function defineDirective<T = any>(hooks: DirectiveHooks<T>): Directive<T> {
  return hooks;
}

/**
 * Helper to create a simple directive function
 */
export function createDirective<T = any>(
  fn: (el: HTMLElement, binding: DirectiveBinding<T>) => void
): Directive<T> {
  return fn;
}
