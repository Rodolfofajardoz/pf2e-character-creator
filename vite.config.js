import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages serves a project site (not a user/org site) from a
// /<repo-name>/ subpath, so every asset URL Vite generates needs that
// prefix baked in at build time.
export default defineConfig({
  plugins: [react()],
  base: '/pf2e-character-creator/',
})
