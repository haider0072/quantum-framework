import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.test.ts', '**/dist/**', '**/node_modules/**'],
    },
  },
  resolve: {
    alias: {
      '@quantum/reactivity': path.resolve(__dirname, '../../core/reactivity/src'),
    },
  },
});
