# Week 9: Server-Side Rendering (SSR)

## Overview

Week 9 focuses on implementing server-side rendering capabilities for Quantum Framework. This enables:
- **SEO optimization** - Search engines can crawl fully rendered HTML
- **Faster initial page loads** - Users see content before JavaScript loads
- **Better performance** - Reduced time to interactive
- **Progressive enhancement** - Works without JavaScript
- **Static site generation** - Pre-render at build time

## Architecture Decision

**Why SSR instead of Mobile (as per original roadmap)?**

The original roadmap planned Platform Abstraction for mobile support in Week 9-12. However:
1. Mobile requires Swift/Kotlin bridges - a massive undertaking
2. SSR provides immediate value for web applications
3. SSR was deferred from Week 8
4. We can tackle mobile later once web foundation is rock-solid
5. SSR completes the web framework story

## Implementation Plan

### Phase 1: Core SSR Infrastructure

#### 1.1 Server Renderer (`packages/ssr/src/server-renderer.ts`)

```typescript
// Core SSR rendering functions
export function renderToString(component: Component): string
export function renderToStream(component: Component): ReadableStream
export function renderToStaticMarkup(component: Component): string
```

**Features:**
- Convert Quantum components to HTML strings
- Handle signals on the server (non-reactive mode)
- Escape HTML properly
- Support async components
- Stream rendering for large pages

**Implementation:**
- Walk component tree
- Collect HTML strings
- Handle special elements (script, style, meta)
- Serialize signal values for hydration

#### 1.2 State Serialization (`packages/ssr/src/serialization.ts`)

```typescript
export function serializeState(signals: Signal[]): string
export function deserializeState(serialized: string): Map<string, any>
export function collectSignals(component: Component): Signal[]
```

**Features:**
- Serialize signal values to JSON
- Handle circular references
- Support Date, Map, Set, etc.
- Inject serialized state into HTML
- XSS protection

#### 1.3 Async Data Fetching (`packages/ssr/src/data-fetching.ts`)

```typescript
export function createServerData<T>(fetcher: () => Promise<T>): ServerData<T>
export function useServerData<T>(key: string): T | undefined
export function prefetchData(component: Component): Promise<void>
```

**Features:**
- Fetch data during SSR
- Cache fetched data
- Pass data to client
- Suspense integration

### Phase 2: Hydration System

#### 2.1 Client Hydration (`packages/ssr/src/hydration.ts`)

```typescript
export function hydrate(component: Component, root: Element): void
export function createHydrationRoot(root: Element): HydrationRoot
```

**Features:**
- Attach event listeners to existing DOM
- Restore signal values from serialized state
- Skip creating DOM nodes (they already exist)
- Detect hydration mismatches
- Progressive hydration (hydrate visible parts first)

#### 2.2 Mismatch Detection (`packages/ssr/src/mismatch-detection.ts`)

```typescript
export function validateHydration(serverHTML: string, clientHTML: string): void
export function reportMismatch(path: string, issue: string): void
```

**Features:**
- Compare server vs client output
- Warn about mismatches in dev mode
- Suggest fixes
- Graceful fallback

### Phase 3: Server Integration

#### 3.1 Node.js Middleware (`packages/ssr/src/middleware.ts`)

```typescript
export function createSSRMiddleware(options: SSROptions): Middleware
```

**Features:**
- Express/Connect middleware
- Request context (URL, cookies, headers)
- Error handling
- Caching strategies

#### 3.2 Vite SSR Plugin (`packages/ssr/src/vite-plugin.ts`)

```typescript
export function quantumSSR(options?: SSRPluginOptions): Plugin
```

**Features:**
- Vite SSR mode integration
- Module resolution for server
- HMR for SSR
- Dev server with SSR

### Phase 4: Static Site Generation

#### 4.1 SSG Builder (`packages/ssr/src/ssg.ts`)

```typescript
export function generateStaticSite(options: SSGOptions): Promise<void>
export function generatePage(route: string): Promise<string>
export function generateSitemap(): string
```

**Features:**
- Pre-render all routes at build time
- Generate static HTML files
- Sitemap generation
- RSS feed generation
- 404 page handling

### Phase 5: Developer Experience

#### 5.1 CLI Commands

Add to `packages/cli/`:
```bash
quantum ssr dev     # Start SSR dev server
quantum ssr build   # Build for SSR
quantum ssg         # Generate static site
```

#### 5.2 Error Boundaries for SSR

```typescript
export function SSRErrorBoundary(props: ErrorBoundaryProps): Component
```

**Features:**
- Catch errors during SSR
- Render fallback UI
- Log errors to console
- Continue rendering rest of page

## File Structure

