/**
 * Quantum Framework - DOM Renderer
 *
 * High-performance DOM rendering with minimal overhead.
 * Direct DOM manipulation without virtual DOM diffing.
 */

import type { QuantumElement, QuantumNode } from '@quantum/component';
import { isElement, isFragment, renderComponent } from '@quantum/component';
import { effect } from '@quantum/reactivity';

/**
 * Creates a DOM element from a Quantum element.
 */
export function createElement(element: QuantumElement): Node {
  const { type, props } = element;

  // Handle fragments
  if (isFragment(type)) {
    const fragment = document.createDocumentFragment();
    const children = Array.isArray(props.children)
      ? props.children
      : [props.children];

    children.forEach((child) => {
      const childNode = createNode(child);
      if (childNode) {
        fragment.appendChild(childNode);
      }
    });

    return fragment;
  }

  // Handle function components
  if (typeof type === 'function') {
    const rendered = renderComponent(element);
    return createNode(rendered);
  }

  // Create DOM element
  const el = document.createElement(type as string);

  // Set attributes and props
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'children') return;
    if (key === 'key') return;
    if (key === 'ref') {
      if (value && typeof value === 'object') {
        value.current = el;
      }
      return;
    }

    setAttribute(el, key, value);
  });

  // Append children
  const children = props.children;
  if (children != null) {
    appendChild(el, children);
  }

  return el;
}

/**
 * Creates a DOM node from any Quantum node type.
 */
export function createNode(node: QuantumNode): Node | null {
  // Handle null/undefined/boolean
  if (node == null || typeof node === 'boolean') {
    return null;
  }

  // Handle text nodes
  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(String(node));
  }

  // Handle signals (functions with peek method = reactive values)
  if (typeof node === 'function') {
    // Check if it's a signal/computed
    if ('peek' in node) {
      // Create a text node that reactively updates
      const textNode = document.createTextNode('');
      effect(() => {
        textNode.textContent = String((node as any)());
      });
      return textNode;
    }
  }

  // Handle arrays
  if (Array.isArray(node)) {
    const fragment = document.createDocumentFragment();
    node.forEach((child) => {
      const childNode = createNode(child);
      if (childNode) {
        fragment.appendChild(childNode);
      }
    });
    return fragment;
  }

  // Handle elements
  if (isElement(node)) {
    return createElement(node);
  }

  // Fallback
  return document.createTextNode(String(node));
}

/**
 * Sets an attribute or property on a DOM element.
 */
export function setAttribute(el: Element, key: string, value: any): void {
  // Handle events
  if (key.startsWith('on')) {
    const eventName = key.slice(2).toLowerCase();
    (el as any)[key] = value;
    el.addEventListener(eventName, value);
    return;
  }

  // Handle style
  if (key === 'style') {
    if (typeof value === 'string') {
      (el as HTMLElement).style.cssText = value;
    } else if (typeof value === 'object') {
      Object.assign((el as HTMLElement).style, value);
    }
    return;
  }

  // Handle className/class
  if (key === 'className' || key === 'class') {
    el.setAttribute('class', String(value));
    return;
  }

  // Handle dangerous HTML
  if (key === 'dangerouslySetInnerHTML') {
    if (value && value.__html) {
      (el as HTMLElement).innerHTML = value.__html;
    }
    return;
  }

  // Handle boolean attributes
  if (typeof value === 'boolean') {
    if (value) {
      el.setAttribute(key, '');
    } else {
      el.removeAttribute(key);
    }
    return;
  }

  // Handle regular attributes
  if (value != null) {
    el.setAttribute(key, String(value));
  } else {
    el.removeAttribute(key);
  }
}

/**
 * Appends children to a parent element.
 */
export function appendChild(parent: Node, children: QuantumNode): void {
  if (children == null) return;

  if (Array.isArray(children)) {
    children.forEach((child) => appendChild(parent, child));
    return;
  }

  const node = createNode(children);
  if (node) {
    parent.appendChild(node);
  }
}

/**
 * Updates a DOM element with new props.
 */
export function updateElement(el: Element, newProps: any, oldProps: any): void {
  // Remove old props
  Object.keys(oldProps).forEach((key) => {
    if (key === 'children' || key === 'key') return;
    if (!(key in newProps)) {
      if (key.startsWith('on')) {
        const eventName = key.slice(2).toLowerCase();
        el.removeEventListener(eventName, oldProps[key]);
      } else {
        el.removeAttribute(key);
      }
    }
  });

  // Set new props
  Object.entries(newProps).forEach(([key, value]) => {
    if (key === 'children' || key === 'key') return;
    if (oldProps[key] !== value) {
      setAttribute(el, key, value);
    }
  });
}

/**
 * Removes a node from the DOM.
 */
export function removeNode(node: Node): void {
  node.parentNode?.removeChild(node);
}

/**
 * Replaces an old node with a new node.
 */
export function replaceNode(oldNode: Node, newNode: Node): void {
  oldNode.parentNode?.replaceChild(newNode, oldNode);
}

/**
 * Inserts a node before a reference node.
 */
export function insertBefore(parent: Node, newNode: Node, refNode: Node | null): void {
  if (refNode) {
    parent.insertBefore(newNode, refNode);
  } else {
    parent.appendChild(newNode);
  }
}
