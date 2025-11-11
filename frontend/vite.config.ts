import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
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
            const destFile = join(distDir, '_redirects')
            copyFileSync(redirectsFile, destFile)
            console.log('✓ _redirects file copied to dist')
            
            // Verify the file was copied
            if (existsSync(destFile)) {
              const content = readFileSync(destFile, 'utf8')
              console.log('✓ _redirects content:', content.trim())
            }
          } else {
            console.warn('⚠ _redirects file not found in public directory')
          }
        } catch (err) {
          console.error('❌ Could not copy _redirects file:', err)
        }
      }
    }
  ],
  server: {
    host: true,
    port: 5173
  },
  build: {
    // Ensure assets are built correctly
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          socket: ['socket.io-client']
        }
      }
    },
    // Ensure sourcemaps are not included in production (can cause issues)
    sourcemap: false
  },
  publicDir: 'public'
})


