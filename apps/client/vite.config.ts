import path from 'path';
import { createRequire } from 'module';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const require = createRequire(import.meta.url);
const reactPath = require.resolve('react');
const reactDomPath = require.resolve('react-dom');
const reactJsxRuntimePath = require.resolve('react/jsx-runtime');
const reactJsxDevRuntimePath = require.resolve('react/jsx-dev-runtime');
const reactDomClientPath = require.resolve('react-dom/client');

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^react\/jsx-runtime$/, replacement: reactJsxRuntimePath },
      { find: /^react\/jsx-dev-runtime$/, replacement: reactJsxDevRuntimePath },
      { find: /^react-dom\/client$/, replacement: reactDomClientPath },
      { find: /^react-dom$/, replacement: reactDomPath },
      { find: /^react$/, replacement: reactPath },
      { find: '@', replacement: path.resolve('./src') },
    ],
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom/client',
    ],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**'],
  },
});
