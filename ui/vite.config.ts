import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    target: 'es2020',
  },
  server: {
    // Restrict the development-server exception to controlled Manus preview subdomains.
    allowedHosts: ['.manus.computer'],
  },
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 85,
        functions: 90,
        statements: 80,
        branches: 70,
      },
    },
  },
});
