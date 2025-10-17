/**
 * Hash generation for CSS class names
 */

let counter = 0;

/**
 * Simple hash function for generating unique class names
 */
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate a unique class name with optional prefix
 */
export function generateClassName(prefix = 'q'): string {
  const id = (counter++).toString(36);
  return `${prefix}-${id}`;
}

/**
 * Generate a class name based on content hash
 */
export function generateHashedClassName(content: string, prefix = 'q'): string {
  const hash = hashString(content);
  return `${prefix}-${hash}`;
}

/**
 * Reset the counter (useful for testing)
 */
export function resetCounter(): void {
  counter = 0;
}
