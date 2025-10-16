/**
 * Quantum Framework - Component Model
 *
 * Core component system for defining and rendering components.
 */

import { effect } from '@quantum/reactivity';
import type { ComponentType, QuantumElement, QuantumNode } from './types';
import {
  createContext,
  runInContext,
  cleanupContext,
  type ComponentContext,
} from './lifecycle';

/**
 * Renders a component with the given props.
 * Sets up the component context and manages lifecycle.
 *
 * @param element - The element to render
 * @returns Rendered result
 */
export function renderComponent(element: QuantumElement): QuantumNode {
  const { type, props } = element;

  // If type is a string, it's a DOM element
  if (typeof type === 'string') {
    return element;
  }

  // Otherwise it's a function component
  const component = type as ComponentType;
  const context = createContext();

  try {
    const result = runInContext(context, () => component(props));
    return result;
  } catch (error) {
    // Handle error with error boundary if available
    const errorHandler = (context as any).errorHandler;
    if (errorHandler) {
      errorHandler(error as Error);
      return null;
    }
    throw error;
  }
}

/**
 * Unmounts a component and runs cleanup.
 *
 * @param context - The component context to cleanup
 */
export function unmountComponent(context: ComponentContext): void {
  cleanupContext(context);
}

/**
 * Creates a reactive component that automatically updates when dependencies change.
 *
 * @param fn - Component function
 * @returns Wrapped component
 *
 * @example
 * const Counter = reactiveComponent((props) => {
 *   const count = signal(0);
 *   return <button onClick={() => count.update(n => n + 1)}>{count()}</button>;
 * });
 */
export function reactiveComponent<P = {}>(
  fn: ComponentType<P>
): ComponentType<P> {
  return (props: P) => {
    let result: QuantumNode = null;

    effect(() => {
      result = fn(props);
    });

    return result;
  };
}

/**
 * Creates a memo component that only re-renders when props change.
 *
 * @param component - Component to memoize
 * @param propsAreEqual - Custom equality function
 * @returns Memoized component
 *
 * @example
 * const ExpensiveComponent = memo((props) => {
 *   // Expensive rendering
 *   return <div>{props.value}</div>;
 * });
 */
export function memo<P = {}>(
  component: ComponentType<P>,
  propsAreEqual?: (prev: P, next: P) => boolean
): ComponentType<P> {
  let prevProps: P | null = null;
  let prevResult: QuantumNode = null;

  return (props: P) => {
    // Check if props changed
    if (prevProps !== null) {
      const areEqual = propsAreEqual
        ? propsAreEqual(prevProps, props)
        : shallowEqual(prevProps, props);

      if (areEqual) {
        return prevResult;
      }
    }

    // Render with new props
    prevProps = props;
    prevResult = component(props);
    return prevResult;
  };
}

/**
 * Shallow equality check for props.
 */
function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a === null || b === null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (a[key] !== b[key]) return false;
  }

  return true;
}

/**
 * Lazy loading component wrapper.
 *
 * @param loader - Function that returns a promise of the component
 * @returns Lazy component
 *
 * @example
 * const HeavyComponent = lazy(() => import('./HeavyComponent'));
 */
export function lazy<P = {}>(
  loader: () => Promise<{ default: ComponentType<P> }>
): ComponentType<P> {
  let component: ComponentType<P> | null = null;
  let promise: Promise<void> | null = null;
  let error: Error | null = null;

  const load = () => {
    if (!promise) {
      promise = loader()
        .then((module) => {
          component = module.default;
        })
        .catch((err) => {
          error = err;
        });
    }
    return promise;
  };

  return (props: P) => {
    if (error) {
      throw error;
    }

    if (component) {
      return component(props);
    }

    // Trigger suspense
    throw load();
  };
}

/**
 * Suspense boundary for lazy-loaded components.
 *
 * @example
 * <Suspense fallback={<Loading />}>
 *   <LazyComponent />
 * </Suspense>
 */
export function Suspense(props: {
  fallback: QuantumNode;
  children: QuantumNode;
}): QuantumNode {
  try {
    return props.children;
  } catch (promise) {
    if (promise instanceof Promise) {
      // Show fallback while loading
      promise.then(() => {
        // Re-render when loaded
      });
      return props.fallback;
    }
    throw promise;
  }
}
