/**
 * Tests for style cache
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { styleCache } from '../core/cache';

describe('cache', () => {
  beforeEach(() => {
    styleCache.clear();
  });

  describe('styleCache', () => {
    it('should store and retrieve values', () => {
      styleCache.set('key1', 'value1');
      expect(styleCache.get('key1')).toBe('value1');
    });

    it('should return undefined for missing keys', () => {
      expect(styleCache.get('nonexistent')).toBeUndefined();
    });

    it('should check if key exists', () => {
      styleCache.set('key1', 'value1');
      expect(styleCache.has('key1')).toBe(true);
      expect(styleCache.has('key2')).toBe(false);
    });

    it('should track size', () => {
      expect(styleCache.size).toBe(0);
      styleCache.set('key1', 'value1');
      expect(styleCache.size).toBe(1);
      styleCache.set('key2', 'value2');
      expect(styleCache.size).toBe(2);
    });

    it('should clear all entries', () => {
      styleCache.set('key1', 'value1');
      styleCache.set('key2', 'value2');
      expect(styleCache.size).toBe(2);

      styleCache.clear();
      expect(styleCache.size).toBe(0);
      expect(styleCache.get('key1')).toBeUndefined();
    });

    it('should overwrite existing keys', () => {
      styleCache.set('key1', 'value1');
      styleCache.set('key1', 'value2');
      expect(styleCache.get('key1')).toBe('value2');
      expect(styleCache.size).toBe(1);
    });
  });
});
