import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@quantum/reactivity': resolve(__dirname, '../../core/reactivity/src'),
      '@quantum/component/jsx-runtime': resolve(__dirname, '../../core/component/src/jsx-runtime'),
      '@quantum/component/jsx-dev-runtime': resolve(__dirname, '../../core/component/src/jsx-runtime'),
      '@quantum/component': resolve(__dirname, '../../core/component/src'),
      '@quantum/renderer': resolve(__dirname, '../../core/renderer/src'),
    },
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '@quantum/component',
  },
});
