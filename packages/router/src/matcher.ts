import type { RouteConfig, Route } from './types';

/**
 * Convert path pattern to regex
 */
export function pathToRegex(path: string): {
  regex: RegExp;
  keys: string[];
} {
  const keys: string[] = [];

  // Replace :param with named capture groups
  const pattern = path
    .replace(/\/$/, '')
    .replace(/:(\w+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    })
    .replace(/\*/g, '(.*)');

  return {
    regex: new RegExp(`^${pattern}/?$`),
    keys,
  };
}

/**
 * Match a path against route configs
 */
export function matchRoute(
  path: string,
  routes: RouteConfig[],
  parent: RouteConfig[] = []
): {
  matched: RouteConfig[];
  params: Record<string, string>;
} | null {
  const normalizedPath = path.replace(/\/$/, '') || '/';

  for (const route of routes) {
    // Check if route has children - if so, match as prefix
    const hasChildren = route.children && route.children.length > 0;

    let match: RegExpMatchArray | null = null;
    let params: Record<string, string> = {};
    let keys: string[] = [];

    if (hasChildren) {
      // For routes with children, match as prefix
      const pattern = route.path
        .replace(/\/$/, '')
        .replace(/:(\w+)/g, (_, key) => {
          keys.push(key);
          return '([^/]+)';
        })
        .replace(/\*/g, '(.*)');

      const prefixRegex = new RegExp(`^${pattern}(/|$)`);
      match = normalizedPath.match(prefixRegex);
    } else {
      // For leaf routes, match exactly
      const result = pathToRegex(route.path);
      keys = result.keys;
      match = normalizedPath.match(result.regex);
    }

    if (match) {
      keys.forEach((key, index) => {
        params[key] = match![index + 1];
      });

      const matched = [...parent, route];

      // Check for nested routes
      if (hasChildren) {
        const remainingPath = normalizedPath.slice(route.path.replace(/\/$/, '').length);
        if (remainingPath) {
          const childMatch = matchRoute(remainingPath, route.children!, matched);
          if (childMatch) {
            return {
              matched: childMatch.matched,
              params: { ...params, ...childMatch.params },
            };
          }
        }
      }

      return { matched, params };
    }
  }

  return null;
}

/**
 * Parse query string
 */
export function parseQuery(search: string): Record<string, string> {
  const query: Record<string, string> = {};
  const params = new URLSearchParams(search);

  params.forEach((value, key) => {
    query[key] = value;
  });

  return query;
}

/**
 * Normalize path
 */
export function normalizePath(path: string, base: string = ''): string {
  // Remove trailing slash except for root
  path = path.replace(/\/$/, '') || '/';

  // Add base if provided
  if (base && !path.startsWith(base)) {
    path = base + path;
  }

  return path;
}

/**
 * Resolve relative path
 */
export function resolvePath(from: string, to: string): string {
  if (to.startsWith('/')) {
    return to;
  }

  const fromParts = from.split('/').filter(Boolean);
  const toParts = to.split('/');

  // Don't remove last part - we want to resolve relative to the directory
  // Only process the 'to' parts
  for (const part of toParts) {
    if (part === '..') {
      fromParts.pop();
    } else if (part !== '.' && part !== '') {
      fromParts.push(part);
    }
  }

  return '/' + fromParts.join('/');
}
