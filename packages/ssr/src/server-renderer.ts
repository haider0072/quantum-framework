/**
 * Server-side rendering core functionality
 */

import type { Component, ComponentElement } from '@quantum/component';
import type { Signal } from '@quantum/reactivity';
import type { SSROptions, SSRResult } from './types.js';

/**
 * Global SSR context
 */
let isServerRendering = false;
let collectedSignals: Map<string, Signal<any>> = new Map();
let signalIdCounter = 0;

/**
 * Check if currently rendering on the server
 */
export function isSSR(): boolean {
  return isServerRendering;
}

/**
 * Collect a signal during SSR for state serialization
 */
function collectSignal(signal: Signal<any>): string {
  // Check if signal already collected
  for (const [id, sig] of collectedSignals.entries()) {
    if (sig === signal) {
      return id;
    }
  }

  // Generate new ID and collect signal
  const id = `s${signalIdCounter++}`;
  collectedSignals.set(id, signal);
  return id;
}

/**
 * Escape HTML special characters
 */
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Render a value to string
 */
function renderValue(value: any): string {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    return escapeHTML(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  // Handle signals and computed values (functional API)
  // Both signals and computed have a 'peek' method
  if (typeof value === 'function' && 'peek' in value) {
    const signal = value as Signal<any>;

    // Collect signal for state serialization if in SSR mode
    if (isServerRendering) {
      collectSignal(signal);
    }

    return renderValue(signal.peek());
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(renderValue).join('');
  }

  return '';
}

/**
 * Render attributes to string
 */
function renderAttributes(props: Record<string, any>): string {
  const attrs: string[] = [];

  for (const [key, value] of Object.entries(props)) {
    // Skip special props
    if (key === 'children' || key === 'key' || key === 'ref') {
      continue;
    }

    // Handle event handlers (skip on server)
    if (key.startsWith('on')) {
      continue;
    }

    // Handle style object
    if (key === 'style' && typeof value === 'object') {
      const styleStr = Object.entries(value)
        .map(([k, v]) => {
          const kebabKey = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
          return `${kebabKey}:${v}`;
        })
        .join(';');
      attrs.push(`style="${escapeHTML(styleStr)}"`);
      continue;
    }

    // Handle className
    if (key === 'className' || key === 'class') {
      if (value) {
        attrs.push(`class="${escapeHTML(String(value))}"`);
      }
      continue;
    }

    // Handle boolean attributes
    if (typeof value === 'boolean') {
      if (value) {
        attrs.push(key);
      }
      continue;
    }

    // Handle signals and computed values in attributes (functional API)
    let attrValue = value;
    if (typeof value === 'function' && 'peek' in value) {
      const signal = value as Signal<any>;

      // Collect signal for state serialization if in SSR mode
      if (isServerRendering) {
        collectSignal(signal);
      }

      attrValue = signal.peek();
    }

    if (attrValue != null) {
      attrs.push(`${key}="${escapeHTML(String(attrValue))}"`);
    }
  }

  return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
}

/**
 * Self-closing HTML tags
 */
const SELF_CLOSING_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

/**
 * Render a component element to HTML string
 */
function renderElement(element: any, options: SSROptions): string {
  // Handle null/undefined
  if (element == null) {
    return '';
  }

  // Handle primitives (string, number, boolean)
  if (typeof element !== 'object') {
    return renderValue(element);
  }

  // Handle arrays
  if (Array.isArray(element)) {
    return element.map(el => renderElement(el, options)).join('');
  }

  // Handle signals and computed values (functional API)
  if (typeof element === 'function' && 'peek' in element) {
    const signal = element as Signal<any>;

    // Collect signal for state serialization if in SSR mode
    if (isServerRendering) {
      collectSignal(signal);
    }

    return renderElement(signal.peek(), options);
  }

  // Handle component elements
  if (element.type) {
    const { type, props } = element as ComponentElement;

    // Handle text nodes
    if (type === 'TEXT') {
      return renderValue(props.nodeValue);
    }

    // Handle fragments
    if (typeof type === 'symbol') {
      // Fragment handling - just render children
      return renderElement(props.children, options);
    }

    // Handle function components
    if (typeof type === 'function') {
      const result = type(props);
      return renderElement(result, options);
    }

    // Handle DOM elements
    if (typeof type === 'string') {
      const tag = type;
      const attrs = renderAttributes(props);
      const children = props.children;

      // Self-closing tags
      if (SELF_CLOSING_TAGS.has(tag)) {
        return `<${tag}${attrs} />`;
      }

      // Regular tags with children
      const childHTML = children ? renderElement(children, options) : '';

      // Add hydration marker if needed
      const hydrationAttr = options.includeHydrationMarkers && !options.staticMarkup
        ? ' data-quantum-ssr'
        : '';

      return `<${tag}${attrs}${hydrationAttr}>${childHTML}</${tag}>`;
    }
  }

  return '';
}

/**
 * Render a component to an HTML string
 *
 * @param component - The component to render
 * @param options - SSR options
 * @returns The rendered HTML string
 *
 * @example
 * ```tsx
 * const html = renderToString(<App />);
 * ```
 */
export function renderToString(
  component: Component,
  options: SSROptions = {}
): string {
  // Set default options
  const opts: SSROptions = {
    includeHydrationMarkers: true,
    staticMarkup: false,
    ...options,
  };

  // Enter SSR mode
  isServerRendering = true;
  collectedSignals = new Map();
  signalIdCounter = 0;

  try {
    // Render the component
    const html = renderElement(component, opts);
    return html;
  } catch (error) {
    if (opts.onError) {
      opts.onError(error as Error);
    } else {
      console.error('SSR rendering error:', error);
    }
    throw error;
  } finally {
    // Exit SSR mode
    isServerRendering = false;
  }
}

/**
 * Render a component to static markup (no hydration markers)
 *
 * @param component - The component to render
 * @param options - SSR options
 * @returns The rendered HTML string
 *
 * @example
 * ```tsx
 * const html = renderToStaticMarkup(<App />);
 * ```
 */
export function renderToStaticMarkup(
  component: Component,
  options: SSROptions = {}
): string {
  return renderToString(component, {
    ...options,
    staticMarkup: true,
    includeHydrationMarkers: false,
  });
}

/**
 * Render a component to an HTML string with state serialization
 *
 * @param component - The component to render
 * @param options - SSR options
 * @returns SSR result with HTML and serialized state
 *
 * @example
 * ```tsx
 * const { html, state } = renderToStringWithState(<App />);
 * ```
 */
export function renderToStringWithState(
  component: Component,
  options: SSROptions = {}
): SSRResult {
  // Render to HTML
  const html = renderToString(component, options);

  // Serialize signals
  const stateMap: Record<string, any> = {};
  for (const [id, signal] of collectedSignals.entries()) {
    stateMap[id] = signal.peek();
  }

  const state = JSON.stringify(stateMap);

  return {
    html,
    state,
  };
}

/**
 * Render a component to a ReadableStream (for streaming SSR)
 *
 * @param component - The component to render
 * @param options - SSR options
 * @returns A ReadableStream of HTML chunks
 *
 * @example
 * ```tsx
 * const stream = renderToStream(<App />);
 * ```
 */
export function renderToStream(
  component: Component,
  options: SSROptions = {}
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      try {
        // For now, just render everything at once
        // In the future, we can implement true streaming with Suspense boundaries
        const html = renderToString(component, options);
        controller.enqueue(encoder.encode(html));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * Get all signals collected during SSR
 */
export function getCollectedSignals(): Map<string, Signal<any>> {
  return new Map(collectedSignals);
}

/**
 * Clear collected signals (for testing)
 */
export function clearCollectedSignals(): void {
  collectedSignals.clear();
  signalIdCounter = 0;
}
