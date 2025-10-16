import { computed, effect, signal } from '@quantum/reactivity';
import { createContext, useContext } from '@quantum/component';
import type { Router, Route } from './types';

/**
 * Router context
 */
const RouterContext = createContext<Router | null>(null);

/**
 * Get router from context
 */
export function useRouter(): Router {
  const router = useContext(RouterContext);
  if (!router) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return router;
}

/**
 * Get current route
 */
export function useRoute(): Route {
  const router = useRouter();
  return router.currentRoute;
}

/**
 * Router provider component
 */
export function RouterProvider(props: { router: Router; children: any }) {
  return RouterContext.Provider({ value: props.router, children: props.children });
}

/**
 * RouterView component - renders the matched route component
 */
export function RouterView() {
  const router = useRouter();
  const route = signal(router.currentRoute);

  // Update route when router changes
  effect(() => {
    route(router.currentRoute);
  });

  // Return the component directly, not wrapped in computed
  const matched = route().matched;
  if (matched.length === 0) {
    return { type: 'div', props: { children: '404 - Not Found' } };
  }

  const lastMatched = matched[matched.length - 1];
  const Component = lastMatched.component;

  if (!Component) {
    return { type: 'div', props: { children: 'No component defined for route' } };
  }

  return Component({ route: route() });
}

/**
 * Link component props
 */
interface LinkProps {
  to: string;
  activeClass?: string;
  exactActiveClass?: string;
  replace?: boolean;
  children: any;
  class?: string;
  [key: string]: any;
}

/**
 * Link component - navigation with active state
 */
export function Link(props: LinkProps) {
  const router = useRouter();
  const {
    to,
    activeClass = 'router-link-active',
    exactActiveClass = 'router-link-exact-active',
    replace = false,
    children,
    ...rest
  } = props;

  const isActive = computed(() => {
    const current = router.currentRoute.path;
    return current.startsWith(to);
  });

  const isExactActive = computed(() => {
    return router.currentRoute.path === to;
  });

  const className = computed(() => {
    const classes: string[] = [];
    if (rest.class) {
      classes.push(rest.class);
    }
    if (isActive()) {
      classes.push(activeClass);
    }
    if (isExactActive()) {
      classes.push(exactActiveClass);
    }
    return classes.join(' ');
  });

  const handleClick = (e: Event) => {
    e.preventDefault();
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };

  return {
    type: 'a',
    props: {
      href: to,
      class: className(),
      onClick: handleClick,
      ...rest,
      children,
    },
  };
}

/**
 * Navigate hook for programmatic navigation
 */
export function useNavigate() {
  const router = useRouter();

  return {
    push: (path: string) => router.push(path),
    replace: (path: string) => router.replace(path),
    back: () => router.back(),
    forward: () => router.forward(),
    go: (n: number) => router.go(n),
  };
}

/**
 * Params hook - get route params
 */
export function useParams(): Record<string, string> {
  const route = useRoute();
  return route.params;
}

/**
 * Query hook - get query params
 */
export function useQuery(): Record<string, string> {
  const route = useRoute();
  return route.query;
}
