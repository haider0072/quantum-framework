/**
 * Vite Plugin for Quantum Framework
 *
 * Integrates the Quantum compiler into Vite's build pipeline.
 * Provides fast refresh, HMR, and optimized production builds.
 */

import type { Plugin } from 'vite';
import { compile, type CompileOptions } from './index.js';

export interface QuantumPluginOptions {
  /**
   * Include patterns for files to transform
   * @default /\.[jt]sx$/
   */
  include?: RegExp | RegExp[];

  /**
   * Exclude patterns for files to skip
   * @default /node_modules/
   */
  exclude?: RegExp | RegExp[];

  /**
   * Enable development mode features
   * @default true in dev, false in build
   */
  development?: boolean;

  /**
   * Enable source maps
   * @default true
   */
  sourceMaps?: boolean;
}

/**
 * Vite plugin for Quantum Framework compilation
 */
export function quantumPlugin(options: QuantumPluginOptions = {}): Plugin {
  const {
    include = /\.[jt]sx$/,
    exclude = /node_modules/,
    sourceMaps = true,
  } = options;

  let isDev = true;

  return {
    name: 'vite-plugin-quantum',

    // Set development mode based on Vite command
    config(_config, { command }) {
      isDev = command === 'serve';
    },

    // Transform JSX/TSX files
    transform(code, id) {
      // Check if file should be processed
      if (!shouldProcess(id, include, exclude)) {
        return null;
      }

      try {
        const development = options.development !== undefined ? options.development : isDev;

        const compileOptions: CompileOptions = {
          filename: id,
          development,
          sourceMaps,
          minified: !development,
        };

        const result = compile(code, compileOptions);

        // Return transformed code with source map
        return {
          code: result.code,
          map: result.map,
        };
      } catch (error) {
        // Let Vite handle the error display
        this.error({
          message: `Quantum compilation error: ${error instanceof Error ? error.message : String(error)}`,
          id,
        });
        return null;
      }
    },

    // Handle HMR
    handleHotUpdate({ file, server }) {
      // Check if this is a Quantum file
      if (shouldProcess(file, include, exclude)) {
        // Invalidate the module and trigger a re-transform
        const module = server.moduleGraph.getModuleById(file);
        if (module) {
          server.moduleGraph.invalidateModule(module);
        }
      }
    },
  };
}

/**
 * Check if a file should be processed by the plugin
 */
function shouldProcess(
  id: string,
  include: RegExp | RegExp[],
  exclude: RegExp | RegExp[]
): boolean {
  // Check exclude patterns first
  const excludePatterns = Array.isArray(exclude) ? exclude : [exclude];
  for (const pattern of excludePatterns) {
    if (pattern.test(id)) {
      return false;
    }
  }

  // Check include patterns
  const includePatterns = Array.isArray(include) ? include : [include];
  for (const pattern of includePatterns) {
    if (pattern.test(id)) {
      return true;
    }
  }

  return false;
}

// Export as default for convenience
export default quantumPlugin;
