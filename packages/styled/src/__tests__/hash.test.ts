/**
 * Tests for hash utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  hashString,
  generateClassName,
  generateHashedClassName,
  resetCounter,
} from '../core/hash';

describe('hash', () => {
  describe('hashString', () => {
    it('should generate consistent hashes', () => {
      const hash1 = hashString('test');
      const hash2 = hashString('test');
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = hashString('test1');
      const hash2 = hashString('test2');
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty strings', () => {
      const hash = hashString('');
      expect(hash).toBe('0');
    });

    it('should handle unicode characters', () => {
      const hash = hashString('🎨 hello');
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('generateClassName', () => {
    beforeEach(() => {
      resetCounter();
    });

    it('should generate unique class names', () => {
      const class1 = generateClassName();
      const class2 = generateClassName();
      expect(class1).not.toBe(class2);
    });

    it('should use default prefix', () => {
      const className = generateClassName();
      expect(className).toMatch(/^q-/);
    });

    it('should use custom prefix', () => {
      const className = generateClassName('custom');
      expect(className).toMatch(/^custom-/);
    });

    it('should generate sequential names', () => {
      const class1 = generateClassName();
      const class2 = generateClassName();
      const class3 = generateClassName();
      expect(class1).toBe('q-0');
      expect(class2).toBe('q-1');
      expect(class3).toBe('q-2');
    });
  });

  describe('generateHashedClassName', () => {
    it('should generate consistent class names for same content', () => {
      const class1 = generateHashedClassName('color:red');
      const class2 = generateHashedClassName('color:red');
      expect(class1).toBe(class2);
    });

    it('should generate different class names for different content', () => {
      const class1 = generateHashedClassName('color:red');
      const class2 = generateHashedClassName('color:blue');
      expect(class1).not.toBe(class2);
    });

    it('should use default prefix', () => {
      const className = generateHashedClassName('test');
      expect(className).toMatch(/^q-/);
    });

    it('should use custom prefix', () => {
      const className = generateHashedClassName('test', 'custom');
      expect(className).toMatch(/^custom-/);
    });
  });

  describe('resetCounter', () => {
    it('should reset the counter', () => {
      generateClassName(); // 0
      generateClassName(); // 1
      resetCounter();
      const className = generateClassName(); // 0 again
      expect(className).toBe('q-0');
    });
  });
});
