/**
 * State serialization for SSR
 */

import type { Signal } from '@quantum/reactivity';

/**
 * Serialize a value to JSON-safe format
 */
function serializeValue(value: any, seen: WeakSet<any> = new WeakSet()): any {
  // Handle primitives
  if (value == null || typeof value !== 'object') {
    return value;
  }

  // Handle circular references
  if (seen.has(value)) {
    return { __type: 'circular', __ref: '[Circular]' };
  }
  seen.add(value);

  // Handle Date
  if (value instanceof Date) {
    return { __type: 'date', __value: value.toISOString() };
  }

  // Handle RegExp
  if (value instanceof RegExp) {
    return { __type: 'regexp', __value: value.source, __flags: value.flags };
  }

  // Handle Map
  if (value instanceof Map) {
    return {
      __type: 'map',
      __value: Array.from(value.entries()).map(([k, v]) => [
        serializeValue(k, seen),
        serializeValue(v, seen),
      ]),
    };
  }

  // Handle Set
  if (value instanceof Set) {
    return {
      __type: 'set',
      __value: Array.from(value).map(v => serializeValue(v, seen)),
    };
  }

  // Handle Arrays
  if (Array.isArray(value)) {
    return value.map(v => serializeValue(v, seen));
  }

  // Handle plain objects
  if (value.constructor === Object || value.constructor === undefined) {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = serializeValue(v, seen);
    }
    return result;
  }

  // Unknown type - return null
  return null;
}

/**
 * Deserialize a value from JSON
 */
function deserializeValue(value: any): any {
  if (value == null || typeof value !== 'object') {
    return value;
  }

  // Handle special types
  if (value.__type) {
    switch (value.__type) {
      case 'date':
        return new Date(value.__value);
      case 'regexp':
        return new RegExp(value.__value, value.__flags);
      case 'map':
        return new Map(
          value.__value.map(([k, v]: [any, any]) => [
            deserializeValue(k),
            deserializeValue(v),
          ])
        );
      case 'set':
        return new Set(value.__value.map(deserializeValue));
      case 'circular':
        return undefined; // Can't reconstruct circular refs
      default:
        return value;
    }
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(deserializeValue);
  }

  // Handle plain objects
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(value)) {
    result[k] = deserializeValue(v);
  }
  return result;
}

/**
 * Serialize signals to a JSON string
 *
 * @param signals - Map of signal IDs to signals
 * @param options - Serialization options
 * @returns JSON string of serialized state
 *
 * @example
 * ```ts
 * const state = serializeState(signals);
 * ```
 */
export function serializeState(
  signals: Map<string, Signal<any>>
): string {
  const stateMap: Record<string, any> = {};

  for (const [id, signal] of signals.entries()) {
    try {
      const value = signal.peek();
      stateMap[id] = serializeValue(value);
    } catch (error) {
      console.error(`Failed to serialize signal ${id}:`, error);
      stateMap[id] = null;
    }
  }

  return JSON.stringify(stateMap);
}

/**
 * Deserialize state from a JSON string
 *
 * @param serialized - JSON string of serialized state
 * @param options - Serialization options
 * @returns Map of signal IDs to values
 *
 * @example
 * ```ts
 * const state = deserializeState(stateString);
 * ```
 */
export function deserializeState(
  serialized: string
): Map<string, any> {
  try {
    const stateMap = JSON.parse(serialized);
    const result = new Map<string, any>();

    for (const [id, value] of Object.entries(stateMap)) {
      result.set(id, deserializeValue(value));
    }

    return result;
  } catch (error) {
    console.error('Failed to deserialize state:', error);
    return new Map();
  }
}

/**
 * Inject serialized state into HTML
 *
 * @param html - The HTML string
 * @param state - The serialized state
 * @returns HTML with injected state script
 *
 * @example
 * ```ts
 * const htmlWithState = injectState(html, state);
 * ```
 */
export function injectState(html: string, state: string): string {
  // Escape the state for safe injection
  const escapedState = state
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  const script = `<script id="__QUANTUM_STATE__" type="application/json">${escapedState}</script>`;

  // Try to inject before </body>, otherwise append
  if (html.includes('</body>')) {
    return html.replace('</body>', `${script}</body>`);
  } else if (html.includes('</html>')) {
    return html.replace('</html>', `${script}</html>`);
  } else {
    return html + script;
  }
}

/**
 * Extract serialized state from HTML
 *
 * @returns The serialized state or null if not found
 *
 * @example
 * ```ts
 * const state = extractState();
 * ```
 */
export function extractState(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const script = document.getElementById('__QUANTUM_STATE__');
  if (!script) {
    return null;
  }

  const content = script.textContent || script.innerHTML;
  return content;
}

/**
 * Extract and deserialize state from HTML
 *
 * @returns Map of signal IDs to values
 *
 * @example
 * ```ts
 * const state = extractAndDeserializeState();
 * ```
 */
export function extractAndDeserializeState(): Map<string, any> {
  const serialized = extractState();
  if (!serialized) {
    return new Map();
  }

  return deserializeState(serialized);
}

/**
 * Create a safe JSON string for inline script injection
 *
 * Prevents XSS attacks by escaping dangerous characters
 *
 * @param obj - Object to serialize
 * @returns Safe JSON string
 */
export function safeJSONStringify(obj: any): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
