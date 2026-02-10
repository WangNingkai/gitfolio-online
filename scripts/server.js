require('dotenv').config()
const http = require('http')
const url = require('url')
const handler = require('../api/index')

const PORT = process.env.PORT || 3000

// Check for GitHub Token
if (!process.env.PAT_1) {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  WARNING: PAT_1 is not set in your environment variables.')
  console.warn('\x1b[33m%s\x1b[0m', '   Please create a .env file based on .env.example and set your GitHub Token.')
  console.warn('\x1b[33m%s\x1b[0m', '   Requests to GitHub API will likely fail without authentication.\n')
} else {
  console.log('\x1b[32m%s\x1b[0m', '✓ GitHub Token (PAT_1) loaded successfully.\n')
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true)
  req.query = parsedUrl.query

  // Mock Express-like response methods
  res.status = (code) => {
    res.statusCode = code
    return res
  }

  res.send = (body) => {
    if (typeof body === 'object') {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(body))
    } else {
      res.end(body)
    }
  }

  // Handle request
  try {
    handler(req, res)
  } catch (error) {
    console.error(error)
    res.statusCode = 500
    res.end('Internal Server Error')
  }
})

server.listen(PORT, () => {
  console.log(`> Server running at http://localhost:${PORT}`)
  console.log(`> Example: http://localhost:${PORT}/api?username=wangningkai`)
})
