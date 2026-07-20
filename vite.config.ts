import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    strictPort: false,
    hmr: { overlay: false },
    fs: { strict: false },
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js', 'jsqr', 'qrcode'],
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
  },
});
