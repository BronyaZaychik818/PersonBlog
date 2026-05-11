const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    req.admin = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

module.exports = authMiddleware
