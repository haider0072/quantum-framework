/**
 * Tests for CSS utilities
 */

import { describe, it, expect } from 'vitest';
import {
  camelToKebab,
  valueToString,
  cssPropertiesToString,
  createCSSRule,
  parseTemplateLiteral,
  minifyCSS,
} from '../core/css';

describe('css utilities', () => {
  describe('camelToKebab', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(camelToKebab('backgroundColor')).toBe('background-color');
      expect(camelToKebab('fontSize')).toBe('font-size');
      expect(camelToKebab('zIndex')).toBe('z-index');
    });

    it('should handle single words', () => {
      expect(camelToKebab('color')).toBe('color');
      expect(camelToKebab('display')).toBe('display');
    });

    it('should handle multiple capitals', () => {
      expect(camelToKebab('WebkitTransform')).toBe('-webkit-transform');
    });
  });

  describe('valueToString', () => {
    it('should convert numbers to px strings', () => {
      expect(valueToString(10)).toBe('10px');
      expect(valueToString(100)).toBe('100px');
    });

    it('should handle zero without units', () => {
      expect(valueToString(0)).toBe('0');
    });

    it('should pass strings through', () => {
      expect(valueToString('red')).toBe('red');
      expect(valueToString('10em')).toBe('10em');
    });
  });

  describe('cssPropertiesToString', () => {
    it('should convert CSS object to string', () => {
      const css = cssPropertiesToString({
        color: 'red',
        fontSize: 16,
      });
      expect(css).toContain('color:red');
      expect(css).toContain('font-size:16px');
    });

    it('should handle empty objects', () => {
      expect(cssPropertiesToString({})).toBe('');
    });

    it('should skip undefined values', () => {
      const css = cssPropertiesToString({
        color: 'red',
        fontSize: undefined,
      });
      expect(css).toBe('color:red');
    });

    it('should skip null values', () => {
      const css = cssPropertiesToString({
        color: 'red',
        fontSize: null as any,
      });
      expect(css).toBe('color:red');
    });
  });

  describe('createCSSRule', () => {
    it('should create rule from CSS object', () => {
      const rule = createCSSRule('.test', { color: 'red' });
      expect(rule).toBe('.test{color:red}');
    });

    it('should create rule from CSS string', () => {
      const rule = createCSSRule('.test', 'color:red;font-size:16px');
      expect(rule).toBe('.test{color:red;font-size:16px}');
    });

    it('should return empty string for empty CSS', () => {
      expect(createCSSRule('.test', {})).toBe('');
      expect(createCSSRule('.test', '')).toBe('');
    });
  });

  describe('parseTemplateLiteral', () => {
    it('should parse template literal with interpolations', () => {
      const strings = ['color: ', '; font-size: ', 'px;'] as any;
      strings.raw = strings;
      const result = parseTemplateLiteral(strings, ['red', 16]);
      expect(result).toBe('color: red; font-size: 16px;');
    });

    it('should handle no interpolations', () => {
      const strings = ['color: red;'] as any;
      strings.raw = strings;
      const result = parseTemplateLiteral(strings, []);
      expect(result).toBe('color: red;');
    });

    it('should handle multiple interpolations', () => {
      const strings = ['a', 'b', 'c', 'd'] as any;
      strings.raw = strings;
      const result = parseTemplateLiteral(strings, [1, 2, 3]);
      expect(result).toBe('a1b2c3d');
    });
  });

  describe('minifyCSS', () => {
    it('should remove extra whitespace', () => {
      const css = 'color:  red;  font-size:  16px;';
      expect(minifyCSS(css)).toBe('color:red;font-size:16px;');
    });

    it('should remove whitespace around punctuation', () => {
      const css = 'color : red ; font-size : 16px ;';
      expect(minifyCSS(css)).toBe('color:red;font-size:16px;');
    });

    it('should handle newlines', () => {
      const css = `
        color: red;
        font-size: 16px;
      `;
      expect(minifyCSS(css)).toBe('color:red;font-size:16px;');
    });
  });
});
