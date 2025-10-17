/**
 * Theme helper utilities
 */

import type { Theme } from '../types';

/**
 * Get a nested value from theme by path
 * Example: theme('colors.primary') or theme('spacing.md')
 */
export function createThemeGetter<T extends Theme = Theme>(theme: T) {
  return function get(path: string, fallback?: any): any {
    const keys = path.split('.');
    let value: any = theme;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return fallback;
      }
    }

    return value !== undefined ? value : fallback;
  };
}

/**
 * Create a default theme with common values
 */
export function createTheme<T extends Theme = Theme>(theme: T): T {
  return {
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      success: '#28a745',
      danger: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8',
      light: '#f8f9fa',
      dark: '#343a40',
      white: '#ffffff',
      black: '#000000',
      ...(theme.colors || {}),
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      ...(theme.spacing || {}),
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      ...(theme.breakpoints || {}),
    },
    typography: {
      fontFamily: {
        sans: 'system-ui, -apple-system, sans-serif',
        serif: 'Georgia, serif',
        mono: 'Menlo, Monaco, monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      ...(theme.typography || {}),
    },
    ...theme,
  } as T;
}
