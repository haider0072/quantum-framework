/**
 * Quantum SSR - Server-Side Rendering for Quantum Framework
 * @packageDocumentation
 */

// Export types
export type {
  SSROptions,
  SSRResult,
  HydrationOptions,
  HydrationRoot,
  HydrationMismatch,
  ServerData,
  ServerDataFetcher,
  SSRContext,
  SSGOptions,
  StreamOptions,
  SSRErrorBoundaryProps,
  SerializationOptions,
  SSRMiddlewareOptions,
} from './types.js';

// Export server rendering
export {
  renderToString,
  renderToStaticMarkup,
  renderToStringWithState,
  renderToStream,
  isSSR,
  getCollectedSignals,
  clearCollectedSignals,
} from './server-renderer.js';

// Import for default export
import {
  renderToString,
  renderToStaticMarkup,
  renderToStream,
} from './server-renderer.js';

// Export serialization
export {
  serializeState,
  deserializeState,
  injectState,
  extractState,
  extractAndDeserializeState,
  safeJSONStringify,
} from './serialization.js';

// Export hydration
export {
  hydrate,
  createHydrationRoot,
  progressiveHydrate,
  isHydrationActive,
  getHydrationMismatches,
  clearHydrationMismatches,
  getHydratedValue,
  hasHydratedValue,
} from './hydration.js';

// Import for default export
import {
  hydrate,
  createHydrationRoot,
} from './hydration.js';

// Export data fetching
export {
  createServerData,
  prefetchData,
  useServerData,
  hasData,
  getAllFetchedData,
  setFetchedData,
  clearFetchedData,
  serializeFetchedData,
  deserializeFetchedData,
  setSSRContext,
  getSSRContext,
  clearSSRContext,
} from './data-fetching.js';

// Import for default export
import {
  createServerData,
  useServerData,
} from './data-fetching.js';

// Export SSG
export {
  generateStaticSite,
  generateStaticPage,
} from './ssg.js';

// Import for default export
import {
  generateStaticSite,
} from './ssg.js';

// Version
export const version = '0.0.1';

/**
 * Default export with common functions
 */
export default {
  // Server
  renderToString: renderToString,
  renderToStaticMarkup: renderToStaticMarkup,
  renderToStream: renderToStream,

  // Hydration
  hydrate: hydrate,
  createHydrationRoot: createHydrationRoot,

  // Data fetching
  createServerData: createServerData,
  useServerData: useServerData,

  // SSG
  generateStaticSite: generateStaticSite,

  // Version
  version: version,
};
