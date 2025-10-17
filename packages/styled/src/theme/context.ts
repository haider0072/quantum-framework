/**
 * Theme context using signals
 */

import { signal } from '@quantum/reactivity';
import type { Theme, DefaultTheme } from '../types';

/**
 * Global theme signal
 */
const themeSignal = signal<Theme>({});

/**
 * Get the current theme
 */
export function getTheme<T extends Theme = DefaultTheme>(): T {
  return themeSignal() as T;
}

/**
 * Set the theme
 */
export function setTheme<T extends Theme = DefaultTheme>(theme: T): void {
  themeSignal(theme);
}

/**
 * Update theme partially
 */
export function updateTheme(updates: Partial<Theme>): void {
  themeSignal({
    ...themeSignal(),
    ...updates,
  });
}

/**
 * Subscribe to theme changes
 */
export function subscribeToTheme(callback: (theme: Theme) => void): () => void {
  return themeSignal.subscribe(callback);
}

/**
 * Create a ThemeProvider component
 */
export function createThemeProvider() {
  // This will be implemented when we have proper component integration
  // For now, theme is global via signals
  return null;
}
