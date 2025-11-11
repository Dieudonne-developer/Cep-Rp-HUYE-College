import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join, extname } from 'path'
import { readFileSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// List of static file extensions that should be served as-is
const staticExtensions = ['.js', '.css', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.map', '.webp', '.avif']

// Serve static files from the dist directory
// This MUST come before the catch-all route
app.use(express.static(join(__dirname, 'dist'), {
  index: false, // Don't serve index.html automatically
  dotfiles: 'ignore',
  etag: false,
  lastModified: false
}))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'frontend' })
})

// Handle SPA routing - serve index.html for all routes that don't match static files
// This MUST be the last route handler
app.get('*', (req, res) => {
  try {
    const path = req.path
    
    // Check if this is a request for a static file by extension
    const ext = extname(path)
    if (ext && staticExtensions.includes(ext.toLowerCase())) {
      // Static file should have been served by express.static
      // If we reach here, the file doesn't exist
      return res.status(404).send('File not found')
    }
    
    // Check if the path starts with /index.html (prevent loops)
    if (path.startsWith('/index.html')) {
      // Redirect to the path without /index.html
      const cleanPath = path.replace(/^\/index\.html/, '') || '/'
      return res.redirect(301, cleanPath)
    }
    
    // For all other routes, serve index.html to enable SPA routing
    const indexPath = join(__dirname, 'dist', 'index.html')
    
    // Verify index.html exists
    if (!existsSync(indexPath)) {
      console.error('ERROR: index.html not found at:', indexPath)
      console.error('Current working directory:', process.cwd())
      console.error('__dirname:', __dirname)
      return res.status(500).send('index.html not found. Build may have failed.')
    }
    
    // Read and serve index.html
    const indexHtml = readFileSync(indexPath, 'utf8')
    
    // Set headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    
    // Send the HTML
    res.send(indexHtml)
  } catch (error) {
    console.error('ERROR serving index.html:', error)
    res.status(500).send('Internal Server Error: ' + error.message)
  }
})

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50))
  console.log(`✅ Frontend server running on port ${PORT}`)
  console.log(`📁 Serving static files from: ${join(__dirname, 'dist')}`)
  console.log(`🌐 SPA routing enabled - all routes will serve index.html`)
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`)
  
  // Verify dist directory exists
  const distPath = join(__dirname, 'dist')
  if (existsSync(distPath)) {
    console.log(`✅ dist directory exists`)
    const indexPath = join(distPath, 'index.html')
    if (existsSync(indexPath)) {
      console.log(`✅ index.html found`)
    } else {
      console.error(`❌ index.html NOT found at: ${indexPath}`)
    }
  } else {
    console.error(`❌ dist directory NOT found at: ${distPath}`)
  }
  console.log('='.repeat(50))
})
