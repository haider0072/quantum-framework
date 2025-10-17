/**
 * Tests for state serialization
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@quantum/reactivity';
import {
  serializeState,
  deserializeState,
  injectState,
  safeJSONStringify,
} from '../src/serialization';

describe('Serialization', () => {
  describe('serializeState', () => {
    it('should serialize signals with primitive values', () => {
      const count = signal(42);
      const name = signal('Alice');
      const active = signal(true);

      const signals = new Map([
        ['s1', count],
        ['s2', name],
        ['s3', active],
      ]);

      const serialized = serializeState(signals);
      const state = JSON.parse(serialized);

      expect(state.s1).toBe(42);
      expect(state.s2).toBe('Alice');
      expect(state.s3).toBe(true);
    });

    it('should serialize signals with objects', () => {
      const user = signal({ name: 'Bob', age: 25 });

      const signals = new Map([['s1', user]]);

      const serialized = serializeState(signals);
      const state = JSON.parse(serialized);

      expect(state.s1).toEqual({ name: 'Bob', age: 25 });
    });

    it('should serialize signals with arrays', () => {
      const items = signal([1, 2, 3, 4, 5]);

      const signals = new Map([['s1', items]]);

      const serialized = serializeState(signals);
      const state = JSON.parse(serialized);

      expect(state.s1).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle Date values', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const timestamp = signal(date);

      const signals = new Map([['s1', timestamp]]);

      const serialized = serializeState(signals);
      const state = JSON.parse(serialized);

      expect(state.s1.__type).toBe('date');
      expect(state.s1.__value).toBe(date.toISOString());
    });

    it('should handle Map values', () => {
      const map = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]);
      const data = signal(map);

      const signals = new Map([['s1', data]]);

      const serialized = serializeState(signals);
      const state = JSON.parse(serialized);

      expect(state.s1.__type).toBe('map');
      expect(state.s1.__value).toEqual([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]);
    });

    it('should handle Set values', () => {
      const set = new Set([1, 2, 3]);
      const data = signal(set);

      const signals = new Map([['s1', data]]);

      const serialized = serializeState(signals);
      const state = JSON.parse(serialized);

      expect(state.s1.__type).toBe('set');
      expect(state.s1.__value).toEqual([1, 2, 3]);
    });

    it('should handle nested objects', () => {
      const data = signal({
        user: {
          name: 'Alice',
          preferences: {
            theme: 'dark',
            notifications: true,
          },
        },
      });

      const signals = new Map([['s1', data]]);

      const serialized = serializeState(signals);
      const state = JSON.parse(serialized);

      expect(state.s1.user.name).toBe('Alice');
      expect(state.s1.user.preferences.theme).toBe('dark');
      expect(state.s1.user.preferences.notifications).toBe(true);
    });
  });

  describe('deserializeState', () => {
    it('should deserialize primitive values', () => {
      const serialized = JSON.stringify({
        s1: 42,
        s2: 'Alice',
        s3: true,
      });

      const state = deserializeState(serialized);

      expect(state.get('s1')).toBe(42);
      expect(state.get('s2')).toBe('Alice');
      expect(state.get('s3')).toBe(true);
    });

    it('should deserialize Date values', () => {
      const dateString = '2024-01-01T00:00:00.000Z';
      const serialized = JSON.stringify({
        s1: {
          __type: 'date',
          __value: dateString,
        },
      });

      const state = deserializeState(serialized);
      const date = state.get('s1');

      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe(dateString);
    });

    it('should deserialize Map values', () => {
      const serialized = JSON.stringify({
        s1: {
          __type: 'map',
          __value: [
            ['key1', 'value1'],
            ['key2', 'value2'],
          ],
        },
      });

      const state = deserializeState(serialized);
      const map = state.get('s1');

      expect(map).toBeInstanceOf(Map);
      expect(map.get('key1')).toBe('value1');
      expect(map.get('key2')).toBe('value2');
    });

    it('should deserialize Set values', () => {
      const serialized = JSON.stringify({
        s1: {
          __type: 'set',
          __value: [1, 2, 3],
        },
      });

      const state = deserializeState(serialized);
      const set = state.get('s1');

      expect(set).toBeInstanceOf(Set);
      expect(set.has(1)).toBe(true);
      expect(set.has(2)).toBe(true);
      expect(set.has(3)).toBe(true);
    });

    it('should handle invalid JSON gracefully', () => {
      const serialized = 'invalid json {';

      const state = deserializeState(serialized);

      expect(state.size).toBe(0);
    });
  });

  describe('injectState', () => {
    it('should inject state before </body>', () => {
      const html = '<html><body><div>Content</div></body></html>';
      const state = JSON.stringify({ s1: 42 });

      const result = injectState(html, state);

      expect(result).toContain('<script id="__QUANTUM_STATE__"');
      expect(result).toContain('{"s1":42}');
      expect(result.indexOf('</script>')).toBeLessThan(
        result.indexOf('</body>')
      );
    });

    it('should escape dangerous characters in state', () => {
      const html = '<html><body></body></html>';
      const state = JSON.stringify({ xss: '<script>alert("xss")</script>' });

      const result = injectState(html, state);

      expect(result).not.toContain('<script>alert');
      expect(result).toContain('\\u003cscript\\u003e');
    });

    it('should inject before </html> if no </body>', () => {
      const html = '<html><div>Content</div></html>';
      const state = JSON.stringify({ s1: 42 });

      const result = injectState(html, state);

      expect(result).toContain('<script id="__QUANTUM_STATE__"');
      expect(result.indexOf('</script>')).toBeLessThan(
        result.indexOf('</html>')
      );
    });

    it('should append if no closing tags', () => {
      const html = '<div>Content</div>';
      const state = JSON.stringify({ s1: 42 });

      const result = injectState(html, state);

      expect(result).toContain('<script id="__QUANTUM_STATE__"');
      expect(result).toContain('</script>');
    });
  });

  describe('safeJSONStringify', () => {
    it('should escape < and > characters', () => {
      const obj = { html: '<div>Test</div>' };

      const result = safeJSONStringify(obj);

      expect(result).not.toContain('<div>');
      expect(result).toContain('\\u003cdiv\\u003e');
    });

    it('should escape & character', () => {
      const obj = { text: 'A & B' };

      const result = safeJSONStringify(obj);

      expect(result).toContain('\\u0026');
    });

    it('should handle line separators', () => {
      const obj = { text: 'Line\u2028Separator' };

      const result = safeJSONStringify(obj);

      expect(result).toContain('\\u2028');
    });
  });

  describe('Roundtrip serialization', () => {
    it('should correctly roundtrip primitive values', () => {
      const original = new Map([
        ['s1', signal(42)],
        ['s2', signal('Alice')],
        ['s3', signal(true)],
      ]);

      const serialized = serializeState(original);
      const deserialized = deserializeState(serialized);

      expect(deserialized.get('s1')).toBe(42);
      expect(deserialized.get('s2')).toBe('Alice');
      expect(deserialized.get('s3')).toBe(true);
    });

    it('should correctly roundtrip complex objects', () => {
      const original = new Map([
        [
          's1',
          signal({
            user: { name: 'Bob', age: 30 },
            items: [1, 2, 3],
            active: true,
          }),
        ],
      ]);

      const serialized = serializeState(original);
      const deserialized = deserializeState(serialized);

      const value = deserialized.get('s1');
      expect(value.user.name).toBe('Bob');
      expect(value.user.age).toBe(30);
      expect(value.items).toEqual([1, 2, 3]);
      expect(value.active).toBe(true);
    });
  });
});
