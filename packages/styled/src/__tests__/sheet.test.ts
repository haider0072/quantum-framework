/**
 * Tests for style sheet management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getStyleElement,
  injectCSS,
  clearStyles,
  getStyles,
  resetStyleElement,
} from '../core/sheet';

describe('sheet', () => {
  beforeEach(() => {
    // Clean up any existing style elements
    const existing = document.querySelector('style[data-quantum-styled]');
    if (existing) {
      existing.remove();
    }
    resetStyleElement();
  });

  afterEach(() => {
    resetStyleElement();
  });

  describe('getStyleElement', () => {
    it('should create a style element', () => {
      const element = getStyleElement();
      expect(element).toBeDefined();
      expect(element.tagName).toBe('STYLE');
    });

    it('should add data attribute', () => {
      const element = getStyleElement();
      expect(element.getAttribute('data-quantum-styled')).toBe('');
    });

    it('should append to document head', () => {
      const element = getStyleElement();
      expect(document.head.contains(element)).toBe(true);
    });

    it('should reuse existing element', () => {
      const element1 = getStyleElement();
      const element2 = getStyleElement();
      expect(element1).toBe(element2);
    });

    it('should find existing element after reset', () => {
      const element1 = getStyleElement();
      resetStyleElement();
      const element2 = getStyleElement();
      expect(element2).toBe(element1);
    });
  });

  describe('injectCSS', () => {
    it('should inject CSS into style element', () => {
      injectCSS('.test{color:red}');
      const element = getStyleElement();
      expect(element.textContent).toContain('.test{color:red}');
    });

    it('should inject multiple rules', () => {
      injectCSS('.test1{color:red}');
      injectCSS('.test2{color:blue}');
      const element = getStyleElement();
      expect(element.textContent).toContain('.test1{color:red}');
      expect(element.textContent).toContain('.test2{color:blue}');
    });
  });

  describe('clearStyles', () => {
    it('should clear all styles', () => {
      injectCSS('.test{color:red}');
      clearStyles();
      const element = getStyleElement();
      expect(element.textContent).toBe('');
    });

    it('should handle clearing when no styles exist', () => {
      expect(() => clearStyles()).not.toThrow();
    });
  });

  describe('getStyles', () => {
    it('should return injected styles', () => {
      injectCSS('.test{color:red}');
      const styles = getStyles();
      expect(styles).toContain('.test{color:red}');
    });

    it('should return empty string when no styles', () => {
      const styles = getStyles();
      expect(styles).toBe('');
    });
  });
});
