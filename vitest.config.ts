import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.test.ts', '**/*.spec.ts'],
    },
  },
  resolve: {
    alias: {
      '@quantum/reactivity': resolve(__dirname, './core/reactivity/src'),
      '@quantum/component': resolve(__dirname, './core/component/src'),
      '@quantum/renderer': resolve(__dirname, './core/renderer/src'),
      '@quantum/router': resolve(__dirname, './packages/router/src'),
      '@quantum/store': resolve(__dirname, './packages/store/src'),
      '@quantum/styled': resolve(__dirname, './packages/styled/src'),
    },
  },
});
