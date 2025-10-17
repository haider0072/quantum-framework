/**
 * Core CSS-in-JS engine
 */

import type { StyleInput } from '../types';
import { generateHashedClassName } from './hash';
import { styleCache } from './cache';
import { createCSSRule, minifyCSS, parseTemplateLiteral } from './css';
import { injectCSS } from './sheet';

/**
 * Process style input and return CSS string
 */
export function processStyleInput(
  input: StyleInput,
  props?: any
): string {
  // Handle functions
  if (typeof input === 'function') {
    return processStyleInput(input(props), props);
  }

  // Handle arrays
  if (Array.isArray(input)) {
    return input
      .map((item) => processStyleInput(item, props))
      .filter(Boolean)
      .join('');
  }

  // Handle strings (raw CSS)
  if (typeof input === 'string') {
    return input;
  }

  // Handle CSS objects
  if (typeof input === 'object' && input !== null) {
    const cssString = Object.entries(input)
      .map(([key, value]) => {
        if (value === undefined || value === null) return '';

        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

        // Handle numeric values
        const stringValue = typeof value === 'number' && value !== 0
          ? `${value}px`
          : String(value);

        return `${kebabKey}:${stringValue}`;
      })
      .filter(Boolean)
      .join(';');

    return cssString;
  }

  return '';
}

/**
 * Create a CSS class from style input
 */
export function css(
  styles: StyleInput | TemplateStringsArray,
  ...interpolations: any[]
): string {
  // Handle template literal syntax
  let cssString: string;
  if (Array.isArray(styles) && 'raw' in styles) {
    cssString = parseTemplateLiteral(styles as TemplateStringsArray, interpolations);
  } else {
    // Handle regular style input
    cssString = processStyleInput(styles as StyleInput);
  }

  // Minify the CSS
  cssString = minifyCSS(cssString);

  // Check cache
  const cached = styleCache.get(cssString);
  if (cached) {
    return cached;
  }

  // Generate class name
  const className = generateHashedClassName(cssString);

  // Create CSS rule
  const rule = createCSSRule(`.${className}`, cssString);

  // Inject into stylesheet
  injectCSS(rule);

  // Cache it
  styleCache.set(cssString, className);

  return className;
}

/**
 * Create CSS with explicit props (for styled components)
 */
export function cssWithProps<P = any>(
  styles: StyleInput<P>,
  props: P
): string {
  const cssString = processStyleInput(styles, props);
  return css(cssString);
}

/**
 * Combine multiple class names
 */
export function cx(...classNames: (string | undefined | null | false)[]): string {
  return classNames.filter(Boolean).join(' ');
}
