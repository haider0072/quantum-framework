import { describe, it, expect } from 'vitest';
import { pathToRegex, matchRoute, parseQuery, normalizePath, resolvePath } from '../src/matcher';
import type { RouteConfig } from '../src/types';

describe('matcher', () => {
  describe('pathToRegex', () => {
    it('should convert simple path to regex', () => {
      const { regex, keys } = pathToRegex('/home');
      expect(regex.test('/home')).toBe(true);
      expect(regex.test('/about')).toBe(false);
      expect(keys).toEqual([]);
    });

    it('should handle path params', () => {
      const { regex, keys } = pathToRegex('/user/:id');
      expect(regex.test('/user/123')).toBe(true);
      expect(regex.test('/user/')).toBe(false);
      expect(keys).toEqual(['id']);
    });

    it('should handle multiple params', () => {
      const { regex, keys } = pathToRegex('/user/:userId/post/:postId');
      expect(regex.test('/user/1/post/2')).toBe(true);
      expect(keys).toEqual(['userId', 'postId']);
    });

    it('should handle wildcard', () => {
      const { regex } = pathToRegex('/docs/*');
      expect(regex.test('/docs/guide')).toBe(true);
      expect(regex.test('/docs/api/reference')).toBe(true);
    });
  });

  describe('matchRoute', () => {
    const routes: RouteConfig[] = [
      { path: '/', name: 'home' },
      { path: '/about', name: 'about' },
      { path: '/user/:id', name: 'user' },
      {
        path: '/admin',
        name: 'admin',
        children: [
          { path: '/dashboard', name: 'admin-dashboard' },
          { path: '/users', name: 'admin-users' },
        ],
      },
    ];

    it('should match simple routes', () => {
      const match = matchRoute('/', routes);
      expect(match).not.toBeNull();
      expect(match?.matched[0].name).toBe('home');
    });

    it('should match parameterized routes', () => {
      const match = matchRoute('/user/123', routes);
      expect(match).not.toBeNull();
      expect(match?.matched[0].name).toBe('user');
      expect(match?.params).toEqual({ id: '123' });
    });

    it('should match nested routes', () => {
      const match = matchRoute('/admin/dashboard', routes);
      expect(match).not.toBeNull();
      expect(match?.matched.length).toBe(2);
      expect(match?.matched[0].name).toBe('admin');
      expect(match?.matched[1].name).toBe('admin-dashboard');
    });

    it('should return null for unmatched routes', () => {
      const match = matchRoute('/nonexistent', routes);
      expect(match).toBeNull();
    });
  });

  describe('parseQuery', () => {
    it('should parse query string', () => {
      const query = parseQuery('?foo=bar&baz=qux');
      expect(query).toEqual({ foo: 'bar', baz: 'qux' });
    });

    it('should handle empty query', () => {
      const query = parseQuery('');
      expect(query).toEqual({});
    });

    it('should handle special characters', () => {
      const query = parseQuery('?name=John%20Doe');
      expect(query).toEqual({ name: 'John Doe' });
    });
  });

  describe('normalizePath', () => {
    it('should remove trailing slash', () => {
      expect(normalizePath('/home/')).toBe('/home');
    });

    it('should keep root slash', () => {
      expect(normalizePath('/')).toBe('/');
    });

    it('should add base path', () => {
      expect(normalizePath('/home', '/app')).toBe('/app/home');
    });
  });

  describe('resolvePath', () => {
    it('should resolve absolute paths', () => {
      expect(resolvePath('/foo', '/bar')).toBe('/bar');
    });

    it('should resolve relative paths', () => {
      expect(resolvePath('/foo/bar', 'baz')).toBe('/foo/bar/baz');
    });

    it('should handle parent directory', () => {
      expect(resolvePath('/foo/bar/baz', '../qux')).toBe('/foo/bar/qux');
    });

    it('should handle current directory', () => {
      expect(resolvePath('/foo/bar', './baz')).toBe('/foo/bar/baz');
    });
  });
});
