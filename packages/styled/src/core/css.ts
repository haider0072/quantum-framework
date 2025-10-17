/**
 * CSS generation and manipulation utilities
 */

import type { CSSProperties } from '../types';

/**
 * Convert camelCase to kebab-case
 */
export function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Convert a CSS value to a string
 */
export function valueToString(value: string | number): string {
  if (typeof value === 'number') {
    // If it's a number, append 'px' (except for 0)
    // Note: unitless properties like opacity, zIndex, etc. should be handled
    // at a higher level where property names are available
    return value === 0 ? '0' : `${value}px`;
  }
  return value;
}

/**
 * Convert CSS properties object to CSS string
 */
export function cssPropertiesToString(properties: CSSProperties): string {
  const entries = Object.entries(properties);
  if (entries.length === 0) return '';

  return entries
    .map(([key, value]) => {
      if (value === undefined || value === null) return '';
      const kebabKey = camelToKebab(key);
      const stringValue = valueToString(value);
      return `${kebabKey}:${stringValue}`;
    })
    .filter(Boolean)
    .join(';');
}

/**
 * Create a CSS rule string
 */
export function createCSSRule(selector: string, properties: CSSProperties | string): string {
  const cssString = typeof properties === 'string'
    ? properties
    : cssPropertiesToString(properties);

  if (!cssString) return '';

  return `${selector}{${cssString}}`;
}

/**
 * Parse template literal styles
 */
export function parseTemplateLiteral(
  strings: TemplateStringsArray,
  interpolations: any[]
): string {
  let result = strings[0];

  for (let i = 0; i < interpolations.length; i++) {
    const interpolation = interpolations[i];
    result += String(interpolation) + strings[i + 1];
  }

  return result;
}

/**
 * Minify CSS string (remove extra whitespace)
 */
export function minifyCSS(css: string): string {
  return css
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .trim();
}
