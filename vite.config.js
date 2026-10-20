
import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'node:fs';

// Ensure the global stylesheet is included in the root route.
function ensureRootCss() {
  return {
    name: 'ensure-root-css',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0];

      if (!file.endsWith('/src/routes/__root.jsx')) return null;

      if (/import\s+['"][^'"]*index\.css['"]/.test(code)) {
        return null;
      }

      const cssPath = path.resolve(path.dirname(file), '../index.css');

      if (!fs.existsSync(cssPath)) return null;

      return {
        code: `${code}\nimport '../index.css';\n`,
        map: null,
      };
    },
  };
}

// Remove TypeScript-only declarations from the generated JavaScript route tree.
function stripRouteTreeTypeFooter() {
  return {
    name: 'strip-route-tree-type-footer',
    transform(code, id) {
      const file = id.split('?')[0];

      if (!file.endsWith('/src/routeTree.gen.js')) return null;

      const match = /^import type .*$/m.exec(code);

      if (!match) return null;

      return {
        code: code.slice(0, match.index),
        map: null,
      };
    },
  };
}

export default defineConfig({
  plugins: [
    ensureRootCss(),
    { ...stripRouteTreeTypeFooter(), enforce: 'pre' },
    tailwindcss(),
    tanstackStart({
      router: {
        generatedRouteTree: 'routeTree.gen.js',
        disableTypes: true,
      },
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: false,
      },
    }),
    viteReact(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
    dedupe: ['react', 'react-dom'],
  },

  optimizeDeps: {
    rolldownOptions: {
      plugins: [stripRouteTreeTypeFooter()],
    },
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'framer-motion',
      '@tanstack/react-router',
      '@tanstack/react-query',
    ],
  },

  server: {
    port: 3000,
    strictPort: true,
    host: true,
    allowedHosts: true,
  },

  build: {
    outDir: '.vite-out',
    emptyOutDir: true,
  },
});
