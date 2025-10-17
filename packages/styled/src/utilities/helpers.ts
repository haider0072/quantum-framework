/**
 * CSS utility helpers
 */

/**
 * Create media query helper
 */
export function media(breakpoint: string, styles: string): string {
  return `@media(min-width:${breakpoint}){${styles}}`;
}

/**
 * Create hover styles
 */
export function hover(styles: string): string {
  return `&:hover{${styles}}`;
}

/**
 * Create focus styles
 */
export function focus(styles: string): string {
  return `&:focus{${styles}}`;
}

/**
 * Create active styles
 */
export function active(styles: string): string {
  return `&:active{${styles}}`;
}

/**
 * Create pseudo-element styles
 */
export function before(styles: string): string {
  return `&::before{${styles}}`;
}

export function after(styles: string): string {
  return `&::after{${styles}}`;
}

/**
 * Create CSS variable
 */
export function cssVar(name: string, fallback?: string): string {
  return fallback ? `var(--${name},${fallback})` : `var(--${name})`;
}

/**
 * Rgba helper
 */
export function rgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * Create transition shorthand
 */
export function transition(
  property: string = 'all',
  duration: string = '0.3s',
  timing: string = 'ease',
  delay: string = '0s'
): string {
  return `${property} ${duration} ${timing} ${delay}`;
}
