/**
 * CSS keyframes for animations
 */

import { generateHashedClassName } from '../core/hash';
import { injectCSS } from '../core/sheet';
import { minifyCSS } from '../core/css';

/**
 * Create CSS keyframes for animations
 */
export function keyframes(styles: string | Record<string, any>): string {
  // Convert object to CSS string if needed
  let cssString: string;

  if (typeof styles === 'string') {
    cssString = styles;
  } else {
    // Convert object notation to keyframes CSS
    cssString = Object.entries(styles)
      .map(([key, value]) => {
        if (typeof value === 'object') {
          const props = Object.entries(value)
            .map(([prop, val]) => {
              const kebabProp = prop.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
              return `${kebabProp}:${val}`;
            })
            .join(';');
          return `${key}{${props}}`;
        }
        return '';
      })
      .join('');
  }

  // Minify
  cssString = minifyCSS(cssString);

  // Generate unique name
  const animationName = generateHashedClassName(cssString, 'anim');

  // Create keyframes rule
  const rule = `@keyframes ${animationName}{${cssString}}`;

  // Inject into stylesheet
  injectCSS(rule);

  return animationName;
}

/**
 * Create an animation configuration
 */
export function animation(
  name: string,
  duration: string | number = '1s',
  timingFunction: string = 'ease',
  delay: string | number = '0s',
  iterationCount: string | number = '1',
  direction: string = 'normal',
  fillMode: string = 'none'
): string {
  const durationStr = typeof duration === 'number' ? `${duration}ms` : duration;
  const delayStr = typeof delay === 'number' ? `${delay}ms` : delay;

  return `${name} ${durationStr} ${timingFunction} ${delayStr} ${iterationCount} ${direction} ${fillMode}`;
}
