import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/stock-price-badge.ts',
      formats: ['es']
    },
  }
})
