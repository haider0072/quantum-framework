/**
 * Type definitions for directives and transitions
 */

import type { Signal } from '@quantum/reactivity';

/**
 * Directive hook lifecycle
 */
export interface DirectiveHooks<T = any> {
  /**
   * Called before the element is inserted into the DOM
   */
  beforeMount?(el: HTMLElement, binding: DirectiveBinding<T>): void;

  /**
   * Called when the element is mounted
   */
  mounted?(el: HTMLElement, binding: DirectiveBinding<T>): void;

  /**
   * Called before the element is updated
   */
  beforeUpdate?(el: HTMLElement, binding: DirectiveBinding<T>, oldBinding: DirectiveBinding<T>): void;

  /**
   * Called when the element is updated
   */
  updated?(el: HTMLElement, binding: DirectiveBinding<T>, oldBinding: DirectiveBinding<T>): void;

  /**
   * Called before the element is unmounted
   */
  beforeUnmount?(el: HTMLElement, binding: DirectiveBinding<T>): void;

  /**
   * Called when the element is unmounted
   */
  unmounted?(el: HTMLElement, binding: DirectiveBinding<T>): void;
}

/**
 * Directive binding information
 */
export interface DirectiveBinding<T = any> {
  /**
   * The value passed to the directive
   */
  value: T;

  /**
   * The previous value (only in updated hooks)
   */
  oldValue?: T;

  /**
   * Directive argument (e.g., 'click' in v-on:click)
   */
  arg?: string;

  /**
   * Directive modifiers (e.g., { prevent: true } in v-on:click.prevent)
   */
  modifiers?: Record<string, boolean>;

  /**
   * The component instance
   */
  instance?: any;
}

/**
 * Directive definition
 */
export type Directive<T = any> = DirectiveHooks<T> | ((el: HTMLElement, binding: DirectiveBinding<T>) => void);

/**
 * Transition phases
 */
export type TransitionPhase =
  | 'enter-from'
  | 'enter-active'
  | 'enter-to'
  | 'leave-from'
  | 'leave-active'
  | 'leave-to';

/**
 * Transition hooks
 */
export interface TransitionHooks {
  beforeEnter?(el: HTMLElement): void;
  enter?(el: HTMLElement, done: () => void): void;
  afterEnter?(el: HTMLElement): void;
  enterCancelled?(el: HTMLElement): void;

  beforeLeave?(el: HTMLElement): void;
  leave?(el: HTMLElement, done: () => void): void;
  afterLeave?(el: HTMLElement): void;
  leaveCancelled?(el: HTMLElement): void;
}

/**
 * Transition props
 */
export interface TransitionProps extends TransitionHooks {
  /**
   * Name for transition classes (e.g., 'fade' -> 'fade-enter-from')
   */
  name?: string;

  /**
   * Whether to apply CSS transitions
   */
  css?: boolean;

  /**
   * Custom transition classes
   */
  enterFromClass?: string;
  enterActiveClass?: string;
  enterToClass?: string;
  leaveFromClass?: string;
  leaveActiveClass?: string;
  leaveToClass?: string;

  /**
   * Transition duration in ms
   */
  duration?: number | { enter: number; leave: number };

  /**
   * Appear on initial render
   */
  appear?: boolean;

  /**
   * Mode: 'in-out' | 'out-in' | 'default'
   */
  mode?: 'in-out' | 'out-in' | 'default';
}

/**
 * For directive options
 */
export interface ForDirectiveOptions {
  /**
   * Items to iterate over
   */
  items: any[] | number | Signal<any[]>;

  /**
   * Key function for tracking items
   */
  key?: (item: any, index: number) => string | number;

  /**
   * Track by index instead of key
   */
  trackBy?: 'index' | 'key';
}

/**
 * Show directive options
 */
export interface ShowDirectiveOptions {
  /**
   * Whether to show the element
   */
  show: boolean | Signal<boolean>;

  /**
   * Transition to apply
   */
  transition?: TransitionProps;
}

/**
 * If directive options
 */
export interface IfDirectiveOptions {
  /**
   * Condition to render
   */
  condition: boolean | Signal<boolean>;

  /**
   * Transition to apply
   */
  transition?: TransitionProps;
}
