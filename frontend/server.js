import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist'), {
  // Don't serve index.html for static file requests
  index: false
}))

// Handle SPA routing - serve index.html for all routes that don't match static files
// This ensures ALL client-side routes work correctly
app.get('*', (req, res) => {
  try {
    const indexPath = join(__dirname, 'dist', 'index.html')
    
    // Verify index.html exists
    if (!existsSync(indexPath)) {
      console.error('index.html not found at:', indexPath)
      return res.status(500).send('index.html not found')
    }
    
    const indexHtml = readFileSync(indexPath, 'utf8')
    res.setHeader('Content-Type', 'text/html')
    res.send(indexHtml)
  } catch (error) {
    console.error('Error serving index.html:', error)
    res.status(500).send('Internal Server Error')
  }
})

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`)
  console.log(`Serving static files from: ${join(__dirname, 'dist')}`)
  console.log('SPA routing enabled - all routes will serve index.html')
})

