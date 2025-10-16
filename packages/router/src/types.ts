import type { ComponentType } from '@quantum/component';

/**
 * Route configuration
 */
export interface RouteConfig {
  path: string;
  component?: ComponentType<any>;
  children?: RouteConfig[];
  name?: string;
  meta?: Record<string, any>;
  beforeEnter?: NavigationGuard;
  redirect?: string | ((to: Route) => string);
}

/**
 * Matched route with params
 */
export interface Route {
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  hash: string;
  name?: string;
  meta?: Record<string, any>;
  matched: RouteConfig[];
}

/**
 * Navigation guard function
 */
export type NavigationGuard = (
  to: Route,
  from: Route,
  next: (path?: string | false) => void
) => void | Promise<void>;

/**
 * Router options
 */
export interface RouterOptions {
  routes: RouteConfig[];
  base?: string;
  mode?: 'history' | 'hash';
  scrollBehavior?: (to: Route, from: Route) => { x: number; y: number } | null;
}

/**
 * Router instance
 */
export interface Router {
  currentRoute: Route;
  push(path: string): Promise<void>;
  replace(path: string): Promise<void>;
  go(n: number): void;
  back(): void;
  forward(): void;
  beforeEach(guard: NavigationGuard): () => void;
  afterEach(hook: (to: Route, from: Route) => void): () => void;
}
