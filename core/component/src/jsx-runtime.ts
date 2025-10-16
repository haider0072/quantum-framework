/**
 * Quantum Framework - JSX Runtime
 *
 * Runtime for JSX/TSX transformation.
 * Implements the modern JSX transform (jsx-runtime).
 */

import type {
  QuantumElement,
  ComponentType,
  ComponentProps,
  Key,
  QuantumNode,
} from './types';

const Fragment = Symbol('Fragment');

/**
 * Creates a Quantum element from JSX.
 * Used by the JSX transform for elements with static key.
 */
export function jsx(
  type: string | ComponentType,
  props: ComponentProps,
  key?: Key
): QuantumElement {
  return {
    type,
    props: props ?? {},
    key: key ?? null,
  };
}

/**
 * Creates a Quantum element from JSX.
 * Used for elements with dynamic keys or when children are passed separately.
 */
export function jsxs(
  type: string | ComponentType,
  props: ComponentProps,
  key?: Key
): QuantumElement {
  return jsx(type, props, key);
}

/**
 * Creates a Quantum element for development mode.
 * Includes additional debugging information.
 */
export function jsxDEV(
  type: string | ComponentType,
  props: ComponentProps,
  key?: Key,
  _isStaticChildren?: boolean,
  _source?: any,
  _self?: any
): QuantumElement {
  return jsx(type, props, key);
}

/**
 * Fragment component for grouping children without a wrapper element.
 */
export { Fragment };

/**
 * Creates a fragment element.
 */
export function createFragment(children: QuantumNode[]): QuantumElement {
  return {
    type: Fragment as any,
    props: { children },
    key: null,
  };
}

/**
 * Checks if a value is a valid Quantum element.
 */
export function isElement(value: any): value is QuantumElement {
  return (
    value != null &&
    typeof value === 'object' &&
    'type' in value &&
    'props' in value
  );
}

/**
 * Checks if a type is a Fragment.
 */
export function isFragment(type: any): boolean {
  return type === Fragment;
}

/**
 * Clones an element with new props.
 */
export function cloneElement(
  element: QuantumElement,
  props?: Partial<ComponentProps>,
  ...children: QuantumNode[]
): QuantumElement {
  return {
    type: element.type,
    props: {
      ...element.props,
      ...props,
      ...(children.length > 0 ? { children } : {}),
    },
    key: props?.key ?? element.key,
  };
}

/**
 * Creates a Quantum element imperatively (alternative to JSX).
 */
export function createElement(
  type: string | ComponentType,
  props?: ComponentProps | null,
  ...children: QuantumNode[]
): QuantumElement {
  const elementProps: ComponentProps = props ?? {};

  if (children.length === 1) {
    elementProps.children = children[0];
  } else if (children.length > 1) {
    elementProps.children = children;
  }

  return {
    type,
    props: elementProps,
    key: elementProps.key ?? null,
  };
}
