/**
 * Tests for core CSS-in-JS engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { css, cssWithProps, cx, processStyleInput } from '../core/engine';
import { styleCache } from '../core/cache';
import { resetCounter } from '../core/hash';
import { clearStyles, resetStyleElement } from '../core/sheet';

describe('engine', () => {
  beforeEach(() => {
    styleCache.clear();
    resetCounter();
    clearStyles();
    resetStyleElement();
  });

  describe('processStyleInput', () => {
    it('should process CSS object', () => {
      const result = processStyleInput({ color: 'red', fontSize: 16 });
      expect(result).toContain('color:red');
      expect(result).toContain('font-size:16px');
    });

    it('should process string CSS', () => {
      const result = processStyleInput('color: red;');
      expect(result).toBe('color: red;');
    });

    it('should process style function', () => {
      const styleFn = (props: { color: string }) => ({ color: props.color });
      const result = processStyleInput(styleFn, { color: 'blue' });
      expect(result).toContain('color:blue');
    });

    it('should process array of styles', () => {
      const result = processStyleInput([
        { color: 'red' },
        { fontSize: 16 },
      ]);
      expect(result).toContain('color:red');
      expect(result).toContain('font-size:16px');
    });

    it('should handle nested arrays', () => {
      const result = processStyleInput([
        { color: 'red' },
        [{ fontSize: 16 }, { padding: 10 }],
      ]);
      expect(result).toContain('color:red');
      expect(result).toContain('font-size:16px');
      expect(result).toContain('padding:10px');
    });

    it('should handle functions in arrays', () => {
      const result = processStyleInput(
        [
          { color: 'red' },
          (props: { size: number }) => ({ fontSize: props.size }),
        ],
        { size: 20 }
      );
      expect(result).toContain('color:red');
      expect(result).toContain('font-size:20px');
    });
  });

  describe('css', () => {
    it('should generate class name from CSS object', () => {
      const className = css({ color: 'red' });
      expect(className).toMatch(/^q-/);
    });

    it('should generate class name from CSS string', () => {
      const className = css('color: red;');
      expect(className).toMatch(/^q-/);
    });

    it('should cache identical styles', () => {
      const class1 = css({ color: 'red' });
      const class2 = css({ color: 'red' });
      expect(class1).toBe(class2);
    });

    it('should generate different classes for different styles', () => {
      const class1 = css({ color: 'red' });
      const class2 = css({ color: 'blue' });
      expect(class1).not.toBe(class2);
    });

    it('should handle template literal syntax', () => {
      const color = 'red';
      const className = css`
        color: ${color};
        font-size: 16px;
      ` as any;
      expect(className).toMatch(/^q-/);
    });

    it('should minify CSS before hashing', () => {
      const class1 = css('color:red;');
      const class2 = css('color: red;');
      const class3 = css('  color  :  red  ;  ');
      expect(class1).toBe(class2);
      expect(class2).toBe(class3);
    });
  });

  describe('cssWithProps', () => {
    it('should generate class with props', () => {
      const styleFn = (props: { color: string }) => ({ color: props.color });
      const className = cssWithProps(styleFn, { color: 'blue' });
      expect(className).toMatch(/^q-/);
    });

    it('should handle static styles', () => {
      const className = cssWithProps({ color: 'red' }, {});
      expect(className).toMatch(/^q-/);
    });
  });

  describe('cx', () => {
    it('should combine class names', () => {
      const result = cx('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should filter out falsy values', () => {
      const result = cx('class1', undefined, 'class2', null, 'class3', false);
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle empty input', () => {
      const result = cx();
      expect(result).toBe('');
    });

    it('should handle all falsy values', () => {
      const result = cx(undefined, null, false);
      expect(result).toBe('');
    });
  });
});
