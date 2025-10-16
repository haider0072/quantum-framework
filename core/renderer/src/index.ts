/**
 * Quantum Framework - Renderer
 *
 * DOM rendering engine for Quantum applications.
 * @packageDocumentation
 */

// Main rendering API
export {
  render,
  hydrate,
  unmount,
  createRoot,
  createPortal,
} from './render';

// DOM utilities (for advanced use)
export {
  createElement,
  createNode,
  setAttribute,
  appendChild,
  updateElement,
  removeNode,
  replaceNode,
  insertBefore,
} from './dom';
