/**
 * Quantum Framework Compiler
 *
 * Main entry point for the compiler that orchestrates parsing,
 * transformation, and code generation.
 */

import { parseCode, shouldTransform, getFileMode, type ParseOptions } from './parser';
import { transformAST, type TransformOptions, type TransformMetadata } from './transformer';
import { generateCode, type GenerateOptions } from './generator';

export interface CompileOptions {
  filename?: string;
  development?: boolean;
  sourceMaps?: boolean;
  minified?: boolean;
}

export interface CompileResult {
  code: string;
  map?: any;
  metadata: TransformMetadata;
}

/**
 * Compile JSX/TSX source code to optimized JavaScript
 *
 * @param code - Source code to compile
 * @param options - Compilation options
 * @returns Compiled code with metadata
 */
export function compile(code: string, options: CompileOptions = {}): CompileResult {
  const {
    filename = 'unknown.tsx',
    development = false,
    sourceMaps = true,
    minified = false,
  } = options;

  // Check if file should be transformed
  if (!shouldTransform(filename)) {
    return {
      code,
      metadata: {
        hasJSX: false,
        staticNodes: 0,
        dynamicNodes: 0,
        components: [],
        signals: [],
      },
    };
  }

  // Determine parsing mode
  const fileMode = getFileMode(filename);

  // Parse code to AST
  const parseOptions: ParseOptions = {
    filename,
    ...fileMode,
  };
  const ast = parseCode(code, parseOptions);

  // Transform AST
  const transformOptions: TransformOptions = {
    development,
    sourceMaps,
    filename,
  };
  const { ast: transformedAST, metadata } = transformAST(ast, transformOptions);

  // Generate code
  const generateOptions: GenerateOptions = {
    sourceMaps,
    filename,
    minified,
  };
  const { code: generatedCode, map } = generateCode(transformedAST, generateOptions);

  return {
    code: generatedCode,
    map,
    metadata,
  };
}

// Re-export types and utilities
export { parseCode, transformAST, generateCode };
export type { ParseOptions, TransformOptions, GenerateOptions, TransformMetadata };
export { shouldTransform, getFileMode } from './parser';
