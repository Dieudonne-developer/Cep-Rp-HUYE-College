import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join, extname } from 'path'
import { readFileSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// List of static file extensions that should be served as-is
const staticExtensions = ['.js', '.css', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.map']

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist'), {
  // Don't serve index.html for static file requests
  index: false,
  // Don't redirect, just serve files
  redirect: false
}))

// Handle SPA routing - serve index.html for all routes that don't match static files
// This ensures ALL client-side routes work correctly
app.get('*', (req, res, next) => {
  try {
    // Check if this is a request for a static file
    const ext = extname(req.path)
    if (staticExtensions.includes(ext)) {
      // This should have been handled by static middleware, but if not, return 404
      return res.status(404).send('File not found')
    }
    
    // Check if the path starts with /index.html (prevent loops)
    if (req.path.startsWith('/index.html')) {
      // Redirect to the path without /index.html
      const cleanPath = req.path.replace(/^\/index\.html/, '') || '/'
      return res.redirect(301, cleanPath)
    }
    
    // For all other routes, serve index.html
    const indexPath = join(__dirname, 'dist', 'index.html')
    
    // Verify index.html exists
    if (!existsSync(indexPath)) {
      console.error('index.html not found at:', indexPath)
      return res.status(500).send('index.html not found')
    }
    
    const indexHtml = readFileSync(indexPath, 'utf8')
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.send(indexHtml)
  } catch (error) {
    console.error('Error serving index.html:', error)
    res.status(500).send('Internal Server Error')
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`)
  console.log(`Serving static files from: ${join(__dirname, 'dist')}`)
  console.log('SPA routing enabled - all routes will serve index.html')
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

