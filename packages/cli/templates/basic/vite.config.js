import { defineConfig } from 'vite';
import quantum from '@quantum/compiler/vite';

export default defineConfig({
  plugins: [quantum()],
});
