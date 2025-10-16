import { defineConfig } from 'vite';
import { resolve } from 'path';
import quantum from '@quantum/compiler/vite';

export default defineConfig({
  plugins: [quantum()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
