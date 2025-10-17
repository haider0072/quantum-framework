/**
 * Tests for server-side rendering
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { signal, computed } from '@quantum/reactivity';
import {
  renderToString,
  renderToStaticMarkup,
  renderToStringWithState,
  isSSR,
  clearCollectedSignals,
} from '../src/server-renderer';

describe('Server Renderer', () => {
  beforeEach(() => {
    clearCollectedSignals();
  });

  afterEach(() => {
    clearCollectedSignals();
  });

  describe('renderToString', () => {
    it('should render simple HTML elements', () => {
      const element = {
        type: 'div',
        props: { children: 'Hello, World!' },
      };

      const html = renderToString(element);

      expect(html).toContain('<div');
      expect(html).toContain('Hello, World!');
      expect(html).toContain('</div>');
    });

    it('should render nested elements', () => {
      const element = {
        type: 'div',
        props: {
          children: {
            type: 'p',
            props: { children: 'Nested content' },
          },
        },
      };

      const html = renderToString(element);

      expect(html).toContain('<div');
      expect(html).toContain('<p');
      expect(html).toContain('Nested content');
      expect(html).toContain('</p>');
      expect(html).toContain('</div>');
    });

    it('should escape HTML special characters', () => {
      const element = {
        type: 'div',
        props: { children: '<script>alert("xss")</script>' },
      };

      const html = renderToString(element);

      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should render attributes', () => {
      const element = {
        type: 'div',
        props: {
          id: 'test',
          className: 'container',
          children: 'Content',
        },
      };

      const html = renderToString(element);

      expect(html).toContain('id="test"');
      expect(html).toContain('class="container"');
    });

    it('should handle boolean attributes', () => {
      const element = {
        type: 'input',
        props: {
          type: 'checkbox',
          checked: true,
          disabled: false,
        },
      };

      const html = renderToString(element);

      expect(html).toContain('checked');
      expect(html).not.toContain('disabled');
    });

    it('should skip event handlers', () => {
      const element = {
        type: 'button',
        props: {
          onClick: () => {},
          children: 'Click me',
        },
      };

      const html = renderToString(element);

      expect(html).not.toContain('onClick');
      expect(html).toContain('Click me');
    });

    it('should render style objects', () => {
      const element = {
        type: 'div',
        props: {
          style: {
            color: 'red',
            fontSize: '16px',
            backgroundColor: 'blue',
          },
          children: 'Styled',
        },
      };

      const html = renderToString(element);

      expect(html).toContain('style=');
      expect(html).toContain('color:red');
      expect(html).toContain('font-size:16px');
      expect(html).toContain('background-color:blue');
    });

    it('should render signals', () => {
      const count = signal(42);

      const element = {
        type: 'div',
        props: { children: count },
      };

      const html = renderToString(element);

      expect(html).toContain('42');
    });

    it('should render computed values', () => {
      const count = signal(5);
      const doubled = computed(() => count() * 2);

      const element = {
        type: 'div',
        props: { children: doubled },
      };

      const html = renderToString(element);

      expect(html).toContain('10');
    });

    it('should render arrays of elements', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];

      const element = {
        type: 'ul',
        props: {
          children: items.map(item => ({
            type: 'li',
            props: { children: item },
          })),
        },
      };

      const html = renderToString(element);

      expect(html).toContain('Item 1');
      expect(html).toContain('Item 2');
      expect(html).toContain('Item 3');
    });

    it('should handle self-closing tags', () => {
      const element = {
        type: 'img',
        props: {
          src: '/image.jpg',
          alt: 'Test image',
        },
      };

      const html = renderToString(element);

      expect(html).toContain('<img');
      expect(html).toContain('/>');
      expect(html).not.toContain('</img>');
    });

    it('should include hydration markers by default', () => {
      const element = {
        type: 'div',
        props: { children: 'Content' },
      };

      const html = renderToString(element);

      expect(html).toContain('data-quantum-ssr');
    });

    it('should set isSSR() to true during rendering', () => {
      let ssrStatus = false;

      const Component = () => {
        ssrStatus = isSSR();
        return { type: 'div', props: { children: 'Test' } };
      };

      const element = { type: Component, props: {} };
      renderToString(element);

      expect(ssrStatus).toBe(true);
    });

    it('should set isSSR() to false after rendering', () => {
      const element = {
        type: 'div',
        props: { children: 'Test' },
      };

      renderToString(element);

      expect(isSSR()).toBe(false);
    });
  });

  describe('renderToStaticMarkup', () => {
    it('should not include hydration markers', () => {
      const element = {
        type: 'div',
        props: { children: 'Content' },
      };

      const html = renderToStaticMarkup(element);

      expect(html).not.toContain('data-quantum-ssr');
      expect(html).toContain('Content');
    });
  });

  describe('renderToStringWithState', () => {
    it('should return HTML and serialized state', () => {
      const count = signal(42);

      const element = {
        type: 'div',
        props: { children: count },
      };

      const result = renderToStringWithState(element);

      expect(result.html).toContain('42');
      expect(result.state).toBeTruthy();
      expect(typeof result.state).toBe('string');
    });

    it('should serialize signal values', () => {
      const name = signal('Alice');
      const age = signal(30);

      const element = {
        type: 'div',
        props: {
          children: [
            { type: 'span', props: { children: name } },
            { type: 'span', props: { children: age } },
          ],
        },
      };

      const result = renderToStringWithState(element);
      const state = JSON.parse(result.state);

      // State should contain the signal values
      expect(Object.values(state)).toContain('Alice');
      expect(Object.values(state)).toContain(30);
    });
  });

  describe('Fragment rendering', () => {
    it('should render fragments without wrapper', () => {
      const fragment = {
        type: Symbol.for('quantum.fragment'),
        props: {
          children: [
            { type: 'div', props: { children: 'First' } },
            { type: 'div', props: { children: 'Second' } },
          ],
        },
      };

      const html = renderToString(fragment);

      expect(html).toContain('First');
      expect(html).toContain('Second');
      // Should not have a wrapper element
      expect(html).not.toMatch(/<[^>]*fragment[^>]*>/);
    });
  });

  describe('Function components', () => {
    it('should render function components', () => {
      const Greeting = ({ name }: { name: string }) => ({
        type: 'div',
        props: { children: `Hello, ${name}!` },
      });

      const element = {
        type: Greeting,
        props: { name: 'World' },
      };

      const html = renderToString(element);

      expect(html).toContain('Hello, World!');
    });

    it('should render nested function components', () => {
      const Inner = () => ({
        type: 'span',
        props: { children: 'Inner' },
      });

      const Outer = () => ({
        type: 'div',
        props: { children: { type: Inner, props: {} } },
      });

      const element = {
        type: Outer,
        props: {},
      };

      const html = renderToString(element);

      expect(html).toContain('<div');
      expect(html).toContain('<span');
      expect(html).toContain('Inner');
    });
  });

  describe('Error handling', () => {
    it('should handle rendering errors', () => {
      const BrokenComponent = () => {
        throw new Error('Component error');
      };

      const element = {
        type: BrokenComponent,
        props: {},
      };

      expect(() => renderToString(element)).toThrow('Component error');
    });

    it('should call onError callback', () => {
      const errors: Error[] = [];

      const BrokenComponent = () => {
        throw new Error('Component error');
      };

      const element = {
        type: BrokenComponent,
        props: {},
      };

      try {
        renderToString(element, {
          onError: (error) => errors.push(error),
        });
      } catch (e) {
        // Expected
      }

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Component error');
    });
  });
});
