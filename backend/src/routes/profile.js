const { Router } = require('express')
const db = require('../database')
const authMiddleware = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = Router()

const uploadsDir = path.join(__dirname, '..', '..', 'uploads')

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase()
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

// Get profile
router.get('/', (req, res) => {
  const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get()
  res.json(profile)
})

// Update profile (admin)
router.put('/', authMiddleware, (req, res) => {
  const { username, email, github, bilibili, gitee } = req.body
  db.prepare(`
    UPDATE profile SET username = ?, email = ?, github = ?, bilibili = ?, gitee = ?
    WHERE id = 1
  `).run(
    username ?? 'Xiaodu',
    email ?? '',
    github ?? '',
    bilibili ?? '',
    gitee ?? ''
  )
  const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get()
  res.json(profile)
})

function handleUpload(fieldName) {
  return (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' })
    try {
      const ext = path.extname(req.file.originalname).toLowerCase()
      const destFile = `${fieldName}${ext}`
      const destPath = path.join(uploadsDir, destFile)
      // Remove old file if exists
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath)
      }
      fs.renameSync(req.file.path, destPath)
      const url = `/uploads/${destFile}`
      db.prepare(`UPDATE profile SET ${fieldName} = ? WHERE id = 1`).run(url)
      const result = {}
      result[fieldName] = url
      res.json(result)
    } catch (err) {
      console.error(`Error uploading ${fieldName}:`, err)
      res.status(500).json({ error: 'Upload failed' })
    }
  }
}

// Upload avatar (admin)
router.post('/avatar', authMiddleware, upload.single('avatar'), handleUpload('avatar'))

// Upload banner (admin)
router.post('/banner', authMiddleware, upload.single('banner'), handleUpload('banner'))

module.exports = router
