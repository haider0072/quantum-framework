/**
 * Style sheet management
 */

/**
 * Get or create the style element for injecting styles
 */
let styleElement: HTMLStyleElement | null = null;

export function getStyleElement(): HTMLStyleElement {
  if (styleElement) return styleElement;

  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    // SSR - return a mock element
    return {
      sheet: null,
      textContent: '',
    } as any;
  }

  // Look for existing style element
  const existing = document.querySelector('style[data-quantum-styled]');
  if (existing) {
    styleElement = existing as HTMLStyleElement;
    return styleElement;
  }

  // Create new style element
  styleElement = document.createElement('style');
  styleElement.setAttribute('data-quantum-styled', '');
  document.head.appendChild(styleElement);

  return styleElement;
}

/**
 * Inject CSS into the style sheet
 */
export function injectCSS(css: string): void {
  const element = getStyleElement();

  // Always use textContent for simplicity and SSR compatibility
  element.textContent += css;
}

/**
 * Clear all injected styles
 */
export function clearStyles(): void {
  if (styleElement) {
    styleElement.textContent = '';
  }
}

/**
 * Get all injected CSS as a string (useful for SSR)
 */
export function getStyles(): string {
  if (!styleElement) return '';
  return styleElement.textContent || '';
}

/**
 * Reset the style element reference (useful for testing)
 */
export function resetStyleElement(): void {
  styleElement = null;
}
