import { signal } from '@quantum/reactivity';
import type { Router, RouterOptions, Route, NavigationGuard, RouteConfig } from './types';
import { matchRoute, parseQuery, normalizePath } from './matcher';

/**
 * Create a router instance
 */
export function createRouter(options: RouterOptions): Router {
  const { routes, base = '', mode = 'history', scrollBehavior } = options;

  // Current route signal
  const currentRoute = signal<Route>(createRoute(getCurrentPath()));

  // Navigation guards
  const beforeGuards: NavigationGuard[] = [];
  const afterHooks: Array<(to: Route, from: Route) => void> = [];

  /**
   * Get current path from URL
   */
  function getCurrentPath(): string {
    if (mode === 'hash') {
      return window.location.hash.slice(1) || '/';
    }
    return window.location.pathname;
  }

  /**
   * Create route object from path
   */
  function createRoute(path: string): Route {
    const [pathname, search] = path.split('?');
    const [cleanPath, hash] = pathname.split('#');

    const match = matchRoute(cleanPath, routes);

    if (!match) {
      // 404 route
      return {
        path: cleanPath,
        params: {},
        query: parseQuery(search || ''),
        hash: hash || '',
        matched: [],
      };
    }

    const lastMatched = match.matched[match.matched.length - 1];

    return {
      path: cleanPath,
      params: match.params,
      query: parseQuery(search || ''),
      hash: hash || '',
      name: lastMatched.name,
      meta: lastMatched.meta,
      matched: match.matched,
    };
  }

  /**
   * Navigate to a new route
   */
  async function navigate(path: string, replace = false): Promise<void> {
    const normalizedPath = normalizePath(path, base);
    const to = createRoute(normalizedPath);
    const from = currentRoute();

    // Check if same route
    if (to.path === from.path) {
      return;
    }

    // Run beforeEach guards
    let shouldNavigate = true;
    let redirectPath: string | undefined;

    for (const guard of beforeGuards) {
      await new Promise<void>((resolve) => {
        guard(to, from, (path) => {
          if (path === false) {
            shouldNavigate = false;
          } else if (typeof path === 'string') {
            redirectPath = path;
          }
          resolve();
        });
      });

      if (!shouldNavigate || redirectPath) {
        break;
      }
    }

    if (!shouldNavigate) {
      return;
    }

    if (redirectPath) {
      return navigate(redirectPath, replace);
    }

    // Check route-level beforeEnter guard
    const routeGuard = to.matched[to.matched.length - 1]?.beforeEnter;
    if (routeGuard) {
      let routeShouldNavigate = true;
      let routeRedirectPath: string | undefined;

      await new Promise<void>((resolve) => {
        routeGuard(to, from, (path) => {
          if (path === false) {
            routeShouldNavigate = false;
          } else if (typeof path === 'string') {
            routeRedirectPath = path;
          }
          resolve();
        });
      });

      if (!routeShouldNavigate) {
        return;
      }

      if (routeRedirectPath) {
        return navigate(routeRedirectPath, replace);
      }
    }

    // Check for redirect
    const lastMatched = to.matched[to.matched.length - 1];
    if (lastMatched?.redirect) {
      const redirectTo =
        typeof lastMatched.redirect === 'function'
          ? lastMatched.redirect(to)
          : lastMatched.redirect;
      return navigate(redirectTo, replace);
    }

    // Update URL
    const fullPath = normalizedPath + (to.query ? '?' + new URLSearchParams(to.query).toString() : '');
    if (mode === 'history') {
      if (replace) {
        window.history.replaceState({}, '', fullPath);
      } else {
        window.history.pushState({}, '', fullPath);
      }
    } else {
      if (replace) {
        window.location.replace('#' + fullPath);
      } else {
        window.location.hash = fullPath;
      }
    }

    // Update current route
    currentRoute(to);

    // Handle scroll behavior
    if (scrollBehavior) {
      const position = scrollBehavior(to, from);
      if (position) {
        window.scrollTo(position.x, position.y);
      }
    } else {
      window.scrollTo(0, 0);
    }

    // Run afterEach hooks
    for (const hook of afterHooks) {
      hook(to, from);
    }
  }

  /**
   * Push a new route
   */
  async function push(path: string): Promise<void> {
    return navigate(path, false);
  }

  /**
   * Replace current route
   */
  async function replace(path: string): Promise<void> {
    return navigate(path, true);
  }

  /**
   * Go back/forward in history
   */
  function go(n: number): void {
    window.history.go(n);
  }

  /**
   * Go back
   */
  function back(): void {
    go(-1);
  }

  /**
   * Go forward
   */
  function forward(): void {
    go(1);
  }

  /**
   * Register beforeEach guard
   */
  function beforeEach(guard: NavigationGuard): () => void {
    beforeGuards.push(guard);
    return () => {
      const index = beforeGuards.indexOf(guard);
      if (index > -1) {
        beforeGuards.splice(index, 1);
      }
    };
  }

  /**
   * Register afterEach hook
   */
  function afterEach(hook: (to: Route, from: Route) => void): () => void {
    afterHooks.push(hook);
    return () => {
      const index = afterHooks.indexOf(hook);
      if (index > -1) {
        afterHooks.splice(index, 1);
      }
    };
  }

  // Listen for popstate (back/forward buttons)
  window.addEventListener('popstate', () => {
    const path = getCurrentPath();
    currentRoute(createRoute(path));
  });

  // Listen for hashchange (hash mode)
  if (mode === 'hash') {
    window.addEventListener('hashchange', () => {
      const path = getCurrentPath();
      currentRoute(createRoute(path));
    });
  }

  return {
    get currentRoute() {
      return currentRoute();
    },
    push,
    replace,
    go,
    back,
    forward,
    beforeEach,
    afterEach,
  };
}
