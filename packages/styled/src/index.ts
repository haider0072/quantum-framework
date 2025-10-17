/**
 * Quantum Styled - CSS-in-JS styling solution
 * @packageDocumentation
 */

// Export types
export type {
  CSSProperties,
  Theme,
  DefaultTheme,
  StyledProps,
  StyleFunction,
  StyleInput,
  CSSRule,
  Keyframes,
  AnimationConfig,
  StyledComponent,
  StyledFactory,
  GlobalStylesConfig,
  StyleCache,
} from './types';

// Export core engine
export { css, cssWithProps, cx } from './core/engine';

// Export styled component factory
export { styled } from './styled/index';

// Export theme utilities
export { getTheme, setTheme, updateTheme } from './theme/context';
export { createTheme, createThemeGetter } from './theme/helpers';

// Export utilities
export { styleCache } from './core/cache';
export { getStyles, clearStyles } from './core/sheet';
export { keyframes, animation } from './utilities/keyframes';
export { createGlobalStyles, applyResetStyles } from './utilities/global';
export {
  media,
  hover,
  focus,
  active,
  before,
  after,
  cssVar,
  rgba,
  transition,
} from './utilities/helpers';

// Version
export const version = '0.0.1';
