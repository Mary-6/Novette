import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { host: true, allowedHosts: true, proxy: { '/api': 'http://localhost:4000' } },
  preview: { host: true, allowedHosts: true },
});
