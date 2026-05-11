const { Router } = require('express')
const db = require('../database')
const authMiddleware = require('../middleware/auth')

const router = Router()

// List all blogs (admin, includes drafts)
router.get('/all', authMiddleware, (req, res) => {
  const blogs = db.prepare(`
    SELECT id, title, substr(content, 1, 200) AS summary, published, created_at, updated_at
    FROM blogs ORDER BY created_at DESC
  `).all()
  res.json(blogs)
})

// List published blogs
router.get('/list', (req, res) => {
  const blogs = db.prepare(`
    SELECT id, title, substr(content, 1, 200) AS summary, created_at, updated_at
    FROM blogs WHERE published = 1
    ORDER BY created_at DESC
  `).all()
  res.json(blogs)
})

// Search published blogs (title + content)
router.get('/search', (req, res) => {
  const q = req.query.q || ''
  if (!q.trim()) {
    return res.json([])
  }
  const keyword = `%${q.trim()}%`
  const blogs = db.prepare(`
    SELECT id, title, substr(content, 1, 200) AS summary, created_at, updated_at
    FROM blogs WHERE published = 1 AND (title LIKE ? OR content LIKE ?)
    ORDER BY created_at DESC
  `).all(keyword, keyword)
  res.json(blogs)
})

// Recent published blogs (last 30 days)
router.get('/recent', (req, res) => {
  const blogs = db.prepare(`
    SELECT id, title, substr(content, 1, 200) AS summary, created_at, updated_at
    FROM blogs WHERE published = 1
    AND created_at >= datetime('now', 'localtime', '-30 days')
    ORDER BY created_at DESC
  `).all()
  res.json(blogs)
})

// Get blog detail
router.get('/:id', (req, res) => {
  const blog = db.prepare(`
    SELECT id, title, content, published, created_at, updated_at
    FROM blogs WHERE id = ?
  `).get(req.params.id)
  if (!blog) return res.status(404).json({ error: 'Not found' })
  if (!blog.published && !req.headers.authorization) {
    return res.status(404).json({ error: 'Not found' })
  }
  res.json(blog)
})

// Create blog (admin)
router.post('/', authMiddleware, (req, res) => {
  const { title, content, published } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })
  const result = db.prepare(`
    INSERT INTO blogs (title, content, published) VALUES (?, ?, ?)
  `).run(title, content || '', published ? 1 : 0)
  const blog = db.prepare('SELECT * FROM blogs WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(blog)
})

// Update blog (admin)
router.put('/:id', authMiddleware, (req, res) => {
  const { title, content, published } = req.body
  const blog = db.prepare('SELECT id FROM blogs WHERE id = ?').get(req.params.id)
  if (!blog) return res.status(404).json({ error: 'Not found' })

  db.prepare(`
    UPDATE blogs SET title = ?, content = ?, published = ?,
    updated_at = datetime('now', 'localtime')
    WHERE id = ?
  `).run(title, content, published ? 1 : 0, req.params.id)

  const updated = db.prepare('SELECT * FROM blogs WHERE id = ?').get(req.params.id)
  res.json(updated)
})

// Delete blog (admin)
router.delete('/:id', authMiddleware, (req, res) => {
  const blog = db.prepare('SELECT id FROM blogs WHERE id = ?').get(req.params.id)
  if (!blog) return res.status(404).json({ error: 'Not found' })
  db.prepare('DELETE FROM blogs WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

module.exports = router
