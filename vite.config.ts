import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // Limite de taille de chunk avant warning (en kB)
    chunkSizeWarningLimit: 500,
    // Configuration des chunks pour meilleur caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les vendors React pour un meilleur caching
          'vendor-react': ['react', 'react-dom'],
          // Séparer idb (IndexedDB) car change rarement
          'vendor-storage': ['idb']
        }
      }
    },
    // Optimisation de la taille du bundle
    minify: 'esbuild',
    // Générer des sourcemaps pour le debugging en production
    sourcemap: false,
    // Target moderne pour réduire la taille du bundle
    target: 'es2020'
  }
})
