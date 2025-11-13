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
    // Use absolute paths for Vercel (default), relative for Docker
    // Vercel handles paths automatically, so we use default '/'
    // Vercel sets VERCEL=true during build, Docker uses './'
    base: process.env.VERCEL === 'true' ? '/' : './',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          socket: ['socket.io-client']
        },
        // Ensure CSS files are properly extracted
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    // Ensure sourcemaps are not included in production (can cause issues)
    sourcemap: false,
    // Ensure CSS is extracted to a separate file
    cssCodeSplit: true
  },
  publicDir: 'public'
})


