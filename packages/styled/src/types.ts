/**
 * Type definitions for Quantum Styled
 */

/**
 * CSS properties type (subset for now, can be expanded)
 */
export interface CSSProperties {
  // Layout
  display?: string;
  position?: string;
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;

  // Flexbox
  flex?: string | number;
  flexDirection?: string;
  flexWrap?: string;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string | number;
  justifyContent?: string;
  alignItems?: string;
  alignContent?: string;
  alignSelf?: string;
  order?: number;
  gap?: string | number;

  // Grid
  grid?: string;
  gridTemplate?: string;
  gridTemplateRows?: string;
  gridTemplateColumns?: string;
  gridTemplateAreas?: string;
  gridArea?: string;
  gridRow?: string;
  gridColumn?: string;
  gridGap?: string | number;

  // Spacing
  margin?: string | number;
  marginTop?: string | number;
  marginRight?: string | number;
  marginBottom?: string | number;
  marginLeft?: string | number;
  padding?: string | number;
  paddingTop?: string | number;
  paddingRight?: string | number;
  paddingBottom?: string | number;
  paddingLeft?: string | number;

  // Typography
  fontSize?: string | number;
  fontFamily?: string;
  fontWeight?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  textAlign?: string;
  textDecoration?: string;
  textTransform?: string;

  // Colors
  color?: string;
  backgroundColor?: string;
  opacity?: number;

  // Borders
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRadius?: string | number;
  borderWidth?: string | number;
  borderStyle?: string;
  borderColor?: string;

  // Effects
  boxShadow?: string;
  textShadow?: string;
  transform?: string;
  transition?: string;
  animation?: string;

  // Other
  cursor?: string;
  overflow?: string;
  overflowX?: string;
  overflowY?: string;
  zIndex?: number;
  outline?: string;

  // Allow any CSS property
  [key: string]: any;
}

/**
 * Theme definition
 */
export interface Theme {
  colors?: Record<string, string>;
  spacing?: Record<string, string | number>;
  breakpoints?: Record<string, string>;
  typography?: Record<string, any>;
  [key: string]: any;
}

/**
 * Default theme type
 */
export interface DefaultTheme extends Theme {}

/**
 * Styled component props with theme
 */
export interface StyledProps<T = any> {
  theme?: T;
  as?: string | ((props: any) => any);
  className?: string;
  [key: string]: any;
}

/**
 * Style function that accepts props and returns CSS
 */
export type StyleFunction<P = any, T extends Theme = DefaultTheme> = (
  props: P & { theme: T }
) => CSSProperties | string;

/**
 * Style input can be CSS object, string, or function
 */
export type StyleInput<P = any, T extends Theme = DefaultTheme> =
  | CSSProperties
  | string
  | StyleFunction<P, T>
  | Array<StyleInput<P, T>>;

/**
 * CSS rule definition
 */
export interface CSSRule {
  selector: string;
  styles: string;
}

/**
 * Keyframes definition
 */
export interface Keyframes {
  name: string;
  styles: string;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration?: string | number;
  timingFunction?: string;
  delay?: string | number;
  iterationCount?: string | number;
  direction?: string;
  fillMode?: string;
}

/**
 * Styled component type
 */
export type StyledComponent<P = any> = ((props: P & StyledProps) => any) & {
  displayName?: string;
  className?: string;
};

/**
 * Styled factory type
 */
export type StyledFactory = {
  <P = {}>(styles: StyleInput<P>): StyledComponent<P>;
  <P = {}>(
    strings: TemplateStringsArray,
    ...interpolations: Array<StyleInput<P>>
  ): StyledComponent<P>;
};

/**
 * Global styles configuration
 */
export interface GlobalStylesConfig {
  reset?: boolean;
  styles?: CSSProperties | string;
}

/**
 * CSS class cache
 */
export interface StyleCache {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  clear(): void;
}
