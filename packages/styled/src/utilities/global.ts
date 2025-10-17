/**
 * Global styles
 */

import type { GlobalStylesConfig } from '../types';
import { injectCSS } from '../core/sheet';
import { minifyCSS } from '../core/css';

/**
 * CSS reset styles
 */
const RESET_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{line-height:1.15;-webkit-text-size-adjust:100%}
body{margin:0;font-family:system-ui,-apple-system,sans-serif}
h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}
a{color:inherit;text-decoration:inherit}
button,input,select,textarea{font:inherit;margin:0;padding:0}
button{cursor:pointer}
img{display:block;max-width:100%}
`;

/**
 * Inject global styles
 */
export function createGlobalStyles(config: GlobalStylesConfig | string): void {
  let cssString = '';

  // Handle string input
  if (typeof config === 'string') {
    cssString = config;
  } else {
    // Add reset if requested
    if (config.reset) {
      cssString += RESET_CSS;
    }

    // Add custom styles
    if (config.styles) {
      if (typeof config.styles === 'string') {
        cssString += config.styles;
      } else {
        // Convert object to CSS
        const entries = Object.entries(config.styles);
        cssString += entries
          .map(([key, value]) => {
            const kebabKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
            return `${kebabKey}:${value}`;
          })
          .join(';');
      }
    }
  }

  // Minify and inject
  cssString = minifyCSS(cssString);
  injectCSS(cssString);
}

/**
 * Convenience function for just applying reset
 */
export function applyResetStyles(): void {
  injectCSS(RESET_CSS);
}
