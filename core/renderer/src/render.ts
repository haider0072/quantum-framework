/**
 * Quantum Framework - Main Render Function
 *
 * Public API for rendering Quantum applications to the DOM.
 */

import type { QuantumNode } from '@quantum/component';
import { createNode, removeNode } from './dom';
import { effect } from '@quantum/reactivity';

interface RenderRoot {
  container: Element;
  node: Node | null;
  dispose: () => void;
}

const roots = new WeakMap<Element, RenderRoot>();

/**
 * Renders a Quantum app into a DOM container.
 * This is the main entry point for Quantum applications.
 *
 * @param app - The root component or element to render
 * @param container - The DOM element to render into
 * @returns Cleanup function
 *
 * @example
 * const App = () => <h1>Hello Quantum!</h1>;
 * render(<App />, document.getElementById('root'));
 */
export function render(app: QuantumNode, container: Element): () => void {
  // Clear existing root
  const existingRoot = roots.get(container);
  if (existingRoot) {
    existingRoot.dispose();
  }

  // Create and mount node (fine-grained reactivity handled in createNode)
  const currentNode = createNode(app);
  if (currentNode) {
    container.appendChild(currentNode);
  }

  // Cleanup function
  const dispose = () => {
    if (currentNode) {
      removeNode(currentNode);
    }
    roots.delete(container);
  };

  // Store root
  const root: RenderRoot = {
    container,
    node: currentNode,
    dispose,
  };
  roots.set(container, root);

  return dispose;
}

/**
 * Hydrates server-rendered HTML with a Quantum app.
 * Attaches event listeners and makes the app interactive.
 *
 * @param app - The root component
 * @param container - The DOM element containing server-rendered HTML
 * @returns Cleanup function
 *
 * @example
 * hydrate(<App />, document.getElementById('root'));
 */
export function hydrate(app: QuantumNode, container: Element): () => void {
  // For now, hydrate is the same as render
  // In the future, this will reuse existing DOM nodes
  return render(app, container);
}

/**
 * Unmounts a Quantum app from a container.
 *
 * @param container - The container to unmount from
 *
 * @example
 * unmount(document.getElementById('root'));
 */
export function unmount(container: Element): void {
  const root = roots.get(container);
  if (root) {
    root.dispose();
    if (root.node) {
      removeNode(root.node);
    }
    roots.delete(container);
  }
}

/**
 * Creates a portal to render children into a different DOM node.
 *
 * @param children - The content to render
 * @param container - The target container
 * @returns Portal element
 *
 * @example
 * const Modal = (props) => (
 *   createPortal(
 *     <div class="modal">{props.children}</div>,
 *     document.body
 *   )
 * );
 */
export function createPortal(children: QuantumNode, container: Element): QuantumNode {
  effect(() => {
    const node = createNode(children);
    if (node) {
      container.appendChild(node);

      // Cleanup on unmount
      return () => {
        removeNode(node);
      };
    }
  });

  return null;
}

/**
 * Creates a render root without immediately rendering.
 * Useful for custom rendering scenarios.
 *
 * @param container - The container element
 * @returns Root controller object
 *
 * @example
 * const root = createRoot(document.getElementById('root'));
 * root.render(<App />);
 * root.unmount();
 */
export function createRoot(container: Element) {
  let currentDispose: (() => void) | null = null;

  return {
    render(app: QuantumNode) {
      if (currentDispose) {
        currentDispose();
      }
      currentDispose = render(app, container);
    },

    unmount() {
      if (currentDispose) {
        currentDispose();
        currentDispose = null;
      }
      unmount(container);
    },

    get container() {
      return container;
    },
  };
}
