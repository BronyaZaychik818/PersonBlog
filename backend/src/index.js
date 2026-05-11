require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const authRoutes = require('./routes/auth')
const blogRoutes = require('./routes/blog')
const profileRoutes = require('./routes/profile')
const uploadRoutes = require('./routes/upload')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
app.use('/avatar.jpeg', express.static(path.join(__dirname, '..', 'uploads', 'avatar.jpeg')))

app.use('/api/auth', authRoutes)
app.use('/api/blog', blogRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/upload', uploadRoutes)

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

// Clean shutdown: close DB so data is flushed to disk
function shutdown() {
  console.log('\nShutting down...')
  const { close } = require('./database')
  try { close() } catch {}
  server.close(() => process.exit(0))
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('SIGHUP', shutdown)
