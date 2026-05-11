const { Router } = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../database')
const authMiddleware = require('../middleware/auth')
const { loginLimiter } = require('../middleware/rateLimiter')

const router = Router()

// Initialize admin password if not exists
const adminRow = db.prepare('SELECT id FROM admin WHERE id = 1').get()
if (!adminRow) {
  const defaultHash = bcrypt.hashSync('admin123', 10)
  db.prepare('INSERT INTO admin (id, password_hash) VALUES (1, ?)').run(defaultHash)
  console.log('Default admin account created. Password: admin123')
}

// Login
router.post('/login', loginLimiter, (req, res) => {
  const { password } = req.body
  if (!password) {
    return res.status(400).json({ error: 'Password required' })
  }
  const admin = db.prepare('SELECT password_hash FROM admin WHERE id = 1').get()
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: 'Invalid password' })
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})

// Verify token
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ valid: true })
})

// Change password (admin)
router.put('/password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password required' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' })
  }
  const admin = db.prepare('SELECT password_hash FROM admin WHERE id = 1').get()
  if (!admin || !bcrypt.compareSync(currentPassword, admin.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect' })
  }
  const newHash = bcrypt.hashSync(newPassword, 10)
  db.prepare('UPDATE admin SET password_hash = ? WHERE id = 1').run(newHash)
  res.json({ success: true })
})

module.exports = router
