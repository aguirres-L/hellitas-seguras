import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimizaciones para producción
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    },
    // Generar source maps para debugging (deshabilitado en producción)
    sourcemap: false,
    // Optimizar el tamaño del bundle
    minify: 'terser',
    // Configuración para SPA
    outDir: 'dist',
    assetsDir: 'assets',
    // Configuración de chunks para mejor caching
    chunkSizeWarningLimit: 1000
  },
  // Configuración para desarrollo
  server: {
    port: 3000,
    open: true,
    // Habilitar acceso desde la red local
    host: '0.0.0.0',
    // Configuración para SPA en desarrollo
    historyApiFallback: true
  },
  // Configuración de alias para mejor organización
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
