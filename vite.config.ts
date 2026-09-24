import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// base must match the GitHub Pages project-page subpath (repo slug).
// See README: "Deploying to GitHub Pages".
export default defineConfig({
  base: '/fire-and-strike/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})