import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // Relative asset paths: the same build works at a domain root (Vercel, Netlify)
  // and under a sub-path such as https://<user>.github.io/FocusFlow/.
  base: './',
  plugins: [react(), tailwindcss()],
  server: { port: 5180 }
})
