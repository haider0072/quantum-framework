/**
 * Basic test to verify test setup
 */

import { describe, it, expect } from 'vitest';
import { version } from '../index';

describe('Setup', () => {
  it('should export version', () => {
    expect(version).toBe('0.0.1');
  });

  it('should have working test environment', () => {
    expect(true).toBe(true);
  });
});