```
packages/ssr/
├── src/
│   ├── index.ts                  # Main exports
│   ├── server-renderer.ts        # Core SSR rendering
│   ├── hydration.ts             # Client-side hydration
│   ├── serialization.ts         # State serialization
│   ├── data-fetching.ts         # Async data fetching
│   ├── middleware.ts            # Node.js middleware
│   ├── vite-plugin.ts           # Vite SSR plugin
│   ├── ssg.ts                   # Static site generation
│   ├── mismatch-detection.ts    # Hydration validation
│   ├── error-boundary.ts        # SSR error handling
│   └── types.ts                 # TypeScript types
├── __tests__/
│   ├── server-renderer.test.ts  # SSR rendering tests
│   ├── hydration.test.ts        # Hydration tests
│   ├── serialization.test.ts    # State serialization tests
│   ├── data-fetching.test.ts    # Data fetching tests
│   ├── middleware.test.ts       # Middleware tests
│   ├── ssg.test.ts              # SSG tests
│   └── integration.test.ts      # End-to-end SSR tests
├── package.json
├── tsconfig.json
└── vitest.config.ts

examples/ssr-app/                # SSR example application
├── server/
│   ├── index.ts                 # Express server
│   ├── render.ts                # SSR render function
│   └── routes.ts                # Server routes
├── src/
│   ├── App.tsx                  # Main app component
│   ├── pages/                   # Page components
│   ├── entry-client.tsx         # Client entry point
│   └── entry-server.tsx         # Server entry point
├── public/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Testing Strategy

### Unit Tests (~30-40 tests)

1. **Server Renderer Tests** (10 tests)
   - Render basic components to string
   - Handle nested components
   - Escape HTML properly
   - Render async components
   - Stream rendering
   - Static markup (no hydration markers)

2. **Hydration Tests** (8 tests)
   - Hydrate server-rendered HTML
   - Restore signal state
   - Attach event handlers
   - Detect mismatches
   - Progressive hydration

3. **Serialization Tests** (6 tests)
   - Serialize/deserialize signals
   - Handle complex data types
   - XSS protection
   - Circular references

4. **Data Fetching Tests** (6 tests)
   - Fetch data during SSR
   - Cache fetched data
   - Pass data to client
   - Handle errors

5. **SSG Tests** (5 tests)
   - Generate static HTML
   - Pre-render routes
   - Generate sitemap
   - Handle 404s

6. **Integration Tests** (5 tests)
   - Full SSR flow
   - Server + hydration
   - Error boundaries
   - Real-world scenarios

## Example Usage

### Basic SSR Setup

```tsx
// entry-server.tsx
import { renderToString } from '@quantum/ssr';
import App from './App';

export function render(url: string) {
  const html = renderToString(<App url={url} />);
  return html;
}
```

```tsx
// server/index.ts
import express from 'express';
import { render } from '../entry-server';

const app = express();

app.get('*', async (req, res) => {
  const html = await render(req.url);

  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Quantum SSR</title></head>
      <body>
        <div id="app">${html}</div>
        <script type="module" src="/src/entry-client.tsx"></script>
      </body>
    </html>
  `);
});

app.listen(3000);
```

```tsx
// entry-client.tsx
import { hydrate } from '@quantum/ssr';
import App from './App';

hydrate(<App />, document.getElementById('app')!);
```

### With Data Fetching

```tsx
// pages/Blog.tsx
import { createServerData } from '@quantum/ssr';

export default function Blog() {
  const posts = createServerData(async () => {
    const res = await fetch('https://api.example.com/posts');
    return res.json();
  });

  return (
    <div>
      <h1>Blog Posts</h1>
      {posts.value?.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

### Static Site Generation

```tsx
// ssg.config.ts
export default {
  routes: [
    '/',
    '/about',
    '/blog',
    '/blog/post-1',
    '/blog/post-2',
  ],
  output: 'dist',
  sitemap: true,
};
```

```bash
quantum ssg
# Generates:
# dist/index.html
# dist/about/index.html
# dist/blog/index.html
# dist/blog/post-1/index.html
# dist/blog/post-2/index.html
# dist/sitemap.xml
```

## Integration with Existing Packages

### Core Reactivity

- Signals in SSR mode: return static values, no subscriptions
- Effects in SSR mode: don't run (or run once)
- Computed values: evaluate once
- Batch: no-op on server

### Renderer

- Update `core/renderer` to support hydration mode
- Add `isHydrating` flag
- Skip creating DOM nodes when hydrating
- Only attach event listeners

### Router

- Server-side routing: match URL to route
- No navigation on server
- Extract params from URL
- Pass matched route to client

### Styled

- Collect styles during SSR
- Inject into `<style>` tag in `<head>`
- Critical CSS extraction
- Remove duplicate styles

## Performance Goals

- **Time to First Byte (TTFB)**: <200ms
- **SSR Rendering Time**: <50ms for simple pages
- **Hydration Time**: <100ms
- **Bundle Size**: SSR package <5KB gzipped
- **Memory Usage**: Efficient (no memory leaks)

## Success Criteria

✅ Server-side rendering produces valid HTML
✅ Client-side hydration works without flicker
✅ Signals restore correctly on client
✅ Async data fetching works during SSR
✅ Static site generation produces static HTML files
✅ Error boundaries catch SSR errors
✅ Vite SSR plugin integrates seamlessly
✅ All tests pass (30-40 tests)
✅ Example app demonstrates SSR
✅ Documentation is comprehensive

## Timeline

- **Day 1-2**: Core SSR renderer and serialization
- **Day 3**: Hydration system
- **Day 4**: Data fetching and async support
- **Day 5**: Server integration (middleware, Vite plugin)
- **Day 6**: Static site generation
- **Day 7**: Tests, examples, documentation

## Risks & Mitigations

**Risk**: SSR complexity with signals
- **Mitigation**: Signals in "static mode" on server - just return value, no reactivity

**Risk**: Hydration mismatches
- **Mitigation**: Robust mismatch detection, clear warnings, fallback to client render

**Risk**: Async data fetching edge cases
- **Mitigation**: Simple API, clear documentation, comprehensive tests

**Risk**: Performance overhead
- **Mitigation**: Streaming, caching, benchmarking

## Future Enhancements (Post-Week 9)

- Partial hydration (islands architecture)
- Resumability (Qwik-style)
- Edge runtime support (Cloudflare Workers, Deno Deploy)
- Incremental static regeneration (ISR)
- Advanced caching strategies
- Streaming with Suspense boundaries

## References

- **Next.js**: SSR patterns and APIs
- **Astro**: Static site generation and islands
- **Solid.js**: SSR implementation for signals
- **Qwik**: Resumability and serialization

---

**Status**: 📋 Planning Phase
**Next**: Begin implementation of core SSR infrastructure
