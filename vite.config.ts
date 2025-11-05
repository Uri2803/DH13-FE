import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mkcert(), // Tự động tạo HTTPS certificate
  ],
  server: {
    https: true, // Bật HTTPS
    port: 5173,  // Có thể đổi nếu bị trùng
  },
});
