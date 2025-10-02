import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['antd', 'antd/es', 'rc-field-form', 'rc-util'],
    exclude: [],
  },
  ssr: {
    noExternal: ['antd', 'antd/es', 'rc-field-form', 'rc-util', 'lucide-react']
  }
});

