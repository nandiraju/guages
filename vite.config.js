import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/guages/',   // GitHub Pages serves from https://nandiraju.github.io/guages/
})
