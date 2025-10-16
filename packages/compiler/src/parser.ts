/**
 * JSX/TSX Parser for Quantum Framework
 *
 * Parses JSX/TSX code into an Abstract Syntax Tree (AST) using Babel parser.
 * This AST is then used by the transformer for optimization.
 */

import { parse, ParserOptions } from '@babel/parser';
import type { File } from '@babel/types';

export interface ParseOptions {
  filename?: string;
  sourceType?: 'module' | 'script';
  jsx?: boolean;
  typescript?: boolean;
}

/**
 * Parse JSX/TSX source code into an AST
 */
export function parseCode(code: string, options: ParseOptions = {}): File {
  const {
    filename = 'unknown.tsx',
    sourceType = 'module',
    jsx = true,
    typescript = true,
  } = options;

  const parserOptions: ParserOptions = {
    sourceType,
    sourceFilename: filename,
    plugins: [],
  };

  // Add JSX plugin
  if (jsx) {
    parserOptions.plugins!.push('jsx');
  }

  // Add TypeScript plugin
  if (typescript) {
    parserOptions.plugins!.push('typescript');
  }

  try {
    return parse(code, parserOptions);
  } catch (error) {
    throw new Error(
      `Failed to parse ${filename}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Check if a file should be processed by the compiler
 */
export function shouldTransform(filename: string): boolean {
  return /\.(tsx?|jsx?)$/.test(filename);
}

/**
 * Get file extension to determine parser mode
 */
export function getFileMode(filename: string): { jsx: boolean; typescript: boolean } {
  const ext = filename.split('.').pop()?.toLowerCase();

  return {
    jsx: ext === 'jsx' || ext === 'tsx',
    typescript: ext === 'ts' || ext === 'tsx',
  };
}
