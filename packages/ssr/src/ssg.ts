/**
 * Static Site Generation (SSG)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { Component } from '@quantum/component';
import type { SSGOptions } from './types.js';
import { renderToStringWithState } from './server-renderer.js';
import { injectState } from './serialization.js';

/**
 * Generate a single page
 *
 * @param route - The route to generate
 * @param component - The component to render
 * @param template - HTML template function
 * @returns The generated HTML
 */
async function generatePage(
  route: string,
  component: Component,
  template: (html: string, route: string) => string
): Promise<string> {
  // Render the component
  const { html, state } = renderToStringWithState(component);

  // Inject state into HTML
  const htmlWithState = injectState(html, state);

  // Apply template
  const fullHTML = template(htmlWithState, route);

  return fullHTML;
}

/**
 * Write HTML to file
 *
 * @param outputPath - The output file path
 * @param html - The HTML content
 */
async function writeHTML(outputPath: string, html: string): Promise<void> {
  // Ensure directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  // Write file
  await fs.writeFile(outputPath, html, 'utf-8');
}

/**
 * Get output path for a route
 *
 * @param route - The route
 * @param outputDir - The output directory
 * @returns The output file path
 */
function getOutputPath(route: string, outputDir: string): string {
  // Remove leading slash
  let routePath = route.startsWith('/') ? route.slice(1) : route;

  // Handle root route
  if (routePath === '') {
    return path.join(outputDir, 'index.html');
  }

  // Handle routes with extension
  if (path.extname(routePath)) {
    return path.join(outputDir, routePath);
  }

  // Handle routes as directories
  return path.join(outputDir, routePath, 'index.html');
}

/**
 * Generate sitemap XML
 *
 * @param routes - The routes to include
 * @param baseURL - The base URL
 * @returns Sitemap XML string
 */
function generateSitemap(routes: string[], baseURL: string): string {
  const urls = routes.map(route => {
    const loc = new URL(route, baseURL).toString();
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

/**
 * Minify HTML
 *
 * @param html - The HTML to minify
 * @returns Minified HTML
 */
function minifyHTML(html: string): string {
  return html
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove whitespace between tags
    .replace(/>\s+</g, '><')
    // Remove leading/trailing whitespace
    .trim();
}

/**
 * Generate a static site
 *
 * @param component - The root component (should handle routing)
 * @param options - SSG options
 *
 * @example
 * ```tsx
 * import { generateStaticSite } from '@quantum/ssr';
 * import App from './App';
 *
 * await generateStaticSite(App, {
 *   routes: ['/', '/about', '/blog'],
 *   output: 'dist',
 *   sitemap: true,
 *   sitemapBaseURL: 'https://example.com',
 * });
 * ```
 */
export async function generateStaticSite(
  component: Component | ((route: string) => Component),
  options: SSGOptions
): Promise<void> {
  const {
    routes: routesInput,
    output = 'dist',
    sitemap = false,
    sitemapBaseURL = 'https://example.com',
    minify = true,
    onError,
    onRouteGenerated,
  } = options;

  // Resolve routes
  const routes = typeof routesInput === 'function'
    ? await routesInput()
    : routesInput;

  // Default HTML template
  const template = (html: string, _route: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quantum App</title>
</head>
<body>
  <div id="app">${html}</div>
</body>
</html>`;

  // Generate each route
  for (const routePath of routes) {
    try {
      // Get component for route
      const routeComponent = typeof component === 'function'
        ? component(routePath)
        : component;

      // Generate HTML
      let html = await generatePage(routePath, routeComponent, template);

      // Minify if requested
      if (minify) {
        html = minifyHTML(html);
      }

      // Get output path
      const outputPath = getOutputPath(routePath, output);

      // Write to file
      await writeHTML(outputPath, html);

      // Callback
      if (onRouteGenerated) {
        onRouteGenerated(routePath, html);
      }

      console.log(`✓ Generated: ${routePath} -> ${outputPath}`);
    } catch (error) {
      console.error(`✗ Failed to generate ${routePath}:`, error);
      if (onError) {
        onError(routePath, error as Error);
      } else {
        throw error;
      }
    }
  }

  // Generate sitemap if requested
  if (sitemap) {
    const sitemapXML = generateSitemap(routes, sitemapBaseURL);
    const sitemapPath = path.join(output, 'sitemap.xml');
    await fs.writeFile(sitemapPath, sitemapXML, 'utf-8');
    console.log(`✓ Generated sitemap: ${sitemapPath}`);
  }

  console.log(`\n✅ Static site generated successfully!`);
  console.log(`   Routes: ${routes.length}`);
  console.log(`   Output: ${output}`);
}

/**
 * Generate a single static page
 *
 * @param route - The route to generate
 * @param component - The component to render
 * @param outputPath - The output file path
 * @param options - Options
 */
export async function generateStaticPage(
  _route: string,
  component: Component,
  outputPath: string,
  options: { minify?: boolean } = {}
): Promise<void> {
  const template = (html: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quantum App</title>
</head>
<body>
  <div id="app">${html}</div>
</body>
</html>`;

  let html = await generatePage('/', component, template);

  if (options.minify !== false) {
    html = minifyHTML(html);
  }

  await writeHTML(outputPath, html);
}
