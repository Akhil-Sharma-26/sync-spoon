import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sentryVitePlugin({
    org: "thapar-institute-of-enginee-c1",
    project: "spoon-sync"
  })],
  base: '/', // Explicitly set base path
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})