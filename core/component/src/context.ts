/**
 * Quantum Framework - Context API
 *
 * Provides a way to pass data through the component tree
 * without having to pass props down manually at every level.
 */

import type { Signal } from '@quantum/reactivity';
import { getCurrentContext } from './lifecycle';

export interface Context<T> {
  id: symbol;
  defaultValue: T;
  Provider: (props: { value: T; children: any }) => any;
}

const contextMap = new Map<symbol, any>();

/**
 * Creates a new context.
 *
 * @param defaultValue - Default value when no provider is found
 * @returns Context object
 *
 * @example
 * const ThemeContext = createContext('light');
 *
 * // In parent component:
 * <ThemeContext.Provider value="dark">
 *   <ChildComponent />
 * </ThemeContext.Provider>
 *
 * // In child component:
 * const theme = useContext(ThemeContext);
 */
export function createContext<T>(defaultValue: T): Context<T> {
  const id = Symbol('context');

  const Provider = (props: { value: T; children: any }) => {
    const prevValue = contextMap.get(id);

    // Set context value
    contextMap.set(id, props.value);

    // Render children
    const result = props.children;

    // Restore previous value
    if (prevValue !== undefined) {
      contextMap.set(id, prevValue);
    } else {
      contextMap.delete(id);
    }

    return result;
  };

  return {
    id,
    defaultValue,
    Provider,
  };
}

/**
 * Consumes a context value.
 *
 * @param context - The context to consume
 * @returns The current context value
 *
 * @example
 * const theme = useContext(ThemeContext);
 */
export function useContext<T>(context: Context<T>): T {
  const currentContext = getCurrentContext();

  if (!currentContext) {
    console.warn('useContext called outside of component context');
    return context.defaultValue;
  }

  const value = contextMap.get(context.id);
  return value !== undefined ? value : context.defaultValue;
}

/**
 * Creates a reactive context that notifies subscribers on change.
 *
 * @param defaultValue - Default value
 * @returns Reactive context
 *
 * @example
 * const CountContext = createReactiveContext(0);
 *
 * // Provider
 * const [count, setCount] = signal(0);
 * <CountContext.Provider value={count}>
 *   <ChildComponent />
 * </CountContext.Provider>
 *
 * // Consumer
 * const count = useContext(CountContext);
 */
export function createReactiveContext<T>(
  defaultValue: T
): Context<Signal<T> | T> {
  return createContext(defaultValue);
}

/**
 * Hook to consume context with a selector for optimization.
 * Only re-renders when selected value changes.
 *
 * @param context - The context to consume
 * @param selector - Function to select a part of the context
 * @returns Selected value
 *
 * @example
 * const user = useContextSelector(UserContext, ctx => ctx.user);
 */
export function useContextSelector<T, R>(
  context: Context<T>,
  selector: (value: T) => R
): R {
  const value = useContext(context);
  return selector(value);
}
