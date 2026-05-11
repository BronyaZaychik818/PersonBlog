const { Router } = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const mammoth = require('mammoth')
const authMiddleware = require('../middleware/auth')

const router = Router()

const upload = multer({
  dest: path.join(__dirname, '..', '..', 'uploads'),
  limits: { fileSize: 50 * 1024 * 1024 },
})

// Parse uploaded file (admin)
router.post('/parse', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })

  // Fix Chinese filename encoding
  const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8')
  const ext = path.extname(originalName).toLowerCase()
  let title = path.basename(originalName, ext)
  let content = ''

  try {
    if (ext === '.txt') {
      content = fs.readFileSync(req.file.path, 'utf-8')
    } else if (ext === '.md') {
      content = fs.readFileSync(req.file.path, 'utf-8')
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: req.file.path })
      content = result.value
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Supported: .txt, .md, .docx' })
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to parse file' })
  } finally {
    fs.unlink(req.file.path, () => {})
  }

  res.json({ title, content })
})

module.exports = router
