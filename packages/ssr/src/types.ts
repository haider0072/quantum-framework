/**
 * Types for Quantum SSR
 */

import type { Component } from '@quantum/component';
import type { Signal } from '@quantum/reactivity';

/**
 * SSR rendering options
 */
export interface SSROptions {
  /**
   * Whether to include hydration markers in the HTML
   * @default true
   */
  includeHydrationMarkers?: boolean;

  /**
   * Whether to render only static markup (no hydration)
   * @default false
   */
  staticMarkup?: boolean;

  /**
   * Context data to pass to components during SSR
   */
  context?: Record<string, any>;

  /**
   * Base URL for the application (for routing)
   */
  baseURL?: string;

  /**
   * Request headers (for server-side data fetching)
   */
  headers?: Record<string, string>;

  /**
   * Error handler for SSR errors
   */
  onError?: (error: Error) => void;
}

/**
 * Result of server-side rendering
 */
export interface SSRResult {
  /**
   * The rendered HTML string
   */
  html: string;

  /**
   * Serialized state for hydration
   */
  state: string;

  /**
   * Collected styles from styled components
   */
  styles?: string;

  /**
   * Head content (title, meta tags, etc.)
   */
  head?: string;

  /**
   * Any errors that occurred during rendering
   */
  errors?: Error[];
}

/**
 * Hydration options
 */
export interface HydrationOptions {
  /**
   * Whether to suppress hydration mismatch warnings
   * @default false
   */
  suppressHydrationWarning?: boolean;

  /**
   * Whether to use progressive hydration
   * @default false
   */
  progressive?: boolean;

  /**
   * Callback when hydration is complete
   */
  onHydrated?: () => void;

  /**
   * Error handler for hydration errors
   */
  onError?: (error: Error) => void;
}

/**
 * Server data resource
 */
export interface ServerData<T> {
  /**
   * The signal containing the data
   */
  value: Signal<T | undefined>;

  /**
   * Loading state
   */
  loading: Signal<boolean>;

  /**
   * Error state
   */
  error: Signal<Error | undefined>;

  /**
   * Refetch the data
   */
  refetch: () => Promise<void>;
}

/**
 * Server data fetcher function
 */
export type ServerDataFetcher<T> = (context?: SSRContext) => Promise<T>;

/**
 * SSR context available to components during server rendering
 */
export interface SSRContext {
  /**
   * The current URL being rendered
   */
  url: string;

  /**
   * Request headers
   */
  headers: Record<string, string>;

  /**
   * Custom context data
   */
  data: Record<string, any>;

  /**
   * Set HTTP status code for the response
   */
  setStatusCode: (code: number) => void;

  /**
   * Set a response header
   */
  setHeader: (name: string, value: string) => void;

  /**
   * Redirect to another URL
   */
  redirect: (url: string, statusCode?: number) => void;

  /**
   * Whether we're currently rendering on the server
   */
  isServer: true;
}

/**
 * Static site generation options
 */
export interface SSGOptions {
  /**
   * Routes to pre-render
   */
  routes: string[] | (() => Promise<string[]>);

  /**
   * Output directory
   * @default 'dist'
   */
  output?: string;

  /**
   * Whether to generate a sitemap
   * @default false
   */
  sitemap?: boolean;

  /**
   * Base URL for the sitemap
   */
  sitemapBaseURL?: string;

  /**
   * Whether to minify the HTML
   * @default true
   */
  minify?: boolean;

  /**
   * Error handler for generation errors
   */
  onError?: (route: string, error: Error) => void;

  /**
   * Callback for each generated route
   */
  onRouteGenerated?: (route: string, html: string) => void;
}

/**
 * Streaming SSR options
 */
export interface StreamOptions extends SSROptions {
  /**
   * Whether to stream the response
   * @default true
   */
  streaming?: boolean;

  /**
   * Callback when streaming starts
   */
  onStreamStart?: () => void;

  /**
   * Callback when streaming ends
   */
  onStreamEnd?: () => void;

  /**
   * Callback for stream errors
   */
  onStreamError?: (error: Error) => void;
}

/**
 * Hydration mismatch info
 */
export interface HydrationMismatch {
  /**
   * The type of mismatch
   */
  type: 'attribute' | 'text' | 'tag' | 'children';

  /**
   * The expected value (from server)
   */
  expected: string;

  /**
   * The actual value (from client)
   */
  actual: string;

  /**
   * The DOM path where the mismatch occurred
   */
  path: string;

  /**
   * The element that has the mismatch
   */
  element?: Element;
}

/**
 * SSR error boundary props
 */
export interface SSRErrorBoundaryProps {
  /**
   * Fallback UI to render when an error occurs
   */
  fallback?: Component | ((error: Error) => Component);

  /**
   * Error handler
   */
  onError?: (error: Error, errorInfo: { componentStack?: string }) => void;

  /**
   * Children to render
   */
  children: any;
}

/**
 * Serialization options
 */
export interface SerializationOptions {
  /**
   * Whether to include function values
   * @default false
   */
  includeFunctions?: boolean;

  /**
   * Custom serializers for specific types
   */
  serializers?: Map<any, (value: any) => any>;

  /**
   * Custom deserializers for specific types
   */
  deserializers?: Map<string, (value: any) => any>;

  /**
   * Whether to handle circular references
   * @default true
   */
  handleCircular?: boolean;
}

/**
 * Hydration root
 */
export interface HydrationRoot {
  /**
   * The root DOM element
   */
  element: Element;

  /**
   * Unmount the hydrated app
   */
  unmount: () => void;

  /**
   * Whether the app is currently hydrating
   */
  isHydrating: () => boolean;
}

/**
 * SSR middleware options for Express/Connect
 */
export interface SSRMiddlewareOptions extends SSROptions {
  /**
   * The root component to render
   */
  component: Component;

  /**
   * HTML template function
   */
  template?: (content: SSRResult, url: string) => string;

  /**
   * Whether to enable caching
   * @default false
   */
  cache?: boolean;

  /**
   * Cache TTL in seconds
   * @default 300
   */
  cacheTTL?: number;

  /**
   * Whether to enable compression
   * @default true
   */
  compression?: boolean;
}
