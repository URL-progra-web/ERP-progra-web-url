import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~core': path.resolve(__dirname, './src/core'),
      '~users': path.resolve(__dirname, './src/features/users'),
      '~pos': path.resolve(__dirname, './src/features/pos'),
      '~inventory': path.resolve(__dirname, './src/features/inventory'),
      '~hr': path.resolve(__dirname, './src/features/hr'),
    },
  },
})
