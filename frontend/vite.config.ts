import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-redirects',
      closeBundle() {
        // Ensure _redirects is copied to dist for Render static site SPA routing
        try {
          const publicDir = join(__dirname, 'public')
          const distDir = join(__dirname, 'dist')
          const redirectsFile = join(publicDir, '_redirects')
          
          if (existsSync(redirectsFile)) {
            if (!existsSync(distDir)) {
              mkdirSync(distDir, { recursive: true })
            }
            copyFileSync(redirectsFile, join(distDir, '_redirects'))
            console.log('✓ _redirects file copied to dist')
          } else {
            console.warn('⚠ _redirects file not found in public directory')
          }
        } catch (err) {
          console.warn('Could not copy _redirects file:', err)
        }
      }
    }
  ],
  server: {
    host: true,
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          socket: ['socket.io-client']
        }
      }
    }
  },
  publicDir: 'public'
})


