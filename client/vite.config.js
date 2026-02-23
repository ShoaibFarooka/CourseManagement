import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  build: {
    outDir: './temp_build',
  }
});
