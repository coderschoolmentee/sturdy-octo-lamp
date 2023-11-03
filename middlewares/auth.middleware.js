const jwt = require('jsonwebtoken')
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
const authMiddleware = {}

authMiddleware.loginRequired = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' })
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    req.user = decoded // Set the user object in the request
    next()
  })
}

authMiddleware.adminRequired = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

module.exports = authMiddleware
