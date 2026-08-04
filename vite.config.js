import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'vendor';
            }
            if (id.includes('recharts')) {
              return 'recharts';
            }
            if (id.includes('jspdf') || id.includes('xlsx') || id.includes('html2canvas')) {
              return 'export-utils';
            }
          }
        }
      }
    }
  }
});
