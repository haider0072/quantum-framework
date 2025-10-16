/**
 * Code Generator for Quantum Framework
 *
 * Generates optimized JavaScript code from transformed AST.
 * Includes source map support for debugging.
 */

import generate from '@babel/generator';
import type { File } from '@babel/types';

export interface GenerateOptions {
  sourceMaps?: boolean;
  filename?: string;
  minified?: boolean;
}

export interface GenerateResult {
  code: string;
  map?: any;
}

/**
 * Generate code from AST
 */
export function generateCode(ast: File, options: GenerateOptions = {}): GenerateResult {
  const { sourceMaps = true, filename = 'unknown.js', minified = false } = options;

  const result = generate(
    ast,
    {
      sourceMaps,
      sourceFileName: filename,
      compact: minified,
      minified,
      comments: !minified,
      retainLines: false,
    },
    undefined
  );

  return {
    code: result.code,
    map: result.map,
  };
}
