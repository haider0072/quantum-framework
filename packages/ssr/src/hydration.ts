/**
 * Client-side hydration for SSR
 */

import { render } from '@quantum/renderer';
import type { Component } from '@quantum/component';
import type { HydrationOptions, HydrationRoot, HydrationMismatch } from './types.js';
import { extractAndDeserializeState } from './serialization.js';

/**
 * Global hydration state
 */
let isHydrating = false;
let hydrationMismatches: HydrationMismatch[] = [];
let hydratedState: Map<string, any> | null = null;

/**
 * Check if currently hydrating
 */
export function isHydrationActive(): boolean {
  return isHydrating;
}

/**
 * Get hydration mismatches (for debugging)
 */
export function getHydrationMismatches(): HydrationMismatch[] {
  return [...hydrationMismatches];
}

/**
 * Clear hydration mismatches
 */
export function clearHydrationMismatches(): void {
  hydrationMismatches = [];
}

/**
 * Report a hydration mismatch
 * (Currently unused but kept for future enhancements)
 */
/*
function reportMismatch(mismatch: HydrationMismatch, options: HydrationOptions): void {
  hydrationMismatches.push(mismatch);

  if (!options.suppressHydrationWarning) {
    console.warn(
      `Hydration mismatch detected:\n` +
      `  Type: ${mismatch.type}\n` +
      `  Path: ${mismatch.path}\n` +
      `  Expected: ${mismatch.expected}\n` +
      `  Actual: ${mismatch.actual}`
    );

    if (mismatch.element) {
      console.warn('  Element:', mismatch.element);
    }
  }
}
*/

/**
 * Validate hydration by comparing server HTML markers with client
 */
function validateHydration(root: Element, options: HydrationOptions): void {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    null
  );

  const serverNodes: Element[] = [];
  let node = walker.nextNode();

  while (node) {
    const element = node as Element;
    if (element.hasAttribute('data-quantum-ssr')) {
      serverNodes.push(element);
    }
    node = walker.nextNode();
  }

  // Basic validation: check if SSR markers exist
  if (serverNodes.length === 0 && !options.suppressHydrationWarning) {
    console.warn(
      'No SSR markers found. ' +
      'Either the app was not server-rendered, or hydration markers were removed.'
    );
  }
}

/**
 * Restore signal values from hydrated state
 */
function restoreSignals(): void {
  if (!hydratedState || hydratedState.size === 0) {
    return;
  }

  // The actual restoration happens in the signal implementation
  // when it detects we're in hydration mode
  // This is a placeholder for now
}

/**
 * Remove SSR markers from DOM
 */
function cleanupSSRMarkers(root: Element): void {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    null
  );

  let node = walker.nextNode();
  while (node) {
    const element = node as Element;
    if (element.hasAttribute('data-quantum-ssr')) {
      element.removeAttribute('data-quantum-ssr');
    }
    node = walker.nextNode();
  }
}

/**
 * Hydrate a server-rendered application
 *
 * Instead of creating new DOM nodes, this attaches event listeners
 * and restores reactive state to existing server-rendered markup.
 *
 * @param component - The component to hydrate
 * @param root - The DOM element containing server-rendered HTML
 * @param options - Hydration options
 *
 * @example
 * ```tsx
 * import { hydrate } from '@quantum/ssr';
 * import App from './App';
 *
 * hydrate(<App />, document.getElementById('app'));
 * ```
 */
export function hydrate(
  component: Component,
  root: Element,
  options: HydrationOptions = {}
): void {
  try {
    // Extract hydrated state from HTML
    hydratedState = extractAndDeserializeState();

    // Enter hydration mode
    isHydrating = true;
    hydrationMismatches = [];

    // Validate that we have server-rendered content
    validateHydration(root, options);

    // Restore signal values
    restoreSignals();

    // Render the component (in hydration mode)
    // The renderer will skip creating DOM nodes and just attach listeners
    render(component, root);

    // Cleanup SSR markers
    cleanupSSRMarkers(root);

    // Call onHydrated callback
    if (options.onHydrated) {
      options.onHydrated();
    }
  } catch (error) {
    console.error('Hydration error:', error);
    if (options.onError) {
      options.onError(error as Error);
    } else {
      throw error;
    }
  } finally {
    // Exit hydration mode
    isHydrating = false;
    hydratedState = null;
  }
}

/**
 * Create a hydration root
 *
 * Provides more control over the hydration process
 *
 * @param root - The DOM element containing server-rendered HTML
 * @param options - Hydration options
 * @returns Hydration root interface
 *
 * @example
 * ```tsx
 * const root = createHydrationRoot(document.getElementById('app'));
 * root.hydrate(<App />);
 * ```
 */
export function createHydrationRoot(
  root: Element,
  options: HydrationOptions = {}
): HydrationRoot & { hydrate: (component: Component) => void } {
  let isCurrentlyHydrating = false;
  let unmountFn: (() => void) | null = null;

  return {
    element: root,

    hydrate(component: Component) {
      isCurrentlyHydrating = true;

      hydrate(component, root, options);

      isCurrentlyHydrating = false;

      // Store unmount function
      unmountFn = () => {
        root.innerHTML = '';
      };
    },

    unmount() {
      if (unmountFn) {
        unmountFn();
        unmountFn = null;
      }
    },

    isHydrating() {
      return isCurrentlyHydrating;
    },
  };
}

/**
 * Progressive hydration: hydrate components as they become visible
 *
 * @param component - The component to hydrate
 * @param root - The DOM element
 * @param options - Hydration options
 *
 * @example
 * ```tsx
 * progressiveHydrate(<App />, document.getElementById('app'));
 * ```
 */
export function progressiveHydrate(
  component: Component,
  root: Element,
  options: HydrationOptions = {}
): void {
  if (!('IntersectionObserver' in window)) {
    // Fallback to regular hydration
    return hydrate(component, root, options);
  }

  // Create intersection observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Element is visible, hydrate it
          const element = entry.target as Element;
          hydrate(component, element, options);
          observer.unobserve(element);
        }
      });
    },
    {
      rootMargin: '50px', // Start hydrating 50px before visible
    }
  );

  // Observe the root element
  observer.observe(root);
}

/**
 * Get the hydrated state for a signal ID
 *
 * Used internally by the reactivity system during hydration
 *
 * @param signalId - The signal ID
 * @returns The hydrated value or undefined
 */
export function getHydratedValue(signalId: string): any {
  return hydratedState?.get(signalId);
}

/**
 * Check if a signal has hydrated state
 *
 * @param signalId - The signal ID
 * @returns True if hydrated state exists
 */
export function hasHydratedValue(signalId: string): boolean {
  return hydratedState?.has(signalId) ?? false;
}
