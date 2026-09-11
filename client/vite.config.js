// ---- ตั้งค่า Vite ให้รองรับ React และกำหนดพอร์ต dev server ----
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
});
