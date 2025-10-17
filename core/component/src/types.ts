/**
 * Quantum Framework - Component Types
 *
 * Type definitions for components and elements
 */

export type Key = string | number | symbol;
export type Ref<T = any> = { current: T | null };

export interface ComponentProps {
  children?: QuantumNode;
  key?: Key;
  ref?: Ref;
  [prop: string]: any;
}

export type FunctionComponent<P = {}> = (props: P & ComponentProps) => QuantumNode;

export type ComponentType<P = {}> = FunctionComponent<P>;

export type QuantumNode =
  | QuantumElement
  | string
  | number
  | boolean
  | null
  | undefined
  | QuantumNode[];

export interface QuantumElement {
  type: string | ComponentType;
  props: ComponentProps;
  key: Key | null;
}

export type QuantumFragment = { children: QuantumNode[] };

// Alias for convenience and SSR compatibility
export type Component = QuantumNode;
export type ComponentElement = QuantumElement;
