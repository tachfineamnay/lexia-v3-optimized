import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuration pour le développement
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
    },
  },
  
  // Configuration optimisée pour le déploiement statique
  base: '/', // Chemin de base pour le déploiement
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Pas de sourcemap en production pour réduire la taille
    minify: 'terser', // Minification aggressive
    
    // Optimisation des chunks
    rollupOptions: {
      output: {
        // Séparation des chunks pour un meilleur cache
        manualChunks: {
          // Libs principales React
          'react-vendor': ['react', 'react-dom'],
          // Router et navigation
          'router': ['react-router-dom'],
          // HTTP et utilitaires
          'utils': ['axios'],
          // UI et génération de documents
          'ui-libs': ['react-icons', 'docx', 'jspdf', 'file-saver'],
        },
        
        // Nommage des fichiers pour un cache optimal
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split('.').pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/css/i.test(extType)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    
    // Optimisations supplémentaires
    terserOptions: {
      compress: {
        drop_console: true, // Supprime les console.log en production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    
    // Limite de taille des chunks
    chunkSizeWarningLimit: 1000,
  },
  
  // Variables d'environnement
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  },
  
  // Optimisation des dépendances
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios']
  }
}); 