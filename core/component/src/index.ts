/**
 * Quantum Framework - Component System
 *
 * Component model, JSX runtime, and lifecycle management.
 * @packageDocumentation
 */

// JSX Runtime
export {
  jsx,
  jsxs,
  jsxDEV,
  Fragment,
  createElement,
  createFragment,
  cloneElement,
  isElement,
  isFragment,
} from './jsx-runtime';

// Component utilities
export {
  renderComponent,
  unmountComponent,
  reactiveComponent,
  memo,
  lazy,
  Suspense,
} from './component';

// Lifecycle hooks
export {
  onMount,
  onCleanup,
  onUpdate,
  onError,
  getCurrentContext,
  createContext as createComponentContext,
  runInContext,
  cleanupContext,
} from './lifecycle';

// Context API
export {
  createContext,
  createReactiveContext,
  useContext,
  useContextSelector,
  type Context,
} from './context';

// Types
export type {
  ComponentProps,
  ComponentType,
  FunctionComponent,
  QuantumElement,
  QuantumNode,
  Key,
  Ref,
} from './types';
