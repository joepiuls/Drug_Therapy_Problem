import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['antd'],
    exclude: ['lucide-react'],
  },

  ssr: {
    // ensure antd is included in SSR bundle (useful on Vercel or other server builds)
    noExternal: ['antd', 'rc-field-form', 'rc-util'] 
  }
});
